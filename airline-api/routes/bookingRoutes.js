const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  getBookingByReference,
  cancelBooking,
  payForBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createBookingValidator, bookingIdValidator } = require('../validators/bookingValidators');

router.use(protect); // كل الراوتات هنا لازم تسجيل دخول

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: إدارة الحجوزات (تسجيل دخول مطلوب لكل الراوتات)
 */

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: إنشاء حجز جديد (Transaction آمن، يمنع الحجز المزدوج)
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [flightId, seatIds, passengers]
 *             properties:
 *               flightId: { type: string }
 *               seatIds: { type: array, items: { type: string } }
 *               passengers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     fullName: { type: string }
 *                     passportNumber: { type: string }
 *                     dateOfBirth: { type: string, format: date }
 *     responses:
 *       201: { description: تم الحجز بنجاح }
 *       409: { description: تعارض - المقعد اتحجز من حد تاني في نفس اللحظة }
 */
router.post('/', createBookingValidator, validate, createBooking);

/**
 * @swagger
 * /bookings/my:
 *   get:
 *     summary: حجوزاتي (باجينيشن)
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: قائمة حجوزات المستخدم }
 */
router.get('/my', getMyBookings);

/**
 * @swagger
 * /bookings/reference/{ref}:
 *   get:
 *     summary: البحث عن حجز برقمه المرجعي
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: ref
 *         required: true
 *         schema: { type: string }
 *         example: "BK1ABC2XYZ789"
 *     responses:
 *       200: { description: بيانات الحجز }
 *       404: { description: لا يوجد حجز بهذا الرقم }
 */
router.get('/reference/:ref', getBookingByReference);

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: تفاصيل حجز واحد
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: بيانات الحجز }
 */
router.get('/:id', bookingIdValidator, validate, getBookingById);

/**
 * @swagger
 * /bookings/{id}/cancel:
 *   put:
 *     summary: إلغاء حجز (قواعد إلغاء واسترداد حسب توقيت الإقلاع)
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       200: { description: تم الإلغاء (مع نسبة استرداد إن وجدت) }
 *       400: { description: لا يمكن الإلغاء (خارج المدة المسموحة) }
 */
router.put('/:id/cancel', bookingIdValidator, validate, cancelBooking);

/**
 * @swagger
 * /bookings/{id}/pay:
 *   post:
 *     summary: محاكاة عملية دفع (Mock Payment)
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cardNumber]
 *             properties:
 *               cardNumber:
 *                 type: string
 *                 description: "أي رقم بطاقة صالح - رقم ينتهي بـ 0000 يحاكي فشل الدفع"
 *                 example: "4111111111111111"
 *     responses:
 *       200: { description: تم الدفع بنجاح }
 *       402: { description: فشلت عملية الدفع }
 */
router.post('/:id/pay', bookingIdValidator, validate, payForBooking);

module.exports = router;
