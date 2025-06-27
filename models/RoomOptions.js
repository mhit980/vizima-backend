const mongoose = require('mongoose');

const RoomOptionSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  roomType: {
    type: String,
    enum: ['single', 'double', 'triple'],
    required: true,
  },
  monthlyRent: {
    type: Number,
    required: true,
  },
  securityDeposit: {
    type: Number,
    required: true,
  },
  acType: {
    type: String,
    enum: ['AC', 'Non-AC'],
    required: true,
  },
  mealsIncluded: {
    type: Boolean,
    required: true,
  },
  bookingUrl: {
    type: String,
    default: null, // optional CTA if you want to dynamically set the URL
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('RoomOption', RoomOptionSchema);
