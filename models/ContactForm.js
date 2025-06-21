const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email address']
    },
    mobileNumber: {
        type: String,
        required: [true, 'Mobile number is required'],
        match: [/^\+91\s\d{5}\s\d{5}$/, 'Please enter a valid Indian mobile number']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        maxlength: [1000, 'Message cannot exceed 1000 characters']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
