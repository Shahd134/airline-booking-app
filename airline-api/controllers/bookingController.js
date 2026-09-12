const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const Seat = require('../models/Seat');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const ApiFeatures = require('../utils/apiFeatures');
const {
  FREE_CANCELLATION_CUTOFF_HOURS,
  LAST_CANCELLATION_CUTOFF_HOURS,
  PARTIAL_REFUND_PERCENTAGE,
} = require('../utils/constants');

// @desc    إنشاء حجز جديد (Transaction + منع الحجز المزدوج)
// @route   POST /api/bookings
// @access  خاص
const createBooking = catchAsync(async (req, res, next) => {
  const { flightId, seatIds, passengers } = req.body;

  // منع التكرار في المقاعد المطلوبة
  const uniqueSeatIds = [...new Set(seatIds.map(String))];
  if (uniqueSeatIds.length !== seatIds.length) {
    return next(new AppError('لا يمكن اختيار نفس المقعد أكثر من مرة', 400));
  }

  const session = await mongoose.startSession();

  try {
    let populatedBooking;

    await session.withTransaction(async () => {
      const flight = await Flight.findById(flightId).session(session);
      if (!flight) {
        throw new AppError('الرحلة غير موجودة', 404);
      }

      // Business validation: منع الحجز على رحلة ملغية/مكتملة أو غادرت بالفعل
      if (['cancelled', 'completed'].includes(flight.status)) {
        throw new AppError('لا يمكن الحجز على رحلة ملغية أو منتهية', 400);
      }
      if (new Date(flight.departureTime) <= new Date()) {
        throw new AppError('لا يمكن الحجز على رحلة أقلعت بالفعل', 400);
      }

      const seats = await Seat.find({ _id: { $in: uniqueSeatIds }, flight: flightId }).session(session);
      if (seats.length !== uniqueSeatIds.length) {
        throw new AppError('بعض المقاعد غير موجودة في هذه الرحلة', 400);
      }

      // منع الحجز المزدوج (Race Condition):
      // تحديث ذري (atomic) - يعتبر ناجح بس للمقاعد اللي لسه isBooked=false وقت التنفيذ
      const updateResult = await Seat.updateMany(
        { _id: { $in: uniqueSeatIds }, flight: flightId, isBooked: false },
        { $set: { isBooked: true, bookedBy: req.user._id } },
        { session }
      );

      if (updateResult.modifiedCount !== uniqueSeatIds.length) {
        // حد تاني حجز نفس المقعد قبلنا بجزء من الثانية
        throw new AppError('عذرًا، بعض المقاعد تم حجزها للتو من مستخدم آخر. من فضلك اختر مقاعد أخرى', 409);
      }

      if (flight.availableSeats < uniqueSeatIds.length) {
        throw new AppError('لا يوجد عدد كافٍ من المقاعد المتاحة', 400);
      }

      // حساب السعر الإجمالي حسب درجة كل مقعد
      let totalPrice = 0;
      for (const seat of seats) {
        totalPrice += flight.price[seat.class] ?? flight.price.economy;
      }

      flight.availableSeats -= uniqueSeatIds.length;
      await flight.save({ session });

      const [booking] = await Booking.create(
        [
          {
            user: req.user._id,
            flight: flightId,
            seats: uniqueSeatIds,
            passengers,
            totalPrice,
            status: 'pending',
          },
        ],
        { session }
      );

      populatedBooking = await Booking.findById(booking._id)
        .populate('flight')
        .populate('seats')
        .session(session);
    });

    res.status(201).json({ success: true, data: populatedBooking });
  } finally {
    session.endSession();
  }
});

// @desc    جلب حجوزات المستخدم الحالي (مع باجينيشن)
// @route   GET /api/bookings/my
// @access  خاص
const getMyBookings = catchAsync(async (req, res) => {
  const baseQuery = Booking.find({ user: req.user._id }).populate('flight').populate('seats');

  const features = new ApiFeatures(baseQuery, req.query).filter().sort().paginate();
  const bookings = await features.query;
  const total = await Booking.countDocuments({ user: req.user._id });

  res.status(200).json({
    success: true,
    count: bookings.length,
    total,
    page: features.page,
    pages: Math.ceil(total / features.limit),
    data: bookings,
  });
});

// @desc    جلب حجز واحد بالتفصيل
// @route   GET /api/bookings/:id
// @access  خاص
const getBookingById = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id).populate('flight').populate('seats');

  if (!booking) {
    return next(new AppError('الحجز غير موجود', 404));
  }

  if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('غير مصرح لك برؤية هذا الحجز', 403));
  }

  res.status(200).json({ success: true, data: booking });
});

// @desc    البحث عن حجز برقمه المرجعي
// @route   GET /api/bookings/reference/:ref
// @access  خاص
const getBookingByReference = catchAsync(async (req, res, next) => {
  const booking = await Booking.findOne({ bookingReference: req.params.ref })
    .populate('flight')
    .populate('seats');

  if (!booking) {
    return next(new AppError('لا يوجد حجز بهذا الرقم المرجعي', 404));
  }

  if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('غير مصرح لك برؤية هذا الحجز', 403));
  }

  res.status(200).json({ success: true, data: booking });
});

// @desc    إلغاء حجز (بقواعد إلغاء أذكى)
// @route   PUT /api/bookings/:id/cancel
// @access  خاص
const cancelBooking = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    let responseData;
    let responseMessage;

    await session.withTransaction(async () => {
      const booking = await Booking.findById(req.params.id).populate('flight').session(session);

      if (!booking) {
        throw new AppError('الحجز غير موجود', 404);
      }

      if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new AppError('غير مصرح لك بإلغاء هذا الحجز', 403);
      }

      if (booking.status === 'cancelled') {
        throw new AppError('الحجز ملغي بالفعل', 400);
      }
      if (booking.status === 'completed') {
        throw new AppError('لا يمكن إلغاء حجز مكتمل', 400);
      }

      const hoursUntilDeparture = (new Date(booking.flight.departureTime) - new Date()) / 36e5;

      // قاعدة الإلغاء: ممنوع الإلغاء لو أقل من آخر موعد مسموح به (إلا لو أدمن)
      if (hoursUntilDeparture < LAST_CANCELLATION_CUTOFF_HOURS && req.user.role !== 'admin') {
        throw new AppError(
          `لا يمكن إلغاء الحجز قبل أقل من ${LAST_CANCELLATION_CUTOFF_HOURS} ساعات من موعد الإقلاع`,
          400
        );
      }

      // تحديد نسبة الاسترداد حسب توقيت الإلغاء
      let refundPercentage = 0;
      if (booking.paymentStatus === 'paid') {
        refundPercentage = hoursUntilDeparture >= FREE_CANCELLATION_CUTOFF_HOURS ? 100 : PARTIAL_REFUND_PERCENTAGE;
      }

      booking.status = 'cancelled';
      booking.cancelledAt = new Date();
      booking.cancellationReason = req.body.reason || 'لم يُذكر سبب';
      if (booking.paymentStatus === 'paid' && refundPercentage > 0) {
        booking.paymentStatus = 'refunded';
      }
      await booking.save({ session });

      // تحرير المقاعد
      await Seat.updateMany(
        { _id: { $in: booking.seats } },
        { $set: { isBooked: false, bookedBy: null } },
        { session }
      );

      // إرجاع المقاعد لعدد المقاعد المتاحة في الرحلة
      await Flight.findByIdAndUpdate(
        booking.flight._id,
        { $inc: { availableSeats: booking.seats.length } },
        { session }
      );

      responseData = booking;
      responseMessage =
        refundPercentage > 0
          ? `تم إلغاء الحجز، هيتم استرداد ${refundPercentage}% من المبلغ`
          : 'تم إلغاء الحجز بنجاح';
    });

    res.status(200).json({ success: true, message: responseMessage, data: responseData });
  } finally {
    session.endSession();
  }
});

// @desc    محاكاة عملية دفع (Mock Payment)
// @route   POST /api/bookings/:id/pay
// @access  خاص
const payForBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id).populate('flight');

  if (!booking) {
    return next(new AppError('الحجز غير موجود', 404));
  }
  if (booking.user.toString() !== req.user._id.toString()) {
    return next(new AppError('غير مصرح لك بالدفع لهذا الحجز', 403));
  }
  if (booking.status === 'cancelled') {
    return next(new AppError('لا يمكن الدفع لحجز ملغي', 400));
  }
  if (booking.paymentStatus === 'paid') {
    return next(new AppError('تم الدفع لهذا الحجز بالفعل', 400));
  }

  const { cardNumber } = req.body;
  if (!cardNumber || !/^\d{12,19}$/.test(cardNumber.replace(/\s/g, ''))) {
    return next(new AppError('رقم بطاقة غير صالح', 400));
  }

  // محاكاة بوابة دفع: أي رقم بطاقة ينتهي بـ 0000 يفشل (لتجربة سيناريو الفشل)
  const isSuccessful = !cardNumber.replace(/\s/g, '').endsWith('0000');

  if (!isSuccessful) {
    booking.paymentStatus = 'failed';
    await booking.save();
    return next(new AppError('فشلت عملية الدفع، من فضلك جرب بطاقة أخرى', 402));
  }

  booking.paymentStatus = 'paid';
  booking.status = 'confirmed';
  booking.paymentTransactionId = 'TXN' + Date.now().toString(36).toUpperCase();
  await booking.save();

  res.status(200).json({
    success: true,
    message: 'تم الدفع بنجاح',
    data: { transactionId: booking.paymentTransactionId, booking },
  });
});

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  getBookingByReference,
  cancelBooking,
  payForBooking,
};
