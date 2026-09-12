const AppError = require('../utils/AppError');

// لازم يتشغل بعد authMiddleware.protect علشان req.user يكون موجود
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  next(new AppError('مسموح للأدمن فقط', 403));
};

module.exports = { admin };
