const { body, param } = require('express-validator');

const createBookingValidator = [
  body('flightId').isMongoId().withMessage('رقم الرحلة غير صالح'),
  body('seatIds').isArray({ min: 1 }).withMessage('لازم تختار مقعد واحد على الأقل'),
  body('seatIds.*').isMongoId().withMessage('رقم مقعد غير صالح'),
  body('passengers').isArray({ min: 1 }).withMessage('بيانات المسافرين مطلوبة'),
  body('passengers.*.fullName').trim().notEmpty().withMessage('اسم المسافر مطلوب'),
  body('passengers.*.passportNumber').trim().notEmpty().withMessage('رقم جواز السفر مطلوب')
    .isLength({ min: 5 }).withMessage('رقم جواز السفر غير صحيح'),
  body('passengers.*.dateOfBirth').optional().isISO8601().withMessage('تاريخ الميلاد غير صحيح'),
  // عدد المسافرين لازم يساوي عدد المقاعد المختارة
  body().custom((value) => {
    if (Array.isArray(value.seatIds) && Array.isArray(value.passengers)) {
      if (value.seatIds.length !== value.passengers.length) {
        throw new Error('عدد المسافرين لازم يساوي عدد المقاعد المختارة');
      }
    }
    return true;
  }),
];

const bookingIdValidator = [param('id').isMongoId().withMessage('رقم الحجز غير صالح')];

module.exports = { createBookingValidator, bookingIdValidator };
