const { body, query } = require('express-validator');

const createFlightValidator = [
  body('flightNumber').trim().notEmpty().withMessage('رقم الرحلة مطلوب'),
  body('airline').trim().notEmpty().withMessage('اسم شركة الطيران مطلوب'),
  body('origin').isMongoId().withMessage('مطار المغادرة غير صالح'),
  body('destination').isMongoId().withMessage('مطار الوصول غير صالح')
    .custom((value, { req }) => {
      if (value === req.body.origin) {
        throw new Error('مطار المغادرة والوصول لا يمكن أن يكونا نفس المطار');
      }
      return true;
    }),
  body('departureTime').notEmpty().withMessage('موعد الإقلاع مطلوب').isISO8601().withMessage('صيغة تاريخ غير صحيحة')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('موعد الإقلاع لازم يكون في المستقبل');
      }
      return true;
    }),
  body('arrivalTime').notEmpty().withMessage('موعد الوصول مطلوب').isISO8601().withMessage('صيغة تاريخ غير صحيحة')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.departureTime)) {
        throw new Error('موعد الوصول لازم يكون بعد موعد الإقلاع');
      }
      return true;
    }),
  body('price.economy').isFloat({ min: 0 }).withMessage('سعر الاقتصادي لازم يكون رقم موجب'),
  body('price.business').optional().isFloat({ min: 0 }).withMessage('سعر البزنس لازم يكون رقم موجب'),
  body('price.firstClass').optional().isFloat({ min: 0 }).withMessage('سعر الفيرست كلاس لازم يكون رقم موجب'),
  body('totalSeats').isInt({ min: 1 }).withMessage('عدد المقاعد لازم يكون رقم صحيح موجب'),
];

const updateFlightValidator = [
  body('departureTime').optional().isISO8601().withMessage('صيغة تاريخ غير صحيحة'),
  body('arrivalTime').optional().isISO8601().withMessage('صيغة تاريخ غير صحيحة')
    .custom((value, { req }) => {
      if (req.body.departureTime && new Date(value) <= new Date(req.body.departureTime)) {
        throw new Error('موعد الوصول لازم يكون بعد موعد الإقلاع');
      }
      return true;
    }),
  body('price.economy').optional().isFloat({ min: 0 }).withMessage('سعر الاقتصادي لازم يكون رقم موجب'),
  body('status').optional().isIn(['scheduled', 'delayed', 'cancelled', 'completed']).withMessage('حالة رحلة غير صحيحة'),
];

const searchFlightsValidator = [
  query('date').optional().isISO8601().withMessage('صيغة تاريخ غير صحيحة'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('minPrice لازم يكون رقم موجب'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice لازم يكون رقم موجب'),
  query('page').optional().isInt({ min: 1 }).withMessage('page لازم يكون رقم صحيح موجب'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit لازم يكون بين 1 و 100'),
];

module.exports = { createFlightValidator, updateFlightValidator, searchFlightsValidator };
