
const Property = require('../models/Property');
const { validationResult } = require('express-validator');
const VisitBooking = require('../models/VisitBooking');

/**
 * @desc    Get all PG and Hostel listings with search and filters
 * @route   GET /api/home/pg-hostel
 * @access  Public
 */

const getAllPgHostel = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            gender
        } = req.query;

        const query = {
            type: { $in: ['pg', 'hostel'] } // Only pg or hostel
        };

        // Filter by gender
        if (gender) {
            const allowedGenders = ['male', 'female', 'unisex'];
            if (!allowedGenders.includes(gender.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid gender filter'
                });
            }
            query.gender = gender.toLowerCase();
        }

        // Location search (excluding coordinates)
        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { 'location.address': regex },
                { 'location.city': regex },
                { 'location.state': regex },
                { 'location.zipCode': regex }
            ];
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const properties = await Property.find(query)
            .populate('owner', 'name email phone')
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 });

        const total = await Property.countDocuments(query);

        return res.status(200).json({
            success: true,
            count: properties.length,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            },
            data: { properties }
        });

    } catch (error) {
        console.error('PG/Hostel location search error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};



const bookVisit = async (req, res) => {
    try {
        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { date, timeSlot, mode, description, propertyId } = req.body;

        // Check if property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        // Create booking
        const booking = new VisitBooking({
            propertyId,
            userId: req.user.id, // Assumes user is authenticated and ID is attached
            date,
            timeSlot,
            mode,
            description
        });

        await booking.save();

        // Optionally, push the booking to user's and property's arrays
        // await User.findByIdAndUpdate(req.user.id, { $push: { visitBookings: booking._id } });
        // await Property.findByIdAndUpdate(propertyId, { $push: { visitBookings: booking._id } });

        return res.status(201).json({
            success: true,
            message: 'Visit booking created successfully',
            data: booking
        });

    } catch (error) {
        console.error('Booking error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const getAllVisitBookings = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const [bookings, total] = await Promise.all([
            VisitBooking.find()
                .populate('userId', 'name email')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            VisitBooking.countDocuments()
        ]);

        const pages = Math.ceil(total / limit);

        return res.status(200).json({
            success: true,
            count: bookings.length,
            pagination: {
                page,
                limit,
                total,
                pages
            },
            data: bookings
        });
    } catch (error) {
        console.error('Error fetching visit bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}

const getVisitBookingById = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await VisitBooking.findById(id).populate('userId', 'name email');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Visit booking not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Error fetching visit booking:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
  };

const getBulkAccommodationProperties = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const type = req.query.type;

        const skip = (page - 1) * limit;

        const allowedTypes = ['interns', 'employees', 'students'];

        if (type && !allowedTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid bulk accommodation type'
            });
        }

        const query = {
            bulkAccommodation: true,
            ...(type && { bulkAccommodationType: type })
        };

        const [properties, total] = await Promise.all([
            Property.find(query)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            Property.countDocuments(query)
        ]);

        const pages = Math.ceil(total / limit);

        return res.status(200).json({
            success: true,
            count: properties.length,
            pagination: {
                page,
                limit,
                total,
                pages
            },
            data: properties
        });
    } catch (error) {
        console.error('Error fetching bulk accommodation properties:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const scheduleVisit = async (req, res) => {
    try {
        const booking = new VisitBooking(req.body);
        await booking.save();

        res.status(201).json({
            success: true,
            message: 'Visit booking created successfully',
            data: booking
        });
    } catch (error) {
        console.error('Error creating visit booking:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};



module.exports = {
    getAllPgHostel,
    bookVisit,
    getAllVisitBookings,
    getVisitBookingById,
    getBulkAccommodationProperties,
    scheduleVisit,
};