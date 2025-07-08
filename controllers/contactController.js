const { validationResult } = require('express-validator');
const ContactMessage = require('../models/ContactForm');

const submitContactForm = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
        });
    }

    try {
        const contactMessage = await ContactMessage.create(req.body);
        return res.status(201).json({
            success: true,
            data: contactMessage,
        });
    } catch (error) {
        console.error('Error saving contact message:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};

const getAllContactMessages = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const skip = (page - 1) * limit;

        const searchRegex = new RegExp(search, 'i');

        const filters = search
            ? {
                $or: [
                    { fullName: searchRegex },
                    { email: searchRegex },
                    { mobileNumber: searchRegex },
                    { message: searchRegex },
                ],
            }
            : {};

        const [total, messages] = await Promise.all([
            ContactMessage.countDocuments(filters),
            ContactMessage.find(filters)
                .sort({ createdAt: -1 })
                .skip(parseInt(skip))
                .limit(parseInt(limit)),
        ]);

        return res.status(200).json({
            success: true,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            data: messages,
        });
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};
  

const getContactMessageById = async (req, res) => {
    try {
        const message = await ContactMessage.findById(req.params.id);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found',
            });
        }
        return res.status(200).json({
            success: true,
            data: message,
        });
    } catch (error) {
        console.error('Error fetching contact message:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};

const deleteContactMessageById = async (req, res) => {
    try {
        const deleted = await ContactMessage.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Message not found',
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Message deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting contact message:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};

module.exports = {
    submitContactForm,
    getAllContactMessages,
    getContactMessageById,
    deleteContactMessageById,
};
