const ContactNumber = require('../models/ContactNumber');
const AppError = require('../utils/appError');

// Helper function to format Indian phone number
const formatIndianPhoneNumber = (number) => {
    try {
        // Remove all non-digit characters
        const cleaned = ('' + number).replace(/\D/g, '');

        // Check if it's a valid Indian mobile number
        const indianMobileRegex = /^[6-9]\d{9}$/;
        if (!indianMobileRegex.test(cleaned)) {
            throw new AppError('Please provide a valid 10-digit Indian mobile number', 400);
        }

        return cleaned;
    } catch (error) {
        throw new AppError(error.message || 'Invalid phone number format', error.statusCode || 400);
    }
};

/**
 * @desc    Get all contact numbers
 * @route   GET /api/contact-numbers
 * @access  Private/Admin
 */
exports.getAllContactNumbers = async (req, res, next) => {
    try {
        const contactNumbers = await ContactNumber.find({}).sort({ order: 1 });

        res.status(200).json({
            status: 'success',
            results: contactNumbers.length,
            data: {
                contactNumbers
            }
        });
    } catch (error) {
        next(new AppError(error.message || 'Failed to fetch contact numbers', error.statusCode || 500));
    }
};

/**
 * @desc    Get active contact numbers for public use
 * @route   GET /api/contact-numbers/active
 * @access  Public
 */
exports.getActiveContactNumbers = async (req, res, next) => {
    try {
        const contactNumbers = await ContactNumber.getActiveContactNumbers();

        res.status(200).json({
            status: 'success',
            results: contactNumbers.length,
            data: {
                contactNumbers
            }
        });
    } catch (error) {
        next(new AppError(error.message || 'Failed to fetch active contact numbers', error.statusCode || 500));
    }
};

/**
 * @desc    Create a new contact number
 * @route   POST /api/contact-numbers
 * @access  Private/Admin
 */
exports.createContactNumber = async (req, res, next) => {
    try {
        // Format and validate the phone number
        const phoneNumberData = { ...req.body };
        if (phoneNumberData.number) {
            phoneNumberData.number = formatIndianPhoneNumber(phoneNumberData.number);
        }

        const newContactNumber = await ContactNumber.create(phoneNumberData);

        res.status(201).json({
            status: 'success',
            data: {
                contactNumber: newContactNumber
            }
        });
    } catch (error) {
        next(new AppError(
            error.message || 'Failed to create contact number',
            error.statusCode || 400,
            error.errors ? Object.values(error.errors).map(el => el.message) : undefined
        ));
    }
};

/**
 * @desc    Update a contact number
 * @route   PATCH /api/contact-numbers/:id
 * @access  Private/Admin
 */
exports.updateContactNumber = async (req, res, next) => {
    try {
        // Format and validate the phone number if it's being updated
        const updateData = { ...req.body };
        if (updateData.number) {
            updateData.number = formatIndianPhoneNumber(updateData.number);
        }

        const contactNumber = await ContactNumber.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true,
                context: 'query'
            }
        );

        if (!contactNumber) {
            return next(new AppError('No contact number found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                contactNumber
            }
        });
    } catch (error) {
        next(new AppError(
            error.message || 'Failed to update contact number',
            error.statusCode || 400,
            error.errors ? Object.values(error.errors).map(el => el.message) : undefined
        ));
    }
};

/**
 * @desc    Delete a contact number
 * @route   DELETE /api/contact-numbers/:id
 * @access  Private/Admin
 */
exports.deleteContactNumber = async (req, res, next) => {
    try {
        const contactNumber = await ContactNumber.findByIdAndDelete(req.params.id);

        if (!contactNumber) {
            return next(new AppError('No contact number found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            message: 'Contact number deleted successfully'
        });
    } catch (error) {
        next(new AppError(
            error.message || 'Failed to delete contact number',
            error.statusCode || 500
        ));
    }
};

/**
 * @desc    Get contact number by ID
 * @route   GET /api/contact-numbers/:id
 * @access  Private/Admin
 */
exports.getContactNumber = async (req, res, next) => {
    try {
        const contactNumber = await ContactNumber.findById(req.params.id);

        if (!contactNumber) {
            return next(new AppError('No contact number found with that ID', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                contactNumber
            }
        });
    } catch (error) {
        next(new AppError(
            error.message || 'Failed to fetch contact number',
            error.statusCode || 500
        ));
    }
};
