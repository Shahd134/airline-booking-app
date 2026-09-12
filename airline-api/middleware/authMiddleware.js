const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// يتأكد إن المستخدم عامل تسجيل دخول (عنده توكن صحيح)
const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('غير مصرح، لا يوجد توكن', 401));
  }

  // jwt.verify بيرمي خطأ يتلقفه الـ error middleware المركزي (JsonWebTokenError/TokenExpiredError)
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded.id).select('-password');

  if (!req.user) {
    return next(new AppError('المستخدم غير موجود', 401));
  }

  if (!req.user.isActive) {
    return next(new AppError('الحساب موقوف', 403));
  }

  next();
});

module.exports = { protect };
