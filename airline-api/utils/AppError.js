// كلاس مخصص للأخطاء التشغيلية (اللي احنا متوقعينها زي "غير موجود"، "بيانات خطأ"، إلخ)
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // بنميزها عن أخطاء البرمجة الغير متوقعة

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
