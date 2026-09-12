const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    flight: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flight',
      required: true,
    },
    seats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seat',
        required: true,
      },
    ],
    passengers: [
      {
        fullName: { type: String, required: true },
        passportNumber: { type: String, required: true },
        dateOfBirth: { type: Date },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded', 'failed'],
      default: 'unpaid',
    },
    paymentTransactionId: {
      type: String,
      default: null,
    },
    bookingReference: {
      type: String,
      unique: true,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancellationReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ bookingReference: 1 });
bookingSchema.index({ user: 1, status: 1 });

// توليد رقم مرجعي فريد للحجز قبل الحفظ
bookingSchema.pre('save', function (next) {
  if (!this.bookingReference) {
    this.bookingReference =
      'BK' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 1000);
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
