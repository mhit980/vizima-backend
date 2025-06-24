const mongoose = require('mongoose');

const visitBookingSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    timeSlot: {
        type: String,
        required: false,
        enum: [
            '9:00 AM',
            '9:30 AM',
            '10:00 AM',
            '10:30 AM',
            '11:00 AM',
            '11:30 AM',
            '12:00 PM',
            '12:30 PM',
            '1:00 PM',
            '1:30 PM',
            '2:00 PM',
            '2:30 PM',
            '3:00 PM',
            '3:30 PM',
            '4:00 PM',
            '4:30 PM',
            '5:00 PM',
            '5:30 PM'
        ]
    },
    mode: {
        type: String,
        required: true,
        enum: ['physical', 'virtual']
    },
    description: {
        type: String,
        maxlength: 1000
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('VisitBooking', visitBookingSchema);
