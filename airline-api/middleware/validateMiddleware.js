const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

// بيتحط بعد أي مجموعة validators في الراوت، ويوقف الطلب لو فيه أخطاء
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return next(new AppError(messages.join(' | '), 400));
  }
  next();
};

module.exports = validate;
