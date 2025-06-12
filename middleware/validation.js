const { body, param, query, validationResult } = require('express-validator');

// Helper function to handle validation results
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// Auth Validations
const validateRegister = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),

    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

    body('phone')
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),

    body('role')
        .optional()
        .isIn(['user', 'owner', 'admin'])
        .withMessage('Role must be either user, owner, or admin'),

    handleValidationErrors
];

const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),

    handleValidationErrors
];

const validateUpdateProfile = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),

    body('phone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),

    body('preferences')
        .optional()
        .isObject()
        .withMessage('Preferences must be an object'),

    handleValidationErrors
];

const validateForgotPassword = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),

    handleValidationErrors
];

const validateResetPassword = [
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

    param('token')
        .notEmpty()
        .withMessage('Reset token is required'),

    handleValidationErrors
];

// Password Change Validation (ADDED)
const validatePasswordChange = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),

    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),

    handleValidationErrors
];

// Property Validations
const validateProperty = [
    body('title')
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage('Title must be between 5 and 100 characters'),

    body('description')
        .trim()
        .isLength({ min: 20, max: 1000 })
        .withMessage('Description must be between 20 and 1000 characters'),

    body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),

    body('location.address')
        .trim()
        .isLength({ min: 10, max: 200 })
        .withMessage('Address must be between 10 and 200 characters'),

    body('location.city')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('City must be between 2 and 50 characters'),

    body('location.state')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('State must be between 2 and 50 characters'),

    body('location.country')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Country must be between 2 and 50 characters'),

    body('location.zipCode')
        .matches(/^[0-9]{5,10}$/)
        .withMessage('Zip code must be 5-10 digits'),

    body('location.coordinates.lat')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),

    body('location.coordinates.lng')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),

    body('type')
        .isIn(['apartment', 'house', 'condo', 'studio', 'villa', 'townhouse'])
        .withMessage('Property type must be one of: apartment, house, condo, studio, villa, townhouse'),

    body('bedrooms')
        .isInt({ min: 0, max: 20 })
        .withMessage('Bedrooms must be between 0 and 20'),

    body('bathrooms')
        .isInt({ min: 1, max: 20 })
        .withMessage('Bathrooms must be between 1 and 20'),

    body('area')
        .isFloat({ min: 1 })
        .withMessage('Area must be a positive number'),

    body('amenities')
        .optional()
        .isArray()
        .withMessage('Amenities must be an array'),

    body('amenities.*')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Each amenity must be between 2 and 50 characters'),

    body('isAvailable')
        .optional()
        .isBoolean()
        .withMessage('isAvailable must be a boolean'),

    body('furnished')
        .optional()
        .isIn(['fully', 'semi', 'unfurnished'])
        .withMessage('Furnished status must be: fully, semi, or unfurnished'),

    body('petPolicy')
        .optional()
        .isIn(['allowed', 'not-allowed', 'negotiable'])
        .withMessage('Pet policy must be: allowed, not-allowed, or negotiable'),

    handleValidationErrors
];

const validatePropertyUpdate = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage('Title must be between 5 and 100 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ min: 20, max: 1000 })
        .withMessage('Description must be between 20 and 1000 characters'),

    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),

    body('isAvailable')
        .optional()
        .isBoolean()
        .withMessage('isAvailable must be a boolean'),

    param('id')
        .isMongoId()
        .withMessage('Please provide a valid property ID'),

    handleValidationErrors
];

// Booking Validations
const validateBooking = [
    body('property')
        .isMongoId()
        .withMessage('Please provide a valid property ID'),

    body('startDate')
        .isISO8601()
        .withMessage('Please provide a valid start date')
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error('Start date must be in the future');
            }
            return true;
        }),

    body('endDate')
        .isISO8601()
        .withMessage('Please provide a valid end date')
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.startDate)) {
                throw new Error('End date must be after start date');
            }
            return true;
        }),

    body('guests')
        .isInt({ min: 1, max: 20 })
        .withMessage('Number of guests must be between 1 and 20'),

    body('totalAmount')
        .isFloat({ min: 0 })
        .withMessage('Total amount must be a positive number'),

    body('specialRequests')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Special requests cannot exceed 500 characters'),

    handleValidationErrors
];

const validateBookingUpdate = [
    body('status')
        .optional()
        .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
        .withMessage('Status must be: pending, confirmed, cancelled, or completed'),

    param('id')
        .isMongoId()
        .withMessage('Please provide a valid booking ID'),

    handleValidationErrors
];

// Banner Validations
const validateBanner = [
    body('title')
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage('Title must be between 5 and 100 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),

    body('link')
        .optional()
        .isURL()
        .withMessage('Please provide a valid URL'),

    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean'),

    body('order')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Order must be a positive integer'),

    handleValidationErrors
];

// User Management Validations
const validateUserUpdate = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),

    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),

    body('role')
        .optional()
        .isIn(['user', 'owner', 'admin'])
        .withMessage('Role must be either user, owner, or admin'),

    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean'),

    param('id')
        .isMongoId()
        .withMessage('Please provide a valid user ID'),

    handleValidationErrors
];

// Query Validations
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),

    query('sort')
        .optional()
        .isIn(['createdAt', '-createdAt', 'price', '-price', 'title', '-title'])
        .withMessage('Invalid sort parameter'),

    handleValidationErrors
];

const validatePropertySearch = [
    query('city')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('City must be between 2 and 50 characters'),

    query('type')
        .optional()
        .isIn(['apartment', 'house', 'condo', 'studio', 'villa', 'townhouse'])
        .withMessage('Invalid property type'),

    query('minPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Minimum price must be a positive number'),

    query('maxPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Maximum price must be a positive number')
        .custom((value, { req }) => {
            if (req.query.minPrice && parseFloat(value) < parseFloat(req.query.minPrice)) {
                throw new Error('Maximum price must be greater than minimum price');
            }
            return true;
        }),

    query('bedrooms')
        .optional()
        .isInt({ min: 0, max: 20 })
        .withMessage('Bedrooms must be between 0 and 20'),

    query('bathrooms')
        .optional()
        .isInt({ min: 1, max: 20 })
        .withMessage('Bathrooms must be between 1 and 20'),

    ...validatePagination
];

// Parameter Validations
const validateMongoId = [
    param('id')
        .isMongoId()
        .withMessage('Please provide a valid ID'),

    handleValidationErrors
];

const validateToken = [
    param('token')
        .notEmpty()
        .withMessage('Token is required')
        .isLength({ min: 10 })
        .withMessage('Invalid token format'),

    handleValidationErrors
];

// Contact/Support Validations
const validateContact = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),

    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),

    body('subject')
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage('Subject must be between 5 and 100 characters'),

    body('message')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Message must be between 10 and 1000 characters'),

    handleValidationErrors
];

module.exports = {
    // Auth validations
    validateRegister,
    validateLogin,
    validateUpdateProfile,
    validateForgotPassword,
    validateResetPassword,
    validatePasswordChange, // ADDED THIS

    // Property validations
    validateProperty,
    validatePropertyUpdate,
    validatePropertySearch,

    // Booking validations
    validateBooking,
    validateBookingUpdate,

    // Banner validations
    validateBanner,

    // User management validations
    validateUserUpdate,

    // Query validations
    validatePagination,

    // Parameter validations
    validateMongoId,
    validateToken,

    // Contact validations
    validateContact,

    // Helper function
    handleValidationErrors
};