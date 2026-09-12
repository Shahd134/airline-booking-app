const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema(
  {
    flightNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    airline: {
      type: String,
      required: true,
      trim: true,
    },
    origin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Airport',
      required: true,
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Airport',
      required: true,
    },
    departureTime: {
      type: Date,
      required: true,
    },
    arrivalTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // بالدقايق
    },
    price: {
      economy: { type: Number, required: true },
      business: { type: Number, default: 0 },
      firstClass: { type: Number, default: 0 },
    },
    totalSeats: {
      type: Number,
      required: true,
    },
    availableSeats: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'delayed', 'cancelled', 'completed'],
      default: 'scheduled',
    },
    gate: {
      type: String,
    },
  },
  { timestamps: true }
);

flightSchema.index({ origin: 1, destination: 1, departureTime: 1 });
flightSchema.index({ flightNumber: 'text', airline: 'text' });

// تحقق منطقي: موعد الوصول لازم يكون بعد موعد الإقلاع
flightSchema.pre('validate', function (next) {
  if (this.departureTime && this.arrivalTime && this.arrivalTime <= this.departureTime) {
    return next(new Error('موعد الوصول لازم يكون بعد موعد الإقلاع'));
  }
  // حساب مدة الرحلة تلقائيًا بالدقايق
  if (this.departureTime && this.arrivalTime) {
    this.duration = Math.round((this.arrivalTime - this.departureTime) / 60000);
  }
  next();
});

module.exports = mongoose.model('Flight', flightSchema);
