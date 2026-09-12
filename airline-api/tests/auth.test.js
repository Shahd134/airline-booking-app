const request = require('supertest');
const app = require('../server');

describe('Auth API', () => {
  const userPayload = {
    name: 'Test User',
    email: 'test@example.com',
    password: '123456',
  };

  describe('POST /api/auth/register', () => {
    it('يسجل مستخدم جديد بنجاح', async () => {
      const res = await request(app).post('/api/auth/register').send(userPayload);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.email).toBe(userPayload.email);
    });

    it('يرفض التسجيل ببريد مستخدم بالفعل', async () => {
      await request(app).post('/api/auth/register').send(userPayload);
      const res = await request(app).post('/api/auth/register').send(userPayload);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('يرفض التسجيل ببيانات ناقصة', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'x@x.com' });
      expect(res.statusCode).toBe(400);
    });

    it('يرفض كلمة مرور أقل من 6 أحرف', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...userPayload, password: '123' });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(userPayload);
    });

    it('يسجل الدخول بنجاح ببيانات صحيحة', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: userPayload.email, password: userPayload.password });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('token');
    });

    it('يرفض تسجيل الدخول بباسورد غلط', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: userPayload.email, password: 'wrongpass' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('يرفض الوصول من غير توكن', async () => {
      const res = await request(app).get('/api/auth/profile');
      expect(res.statusCode).toBe(401);
    });

    it('يرجع بيانات البروفايل بتوكن صحيح', async () => {
      const registerRes = await request(app).post('/api/auth/register').send(userPayload);
      const token = registerRes.body.data.token;

      const res = await request(app).get('/api/auth/profile').set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.email).toBe(userPayload.email);
    });
  });
});
