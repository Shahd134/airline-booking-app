const AppError = require('../utils/AppError');

// تحويل أخطاء Mongoose المعروفة لرسائل مفهومة بالعربي
const handleCastErrorDB = (err) => {
  return new AppError(`قيمة غير صالحة لـ ${err.path}: ${err.value}`, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0];
  const value = err.keyValue ? err.keyValue[field] : '';
  return new AppError(`القيمة "${value}" مستخدمة بالفعل في الحقل "${field}"`, 400);
};

const handleValidationErrorDB = (err) => {
  const messages = Object.values(err.errors).map((el) => el.message);
  return new AppError(`بيانات غير صحيحة: ${messages.join('. ')}`, 400);
};

const handleJWTError = () => new AppError('توكن غير صالح، من فضلك سجل الدخول تاني', 401);
const handleJWTExpiredError = () => new AppError('انتهت صلاحية الجلسة، من فضلك سجل الدخول تاني', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    success: false,
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  } else {
    // خطأ برمجي غير متوقع - ميتبعتش تفاصيله للمستخدم
    console.error('💥 خطأ غير متوقع:', err);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في السيرفر',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
    return;
  }

  let error = Object.assign(Object.create(Object.getPrototypeOf(err)), err);
  error.message = err.message;

  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  sendErrorProd(error, res);
};
