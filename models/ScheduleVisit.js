const mongoose = require('mongoose');

const scheduleVisitSchema = new mongoose.Schema({
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
    phone: {
        type: String,
        trim: true,
        match: [/^\d{10}$/, 'Phone number must be exactly 10 digits']
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please fill a valid email address']
    },
    mode: {
        type: String,
        enum: ['physical', 'virtual'],
        required: true
    },
    propertyName: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('scheduleVisit', scheduleVisitSchema);