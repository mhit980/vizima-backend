const mongoose = require('mongoose');

const visitBookingSchema = new mongoose.Schema({
    
    date: {
        type: Date,
        required: true,
        default: Date.now
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
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'unisex']
    },
    sharing: {
        type: String,
        enum: ['single', 'double', 'triple']
    },
    propertyName: {
        type: String
    },
    fullName: {
        type: String,
        trim: true,
        maxlength: 100
    },
    phoneNumber: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                // Basic phone number validation (adjust regex as needed)
                return /^[0-9]{10,15}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                // Basic email validation
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('VisitBooking', visitBookingSchema);
