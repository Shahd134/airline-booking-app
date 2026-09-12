const express = require('express');
const router = express.Router();
const {
  getFlights,
  getFlightById,
  createFlight,
  updateFlight,
  deleteFlight,
} = require('../controllers/flightController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  createFlightValidator,
  updateFlightValidator,
  searchFlightsValidator,
} = require('../validators/flightValidators');

/**
 * @swagger
 * tags:
 *   name: Flights
 *   description: البحث عن الرحلات وإدارتها
 */

/**
 * @swagger
 * /flights:
 *   get:
 *     summary: بحث/عرض الرحلات (فلاتر + ترتيب + باجينيشن)
 *     tags: [Flights]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: origin
 *         schema: { type: string }
 *         description: ObjectId لمطار المغادرة
 *       - in: query
 *         name: destination
 *         schema: { type: string }
 *         description: ObjectId لمطار الوصول
 *       - in: query
 *         name: date
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: airline
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: بحث حر في رقم الرحلة/اسم شركة الطيران
 *       - in: query
 *         name: sort
 *         schema: { type: string }
 *         example: "price.economy,-departureTime"
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: قائمة الرحلات مع بيانات الباجينيشن }
 *   post:
 *     summary: إنشاء رحلة جديدة (أدمن فقط)
 *     tags: [Flights]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [flightNumber, airline, origin, destination, departureTime, arrivalTime, price, totalSeats]
 *             properties:
 *               flightNumber: { type: string, example: "MS101" }
 *               airline: { type: string, example: "EgyptAir" }
 *               origin: { type: string, description: "Airport ObjectId" }
 *               destination: { type: string, description: "Airport ObjectId" }
 *               departureTime: { type: string, format: date-time }
 *               arrivalTime: { type: string, format: date-time }
 *               price:
 *                 type: object
 *                 properties:
 *                   economy: { type: number, example: 1500 }
 *                   business: { type: number, example: 4000 }
 *               totalSeats: { type: integer, example: 180 }
 *     responses:
 *       201: { description: تم إنشاء الرحلة }
 *       400: { description: بيانات غير صحيحة }
 */
router.get('/', searchFlightsValidator, validate, getFlights);
router.post('/', protect, admin, createFlightValidator, validate, createFlight);

/**
 * @swagger
 * /flights/{id}:
 *   get:
 *     summary: تفاصيل رحلة واحدة
 *     tags: [Flights]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: بيانات الرحلة }
 *       404: { description: الرحلة غير موجودة }
 *   put:
 *     summary: تعديل رحلة (أدمن فقط)
 *     tags: [Flights]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: تم التعديل }
 *   delete:
 *     summary: حذف رحلة (أدمن فقط، ممنوع لو فيها حجوزات نشطة)
 *     tags: [Flights]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: تم الحذف }
 *       400: { description: لا يمكن الحذف لوجود حجوزات نشطة }
 */
router.get('/:id', getFlightById);
router.put('/:id', protect, admin, updateFlightValidator, validate, updateFlight);
router.delete('/:id', protect, admin, deleteFlight);

module.exports = router;
