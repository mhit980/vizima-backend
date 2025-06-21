const { validationResult } = require('express-validator');
const ContactMessage = require('../models/ContactForm');

const submitContactForm = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }

    try {
        const contactMessage = await ContactMessage.create(req.body);
        return res.status(201).json({
            success: true,
            data: contactMessage
        });
    } catch (error) {
        console.error('Error saving contact message:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};


module.exports = {
    submitContactForm,
};