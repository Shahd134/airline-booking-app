const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Airline Booking API',
      version: '1.0.0',
      description:
        'REST API كامل لنظام حجز طيران: مستخدمين، رحلات، مقاعد، حجوزات، دفع (Mock)، ولوحة تحكم أدمن.',
      contact: { name: 'Airline API' },
    },
    servers: [
      { url: process.env.API_URL || 'http://localhost:5000/api', description: process.env.API_URL ? 'Production' : 'Local server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'رسالة الخطأ' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'], // فين swagger-jsdoc يدور على الـ @swagger comments
};

module.exports = swaggerJSDoc(options);
