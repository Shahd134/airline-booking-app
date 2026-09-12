const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { registerValidator, loginValidator } = require('../validators/authValidators');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: تسجيل الدخول وإدارة الحساب
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: تسجيل مستخدم جديد
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: "Ahmed Ali" }
 *               email: { type: string, example: "ahmed@example.com" }
 *               password: { type: string, example: "123456" }
 *               phone: { type: string, example: "+201234567890" }
 *     responses:
 *       201: { description: تم إنشاء الحساب بنجاح }
 *       400: { description: بيانات غير صحيحة }
 */
router.post('/register', registerValidator, validate, registerUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: تسجيل الدخول
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "ahmed@example.com" }
 *               password: { type: string, example: "123456" }
 *     responses:
 *       200: { description: تم تسجيل الدخول بنجاح ويرجع JWT token }
 *       401: { description: بيانات الدخول غير صحيحة }
 */
router.post('/login', loginValidator, validate, loginUser);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: بيانات البروفايل الخاص بالمستخدم الحالي
 *     tags: [Auth]
 *     responses:
 *       200: { description: بيانات المستخدم }
 *       401: { description: غير مصرح }
 *   put:
 *     summary: تحديث بيانات البروفايل
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: تم التحديث بنجاح }
 */
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
