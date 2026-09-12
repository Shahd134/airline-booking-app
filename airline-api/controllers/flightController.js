const Flight = require('../models/Flight');
const Seat = require('../models/Seat');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const ApiFeatures = require('../utils/apiFeatures');

// @desc    جلب/بحث الرحلات (فلاتر + ترتيب + باجينيشن)
// @route   GET /api/flights
// @access  عام
// فلاتر: origin, destination, date, minPrice, maxPrice, airline, status
// ترتيب: sort=price.economy,-departureTime
// نص حر: search=EG101  (يبحث في رقم الرحلة/شركة الطيران)
const getFlights = catchAsync(async (req, res) => {
  const { origin, destination, date, minPrice, maxPrice, airline, status, search } = req.query;
  const filter = {};

  if (origin) filter.origin = origin;
  if (destination) filter.destination = destination;
  if (airline) filter.airline = { $regex: airline, $options: 'i' };
  if (status) filter.status = status;

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    filter.departureTime = { $gte: start, $lte: end };
  }

  if (minPrice || maxPrice) {
    filter['price.economy'] = {};
    if (minPrice) filter['price.economy'].$gte = Number(minPrice);
    if (maxPrice) filter['price.economy'].$lte = Number(maxPrice);
  }

  if (search) {
    filter.$or = [
      { flightNumber: { $regex: search, $options: 'i' } },
      { airline: { $regex: search, $options: 'i' } },
    ];
  }

  const baseQuery = Flight.find(filter)
    .populate('origin', 'code name city country')
    .populate('destination', 'code name city country');

  // من غير query.page/limit/sort/fields/search علشان مايتكررش فلترة
  const features = new ApiFeatures(baseQuery, req.query).sort().limitFields().paginate();
  const flights = await features.query;
  const total = await Flight.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: flights.length,
    total,
    page: features.page,
    pages: Math.ceil(total / features.limit) || 1,
    data: flights,
  });
});

// @desc    جلب رحلة واحدة بالتفصيل
// @route   GET /api/flights/:id
// @access  عام
const getFlightById = catchAsync(async (req, res, next) => {
  const flight = await Flight.findById(req.params.id)
    .populate('origin', 'code name city country')
    .populate('destination', 'code name city country');

  if (!flight) {
    return next(new AppError('الرحلة غير موجودة', 404));
  }

  res.status(200).json({ success: true, data: flight });
});

// @desc    إنشاء رحلة جديدة
// @route   POST /api/flights
// @access  خاص/أدمن
const createFlight = catchAsync(async (req, res, next) => {
  const existing = await Flight.findOne({ flightNumber: req.body.flightNumber });
  if (existing) {
    return next(new AppError('رقم الرحلة مستخدم بالفعل', 400));
  }

  const flight = await Flight.create({
    ...req.body,
    availableSeats: req.body.totalSeats,
  });

  res.status(201).json({ success: true, data: flight });
});

// @desc    تحديث بيانات رحلة
// @route   PUT /api/flights/:id
// @access  خاص/أدمن
const updateFlight = catchAsync(async (req, res, next) => {
  const flight = await Flight.findById(req.params.id);
  if (!flight) {
    return next(new AppError('الرحلة غير موجودة', 404));
  }

  // منع تقليل totalSeats لأقل من عدد المقاعد المحجوزة فعليًا
  if (req.body.totalSeats !== undefined) {
    const bookedCount = await Seat.countDocuments({ flight: flight._id, isBooked: true });
    if (req.body.totalSeats < bookedCount) {
      return next(
        new AppError(`لا يمكن تقليل عدد المقاعد لأقل من عدد المقاعد المحجوزة حاليًا (${bookedCount})`, 400)
      );
    }
  }

  Object.assign(flight, req.body);
  await flight.save();

  res.status(200).json({ success: true, data: flight });
});

// @desc    حذف رحلة
// @route   DELETE /api/flights/:id
// @access  خاص/أدمن
const deleteFlight = catchAsync(async (req, res, next) => {
  const flight = await Flight.findById(req.params.id);

  if (!flight) {
    return next(new AppError('الرحلة غير موجودة', 404));
  }

  const bookedCount = await Seat.countDocuments({ flight: flight._id, isBooked: true });
  if (bookedCount > 0) {
    return next(new AppError('لا يمكن حذف رحلة لها حجوزات نشطة، قم بإلغائها بدلًا من ذلك', 400));
  }

  await Seat.deleteMany({ flight: flight._id });
  await flight.deleteOne();

  res.status(200).json({ success: true, message: 'تم حذف الرحلة بنجاح' });
});

module.exports = { getFlights, getFlightById, createFlight, updateFlight, deleteFlight };
