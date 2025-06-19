
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const { validationResult } = require('express-validator');

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


module.exports = {
    getAllPgHostel,
};