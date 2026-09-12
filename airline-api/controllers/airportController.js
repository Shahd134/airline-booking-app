const Airport = require('../models/Airport');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// @desc    جلب كل المطارات
// @route   GET /api/airports
// @access  عام
const getAirports = catchAsync(async (req, res) => {
  const airports = await Airport.find().sort({ city: 1 });
  res.status(200).json({ success: true, count: airports.length, data: airports });
});

// @desc    إنشاء مطار جديد
// @route   POST /api/airports
// @access  خاص/أدمن
const createAirport = catchAsync(async (req, res, next) => {
  const existing = await Airport.findOne({ code: req.body.code?.toUpperCase() });
  if (existing) {
    return next(new AppError('كود المطار مستخدم بالفعل', 400));
  }
  const airport = await Airport.create(req.body);
  res.status(201).json({ success: true, data: airport });
});

module.exports = { getAirports, createAirport };
