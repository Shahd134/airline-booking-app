const { body } = require('express-validator');

const registerValidator = [
  body('name').trim().notEmpty().withMessage('الاسم مطلوب').isLength({ min: 2 }).withMessage('الاسم قصير جدًا'),
  body('email').trim().notEmpty().withMessage('البريد الإلكتروني مطلوب').isEmail().withMessage('صيغة البريد غير صحيحة').normalizeEmail(),
  body('password').notEmpty().withMessage('كلمة المرور مطلوبة').isLength({ min: 6 }).withMessage('كلمة المرور 6 أحرف على الأقل'),
  body('phone').optional().isMobilePhone().withMessage('رقم الهاتف غير صحيح'),
];

const loginValidator = [
  body('email').trim().notEmpty().withMessage('البريد الإلكتروني مطلوب').isEmail().withMessage('صيغة البريد غير صحيحة'),
  body('password').notEmpty().withMessage('كلمة المرور مطلوبة'),
];

module.exports = { registerValidator, loginValidator };
