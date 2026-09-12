const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

dotenv.config();

const connectDB = require('./config/db');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middleware/errorMiddleware');
const swaggerSpec = require('./config/swagger');

const app = express();

// Middlewares عامة
// CORS: في الإنتاج بنسمح بس لدومين الفرونت إند المحدد في FRONTEND_URL (ممكن أكتر من دومين مفصولين بفاصلة)
// في التطوير، من غير FRONTEND_URL بيسمح لأي origin عشان يسهل التجربة محليًا
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((o) => o.trim())
  : null;

app.use(
  cors({
    origin: (origin, callback) => {
      // طلبات من غير origin (Postman, curl, server-to-server) بتتسمح دايمًا
      if (!origin || !allowedOrigins) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// توثيق Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// الراوتات
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/flights', require('./routes/flightRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/seats', require('./routes/seatRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/airports', require('./routes/airportRoutes'));

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Airline API is running 🚀', docs: '/api-docs' });
});

// معالجة الراوتات غير الموجودة
app.all('*', (req, res, next) => {
  next(new AppError(`المسار ${req.originalUrl} غير موجود`, 404));
});

// معالج الأخطاء المركزي (لازم يكون آخر middleware)
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

let server;
if (require.main === module) {
  // الاتصال بقاعدة البيانات (بس لما السيرفر يتشغل مباشرة، مش لما يتعمله require من التستات)
  connectDB();

  server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 API docs available at http://localhost:${PORT}/api-docs`);
  });

  // التعامل مع أي رفض Promise غير متوقع بدون ما السيرفر يقع فجأة
  process.on('unhandledRejection', (err) => {
    console.error('💥 Unhandled Rejection:', err.message);
    server.close(() => process.exit(1));
  });
}

module.exports = app; // لتشغيل اختبارات Supertest
