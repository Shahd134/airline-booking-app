const request = require('supertest');
const app = require('../server');
const Airport = require('../models/Airport');
const Flight = require('../models/Flight');
const Seat = require('../models/Seat');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const makeToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

const setupFlightWithSeats = async (departureOffsetHours = 72) => {
  const origin = await Airport.create({ code: 'CAI', name: 'Cairo', city: 'Cairo', country: 'Egypt' });
  const destination = await Airport.create({ code: 'DXB', name: 'Dubai', city: 'Dubai', country: 'UAE' });

  const flight = await Flight.create({
    flightNumber: 'MS100',
    airline: 'EgyptAir',
    origin: origin._id,
    destination: destination._id,
    departureTime: new Date(Date.now() + departureOffsetHours * 60 * 60 * 1000),
    arrivalTime: new Date(Date.now() + departureOffsetHours * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
    price: { economy: 1000, business: 2000 },
    totalSeats: 10,
    availableSeats: 10,
  });

  const seats = await Seat.insertMany(
    Array.from({ length: 10 }, (_, i) => ({
      flight: flight._id,
      seatNumber: `${i + 1}A`,
      class: 'economy',
    }))
  );

  return { flight, seats };
};

describe('Booking API', () => {
  let user, token, flight, seats;

  beforeEach(async () => {
    user = await User.create({ name: 'Passenger', email: 'p@example.com', password: '123456' });
    token = makeToken(user._id);
    const setup = await setupFlightWithSeats();
    flight = setup.flight;
    seats = setup.seats;
  });

  const bookingPayload = (seatIds) => ({
    flightId: flight._id.toString(),
    seatIds,
    passengers: seatIds.map((_, i) => ({
      fullName: `Passenger ${i + 1}`,
      passportNumber: `A1234567${i}`,
    })),
  });

  it('ينشئ حجز بنجاح لمقعد متاح', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(bookingPayload([seats[0]._id.toString()]));

    expect(res.statusCode).toBe(201);
    expect(res.body.data.status).toBe('pending');

    const updatedFlight = await Flight.findById(flight._id);
    expect(updatedFlight.availableSeats).toBe(9);
  });

  it('يرفض الحجز لو عدد المسافرين مايساويش عدد المقاعد', async () => {
    const payload = bookingPayload([seats[0]._id.toString(), seats[1]._id.toString()]);
    payload.passengers = [payload.passengers[0]]; // مسافر واحد بس لمقعدين

    const res = await request(app).post('/api/bookings').set('Authorization', `Bearer ${token}`).send(payload);
    expect(res.statusCode).toBe(400);
  });

  it('يمنع حجز نفس المقعد مرتين (Race Condition)', async () => {
    const seatId = seats[0]._id.toString();

    // إرسال طلبين متزامنين لنفس المقعد
    const [res1, res2] = await Promise.all([
      request(app).post('/api/bookings').set('Authorization', `Bearer ${token}`).send(bookingPayload([seatId])),
      request(app).post('/api/bookings').set('Authorization', `Bearer ${token}`).send(bookingPayload([seatId])),
    ]);

    const statusCodes = [res1.statusCode, res2.statusCode].sort();
    // واحد بس لازم ينجح (201) والتاني يرفض (409)
    expect(statusCodes).toEqual([201, 409]);

    const seatAfter = await Seat.findById(seatId);
    expect(seatAfter.isBooked).toBe(true);

    const updatedFlight = await Flight.findById(flight._id);
    expect(updatedFlight.availableSeats).toBe(9); // اتخصم مرة واحدة بس
  }, 15000);

  it('يرفض الحجز على رحلة أقلعت بالفعل', async () => {
    const past = await setupFlightWithSeats(-2); // رحلة أقلعت من ساعتين
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        flightId: past.flight._id.toString(),
        seatIds: [past.seats[0]._id.toString()],
        passengers: [{ fullName: 'Test', passportNumber: 'A1234567' }],
      });

    expect(res.statusCode).toBe(400);
  });

  describe('إلغاء الحجز', () => {
    it('يسمح بالإلغاء لو الرحلة بعد أكتر من 24 ساعة', async () => {
      const bookRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(bookingPayload([seats[0]._id.toString()]));

      const bookingId = bookRes.body.data._id;

      const cancelRes = await request(app)
        .put(`/api/bookings/${bookingId}/cancel`)
        .set('Authorization', `Bearer ${token}`)
        .send({ reason: 'تغيير خطة السفر' });

      expect(cancelRes.statusCode).toBe(200);
      expect(cancelRes.body.data.status).toBe('cancelled');

      const seatAfter = await Seat.findById(seats[0]._id);
      expect(seatAfter.isBooked).toBe(false);
    });

    it('يمنع الإلغاء لو الرحلة هتقلع خلال أقل من 3 ساعات', async () => {
      const soon = await setupFlightWithSeats(2); // رحلة هتقلع بعد ساعتين
      const bookRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          flightId: soon.flight._id.toString(),
          seatIds: [soon.seats[0]._id.toString()],
          passengers: [{ fullName: 'Test', passportNumber: 'A1234567' }],
        });

      const cancelRes = await request(app)
        .put(`/api/bookings/${bookRes.body.data._id}/cancel`)
        .set('Authorization', `Bearer ${token}`)
        .send();

      expect(cancelRes.statusCode).toBe(400);
    });
  });

  describe('الدفع (Mock Payment)', () => {
    it('ينجح الدفع برقم بطاقة عادي', async () => {
      const bookRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(bookingPayload([seats[0]._id.toString()]));

      const payRes = await request(app)
        .post(`/api/bookings/${bookRes.body.data._id}/pay`)
        .set('Authorization', `Bearer ${token}`)
        .send({ cardNumber: '4111111111111111' });

      expect(payRes.statusCode).toBe(200);
      expect(payRes.body.data.booking.paymentStatus).toBe('paid');
    });

    it('يفشل الدفع برقم بطاقة ينتهي بـ 0000', async () => {
      const bookRes = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(bookingPayload([seats[0]._id.toString()]));

      const payRes = await request(app)
        .post(`/api/bookings/${bookRes.body.data._id}/pay`)
        .set('Authorization', `Bearer ${token}`)
        .send({ cardNumber: '4111111110000' });

      expect(payRes.statusCode).toBe(402);
    });
  });
});
