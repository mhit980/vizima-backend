const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    name: { type: String, required: true },
    picture: { type: String, required: true }, // store image URL or base64
    city: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    status: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'pending' },
    isApproved: {
        type: Boolean,
        default: false,
    },
    order: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);