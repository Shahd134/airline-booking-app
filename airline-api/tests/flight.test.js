const request = require('supertest');
const app = require('../server');
const Airport = require('../models/Airport');

const createUserAndToken = async (role = 'user') => {
  const User = require('../models/User');
  const user = await User.create({
    name: 'Tester',
    email: `${role}@example.com`,
    password: '123456',
    role,
  });
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return { user, token };
};

describe('Flight API', () => {
  let origin, destination;

  beforeEach(async () => {
    origin = await Airport.create({ code: 'CAI', name: 'Cairo Airport', city: 'Cairo', country: 'Egypt' });
    destination = await Airport.create({ code: 'DXB', name: 'Dubai Airport', city: 'Dubai', country: 'UAE' });
  });

  const validFlightPayload = () => ({
    flightNumber: 'MS100',
    airline: 'EgyptAir',
    origin: origin._id.toString(),
    destination: destination._id.toString(),
    departureTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    arrivalTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    price: { economy: 1500, business: 3500 },
    totalSeats: 30,
  });

  describe('POST /api/flights', () => {
    it('يرفض إنشاء رحلة من مستخدم عادي', async () => {
      const { token } = await createUserAndToken('user');
      const res = await request(app)
        .post('/api/flights')
        .set('Authorization', `Bearer ${token}`)
        .send(validFlightPayload());

      expect(res.statusCode).toBe(403);
    });

    it('يسمح للأدمن بإنشاء رحلة صحيحة', async () => {
      const { token } = await createUserAndToken('admin');
      const res = await request(app)
        .post('/api/flights')
        .set('Authorization', `Bearer ${token}`)
        .send(validFlightPayload());

      expect(res.statusCode).toBe(201);
      expect(res.body.data.flightNumber).toBe('MS100');
    });

    it('يرفض رحلة بموعد وصول قبل موعد الإقلاع', async () => {
      const { token } = await createUserAndToken('admin');
      const payload = validFlightPayload();
      payload.arrivalTime = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(); // قبل الإقلاع

      const res = await request(app)
        .post('/api/flights')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.statusCode).toBe(400);
    });

    it('يرفض رحلة بموعد إقلاع في الماضي', async () => {
      const { token } = await createUserAndToken('admin');
      const payload = validFlightPayload();
      payload.departureTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const res = await request(app)
        .post('/api/flights')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/flights', () => {
    it('يرجع قائمة الرحلات مع الباجينيشن', async () => {
      const { token } = await createUserAndToken('admin');
      await request(app).post('/api/flights').set('Authorization', `Bearer ${token}`).send(validFlightPayload());

      const res = await request(app).get('/api/flights');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('pages');
    });

    it('يفلتر الرحلات حسب shركة الطيران', async () => {
      const { token } = await createUserAndToken('admin');
      await request(app).post('/api/flights').set('Authorization', `Bearer ${token}`).send(validFlightPayload());

      const res = await request(app).get('/api/flights?airline=EgyptAir');
      expect(res.statusCode).toBe(200);
      expect(res.body.count).toBeGreaterThanOrEqual(1);
    });
  });
});
