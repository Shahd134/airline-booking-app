const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    flight: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flight',
      required: true,
    },
    seatNumber: {
      type: String, // e.g. "12A"
      required: true,
      trim: true,
    },
    class: {
      type: String,
      enum: ['economy', 'business', 'firstClass'],
      default: 'economy',
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// كل مقعد يبقى فريد جوه رحلة معينة
seatSchema.index({ flight: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);
