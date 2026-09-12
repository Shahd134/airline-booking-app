const Seat = require('../models/Seat');
const Flight = require('../models/Flight');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// @desc    عرض كل المقاعد الخاصة برحلة معينة (خريطة المقاعد)
// @route   GET /api/seats/flight/:flightId
// @access  عام
const getSeatsByFlight = catchAsync(async (req, res) => {
  const seats = await Seat.find({ flight: req.params.flightId }).sort({ seatNumber: 1 });
  res.status(200).json({ success: true, count: seats.length, data: seats });
});

// @desc    توليد المقاعد تلقائيًا لرحلة (أدمن فقط)
// @route   POST /api/seats/generate/:flightId
// @access  خاص/أدمن
// body: { rows: 20, seatsPerRow: ['A','B','C','D','E','F'], businessRows: 3 }
const generateSeats = catchAsync(async (req, res, next) => {
  const flight = await Flight.findById(req.params.flightId);
  if (!flight) {
    return next(new AppError('الرحلة غير موجودة', 404));
  }

  const { rows = 20, seatsPerRow = ['A', 'B', 'C', 'D', 'E', 'F'], businessRows = 0 } = req.body;

  if (rows < 1 || businessRows < 0 || businessRows > rows) {
    return next(new AppError('بيانات توليد المقاعد غير صحيحة', 400));
  }

  const existing = await Seat.countDocuments({ flight: flight._id });
  if (existing > 0) {
    return next(new AppError('المقاعد موجودة بالفعل لهذه الرحلة', 400));
  }

  const seatsToCreate = [];
  for (let row = 1; row <= rows; row++) {
    for (const letter of seatsPerRow) {
      seatsToCreate.push({
        flight: flight._id,
        seatNumber: `${row}${letter}`,
        class: row <= businessRows ? 'business' : 'economy',
      });
    }
  }

  const createdSeats = await Seat.insertMany(seatsToCreate);

  flight.totalSeats = createdSeats.length;
  flight.availableSeats = createdSeats.length;
  await flight.save();

  res.status(201).json({ success: true, count: createdSeats.length, data: createdSeats });
});

// @desc    تحديث حالة مقعد (صيانة / إتاحة)
// @route   PUT /api/seats/:id
// @access  خاص/أدمن
const updateSeat = catchAsync(async (req, res, next) => {
  const seat = await Seat.findById(req.params.id);
  if (!seat) {
    return next(new AppError('المقعد غير موجود', 404));
  }

  // متاح، بحكم إن مقعد "محجوز" لازم يتغير عن طريق نظام الحجز مش تعديل مباشر
  if (req.body.isBooked !== undefined && seat.isBooked !== req.body.isBooked && seat.bookedBy) {
    return next(new AppError('لا يمكن تعديل حالة مقعد مرتبط بحجز نشط مباشرة، ألغِ الحجز أولًا', 400));
  }

  Object.assign(seat, req.body);
  await seat.save();

  res.status(200).json({ success: true, data: seat });
});

module.exports = { getSeatsByFlight, generateSeats, updateSeat };
