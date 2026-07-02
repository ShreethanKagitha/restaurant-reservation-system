const mongoose = require('mongoose');
const { TABLE_STATUS } = require('../config/constants');

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: String,
      required: [true, 'Table number is required'],
      unique: true,
      trim: true,
      index: true
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      index: true // Indexed capacity for quick size matching
    },
    status: {
      type: String,
      enum: Object.values(TABLE_STATUS),
      default: TABLE_STATUS.AVAILABLE,
      required: true,
      index: true
    },
    location: {
      type: String,
      trim: true,
      default: '' // Optional description e.g., 'Patio', 'Window', 'Main Hall'
    }
  },
  {
    timestamps: true
  }
);

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;
