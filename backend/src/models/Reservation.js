const mongoose = require('mongoose');
const { RESERVATION_STATUS } = require('../config/constants');

const reservationSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer reference is required'],
      index: true
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Table',
      required: [true, 'Table reference is required'],
      index: true
    },
    reservationDate: {
      type: Date,
      required: [true, 'Reservation date is required'],
      index: true
    },
    startTime: {
      type: Date,
      required: [true, 'Reservation start time is required']
    },
    endTime: {
      type: Date,
      required: [true, 'Reservation end time is required']
    },
    guestCount: {
      type: Number,
      required: [true, 'Guest count is required'],
      min: [1, 'Must have at least 1 guest']
    },
    reservationStatus: {
      type: String,
      enum: Object.values(RESERVATION_STATUS),
      default: RESERVATION_STATUS.PENDING,
      required: true,
      index: true
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    isDeleted: {
      type: Boolean,
      default: false,
      required: true,
      index: true
    },
    deletedAt: {
      type: Date,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Optimize reservation lookup and prevent duplicate table bookings for the same time window
// Partial index to allow soft-deleted duplicates but enforce uniqueness on active ones
reservationSchema.index(
  { table: 1, startTime: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

// Compound index for date-based lookups and queries filtering out soft-deleted items
reservationSchema.index({ reservationDate: 1, isDeleted: 1 });
reservationSchema.index({ customer: 1, isDeleted: 1 });
reservationSchema.index({ startTime: 1, endTime: 1, isDeleted: 1 });

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
