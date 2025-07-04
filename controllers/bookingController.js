const Booking = require('../models/Booking');
const Property = require('../models/Property');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
    try {
        const {
            property,
            checkIn,
            checkOut,
            guests,
            totalAmount,
            specialRequests,
            contactInfo,
            paymentMethod,
            fullName,
            phoneNumber,
            email,
            gender,
            sharing,
            scheduleDate
        } = req.body;

        // Validate property exists
        const propertyExists = await Property.findById(property);
        if (!propertyExists) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        // Check if property is active
        if (!propertyExists.isAvailable) {
            return res.status(400).json({
                success: false,
                message: 'Property is not available for booking'
            });
        }

        // Validate guest count against property capacity
        if (guests > propertyExists.maxGuests) {
            return res.status(400).json({
                success: false,
                message: `Property can accommodate maximum ${propertyExists.maxGuests} guests`
            });
        }

        // Check availability
        const isAvailable = await Booking.checkAvailability(property, new Date(checkIn), new Date(checkOut));
        if (!isAvailable) {
            return res.status(400).json({
                success: false,
                message: 'Property is not available for the selected dates'
            });
        }

        // Create booking
        const booking = await Booking.create({
            property,
            user: req.user.id,
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
            guests,
            totalAmount,
            fullName,
            phoneNumber,
            email,
            gender,
            sharing,
            scheduleDate: new Date(scheduleDate),
            specialRequests,
            contactInfo,
            paymentMethod: paymentMethod || 'credit_card'
        });

        // Populate booking details
        await booking.populate([
            { path: 'property', select: 'title location price images' },
            { path: 'user', select: 'name email phone' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking
        });

    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating booking',
            error: error.message
        });
    }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings/admin
// @access  Private/Admin
const getAllBookings = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};

        // Add filters based on query parameters
        if (req.query.status) {
            filter.status = req.query.status;
        }
        if (req.query.paymentStatus) {
            filter.paymentStatus = req.query.paymentStatus;
        }

        // Search on fullName, phoneNumber, email if search is provided
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            filter.$or = [
                { fullName: searchRegex },
                { phoneNumber: searchRegex },
                { email: searchRegex }
            ];
        }

        const bookings = await Booking.find(filter)
            .populate('property', 'title location price')
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Booking.countDocuments(filter);

        res.json({
            success: true,
            data: bookings,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalBookings: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Get all bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching bookings',
            error: error.message
        });
    }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getUserBookings = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = { user: req.user.id };

        if (req.query.status) {
            filter.status = req.query.status;
        }

        const bookings = await Booking.find(filter)
            .populate('property', 'title location price images')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Booking.countDocuments(filter);

        res.json({
            success: true,
            data: bookings,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalBookings: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Get user bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching your bookings',
            error: error.message
        });
    }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('property', 'title location price images amenities')
            .populate('user', 'name email phone');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user owns this booking or is admin
        if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this booking'
            });
        }

        res.json({
            success: true,
            data: booking
        });

    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching booking',
            error: error.message
        });
    }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
const updateBooking = async (req, res) => {
    try {
        let booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user owns this booking or is admin
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this booking'
            });
        }

        // Don't allow updates to confirmed or completed bookings unless admin
        if (['confirmed', 'completed'].includes(booking.status) && req.user.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Cannot update confirmed or completed bookings'
            });
        }

        // If updating dates, check availability
        if (req.body.checkIn || req.body.checkOut) {
            const checkIn = req.body.checkIn ? new Date(req.body.checkIn) : booking.checkIn;
            const checkOut = req.body.checkOut ? new Date(req.body.checkOut) : booking.checkOut;

            const isAvailable = await Booking.checkAvailability(
                booking.property,
                checkIn,
                checkOut,
                booking._id
            );

            if (!isAvailable) {
                return res.status(400).json({
                    success: false,
                    message: 'Property is not available for the selected dates'
                });
            }
        }

        // Update booking
        booking = await Booking.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate([
            { path: 'property', select: 'title location price images' },
            { path: 'user', select: 'name email phone' }
        ]);

        res.json({
            success: true,
            message: 'Booking updated successfully',
            data: booking
        });

    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating booking',
            error: error.message
        });
    }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user owns this booking or is admin
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking'
            });
        }

        // Don't allow cancellation of already cancelled or completed bookings
        if (['cancelled', 'completed'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel ${booking.status} booking`
            });
        }

        // Calculate refund amount
        const refundAmount = booking.calculateRefund();

        // Update booking
        booking.status = 'cancelled';
        booking.cancellationReason = req.body.cancellationReason || 'Cancelled by user';
        booking.refundAmount = refundAmount;

        if (refundAmount > 0) {
            booking.paymentStatus = 'refunded';
        }

        await booking.save();

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            data: {
                booking,
                refundAmount
            }
        });

    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while cancelling booking',
            error: error.message
        });
    }
};

// @desc    Confirm booking (Admin only)
// @route   PUT /api/bookings/:id/confirm
// @access  Private/Admin
const confirmBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (booking.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Only pending bookings can be confirmed'
            });
        }

        booking.status = 'confirmed';
        await booking.save();

        await booking.populate([
            { path: 'property', select: 'title location price' },
            { path: 'user', select: 'name email phone' }
        ]);

        res.json({
            success: true,
            message: 'Booking confirmed successfully',
            data: booking
        });

    } catch (error) {
        console.error('Confirm booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while confirming booking',
            error: error.message
        });
    }
};

// @desc    Check availability
// @route   POST /api/bookings/check-availability
// @access  Public
const checkAvailability = async (req, res) => {
    try {
        const { propertyId, checkIn, checkOut } = req.body;

        if (!propertyId || !checkIn || !checkOut) {
            return res.status(400).json({
                success: false,
                message: 'Property ID, check-in and check-out dates are required'
            });
        }

        // Validate property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        const isAvailable = await Booking.checkAvailability(
            propertyId,
            new Date(checkIn),
            new Date(checkOut)
        );

        res.json({
            success: true,
            data: {
                available: isAvailable,
                property: {
                    id: property._id,
                    title: property.title,
                    price: property.price,
                    maxGuests: property.maxGuests
                }
            }
        });

    } catch (error) {
        console.error('Check availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while checking availability',
            error: error.message
        });
    }
};

// @desc    Get booking statistics (Admin only)
// @route   GET /api/bookings/admin/stats
// @access  Private/Admin
const getBookingStats = async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const pendingBookings = await Booking.countDocuments({ status: 'pending' });
        const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
        const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
        const completedBookings = await Booking.countDocuments({ status: 'completed' });

        // Calculate total revenue
        const revenueResult = await Booking.aggregate([
            { $match: { status: { $in: ['confirmed', 'completed'] } } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
        ]);

        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        // Recent bookings
        const recentBookings = await Booking.find()
            .populate('property', 'title location')
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            data: {
                totalBookings,
                pendingBookings,
                confirmedBookings,
                cancelledBookings,
                completedBookings,
                totalRevenue,
                recentBookings
            }
        });

    } catch (error) {
        console.error('Get booking stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching booking statistics',
            error: error.message
        });
    }
};

module.exports = {
    createBooking,
    getAllBookings,
    getUserBookings,
    getBooking,
    updateBooking,
    cancelBooking,
    confirmBooking,
    checkAvailability,
    getBookingStats
};