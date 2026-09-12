const User = require('../models/User');
const Flight = require('../models/Flight');
const Booking = require('../models/Booking');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const ApiFeatures = require('../utils/apiFeatures');

// @desc    إحصائيات عامة للوحة تحكم الأدمن
// @route   GET /api/admin/dashboard
// @access  خاص/أدمن
const getDashboardStats = catchAsync(async (req, res) => {
  const [
    totalUsers,
    totalFlights,
    totalBookings,
    revenueAgg,
    bookingsByStatus,
    revenueByMonth,
    topRoutes,
    topAirlines,
  ] = await Promise.all([
    User.countDocuments(),
    Flight.countDocuments(),
    Booking.countDocuments(),

    // إجمالي الإيرادات من الحجوزات المدفوعة/المكتملة
    Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),

    // توزيع الحجوزات حسب الحالة
    Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),

    // الإيرادات شهريًا (آخر 12 شهر)
    Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]),

    // أكثر 5 خطوط سيرًا حجزًا
    Booking.aggregate([
      {
        $lookup: { from: 'flights', localField: 'flight', foreignField: '_id', as: 'flightInfo' },
      },
      { $unwind: '$flightInfo' },
      {
        $group: {
          _id: { origin: '$flightInfo.origin', destination: '$flightInfo.destination' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: { from: 'airports', localField: '_id.origin', foreignField: '_id', as: 'originInfo' },
      },
      {
        $lookup: {
          from: 'airports',
          localField: '_id.destination',
          foreignField: '_id',
          as: 'destinationInfo',
        },
      },
      {
        $project: {
          _id: 0,
          count: 1,
          origin: { $arrayElemAt: ['$originInfo.code', 0] },
          destination: { $arrayElemAt: ['$destinationInfo.code', 0] },
        },
      },
    ]),

    // أكثر شركات الطيران حجزًا
    Flight.aggregate([
      {
        $lookup: { from: 'bookings', localField: '_id', foreignField: 'flight', as: 'bookings' },
      },
      { $project: { airline: 1, bookingsCount: { $size: '$bookings' } } },
      { $group: { _id: '$airline', totalBookings: { $sum: '$bookingsCount' } } },
      { $sort: { totalBookings: -1 } },
      { $limit: 5 },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalFlights,
      totalBookings,
      totalRevenue: revenueAgg[0]?.total || 0,
      bookingsByStatus,
      revenueByMonth,
      topRoutes,
      topAirlines,
    },
  });
});

// @desc    جلب كل المستخدمين (باجينيشن)
// @route   GET /api/admin/users
// @access  خاص/أدمن
const getAllUsers = catchAsync(async (req, res) => {
  const features = new ApiFeatures(User.find(), req.query).filter().sort().limitFields().paginate();
  const users = await features.query;
  const total = await User.countDocuments();

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: features.page,
    pages: Math.ceil(total / features.limit),
    data: users,
  });
});

// @desc    تفعيل/إيقاف مستخدم أو تغيير دوره
// @route   PUT /api/admin/users/:id
// @access  خاص/أدمن
const updateUserByAdmin = catchAsync(async (req, res, next) => {
  const { role, isActive } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('المستخدم غير موجود', 404));
  }

  if (role) user.role = role;
  if (typeof isActive === 'boolean') user.isActive = isActive;

  await user.save();

  res.status(200).json({ success: true, data: user });
});

// @desc    جلب كل الحجوزات في النظام (باجينيشن + فلاتر)
// @route   GET /api/admin/bookings
// @access  خاص/أدمن
const getAllBookings = catchAsync(async (req, res) => {
  const baseQuery = Booking.find().populate('user', 'name email').populate('flight');

  const features = new ApiFeatures(baseQuery, req.query).filter().sort().paginate();
  const bookings = await features.query;
  const total = await Booking.countDocuments();

  res.status(200).json({
    success: true,
    count: bookings.length,
    total,
    page: features.page,
    pages: Math.ceil(total / features.limit),
    data: bookings,
  });
});

module.exports = { getDashboardStats, getAllUsers, updateUserByAdmin, getAllBookings };
