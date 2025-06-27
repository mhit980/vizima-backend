const Property = require('../models/Property');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all properties with filters and pagination
 * @route   GET /api/properties
 * @access  Public
 */
const getProperties = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            city,
            state,
            type,
            minPrice,
            maxPrice,
            bedrooms,
            bathrooms,
            amenities,
            search,
            sharingType,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            isAvailable = true,
            isFeatured
        } = req.query;

        // Build query
        const query = {};

        if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';
        if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
        if (city) query['location.city'] = new RegExp(city, 'i');
        if (state) query['location.state'] = new RegExp(state, 'i');
        if (type) query.type = type;
        if (sharingType) {
            query.sharingType = { $in: sharingType };
        }
        if (bedrooms) query.bedrooms = parseInt(bedrooms);
        if (bathrooms) query.bathrooms = parseInt(bathrooms);

        // Price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        // Amenities filter
        if (amenities) {
            const amenitiesArray = amenities.split(',');
            query.amenities = { $in: amenitiesArray };
        }

        // Text search
        if (search) {
            query.$text = { $search: search };
        }

        // Pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query
        const properties = await Property.find(query)
            .populate('owner', 'name email phone')
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum);

        // Get total count for pagination
        const total = await Property.countDocuments(query);

        res.status(200).json({
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
        console.error('Get properties error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Get single property
 * @route   GET /api/properties/:id
 * @access  Public
 */
const getProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id)
            .populate('owner', 'name email phone avatar')
            .populate({ path: 'roomOptions' })

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        // Increment views (optional auth)
        if (req.user && req.user.id !== property.owner._id.toString()) {
            await property.incrementViews();
        }

        res.status(200).json({
            success: true,
            data: { property }
        });
    } catch (error) {
        console.error('Get property error:', error);
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Create new property (Admin only)
 * @route   POST /api/properties
 * @access  Private/Admin
 */
const createProperty = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        // Add owner to req.body
        req.body.owner = req.user.id;

        const property = await Property.create(req.body);

        // Populate owner info
        await property.populate('owner', 'name email phone');

        res.status(201).json({
            success: true,
            message: 'Property created successfully',
            data: { property }
        });
    } catch (error) {
        console.error('Create property error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Update property
 * @route   PUT /api/properties/:id
 * @access  Private/Admin
 */
const updateProperty = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        let property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        // Make sure user is property owner or admin
        if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this property'
            });
        }

        property = await Property.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('owner', 'name email phone');

        res.status(200).json({
            success: true,
            message: 'Property updated successfully',
            data: { property }
        });
    } catch (error) {
        console.error('Update property error:', error);
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Delete property
 * @route   DELETE /api/properties/:id
 * @access  Private/Admin
 */
const deleteProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        // Make sure user is property owner or admin
        if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this property'
            });
        }

        await Property.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Property deleted successfully'
        });
    } catch (error) {
        console.error('Delete property error:', error);
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Search properties by location (with coordinates)
 * @route   GET /api/properties/search/location
 * @access  Public
 */
const searchByLocation = async (req, res) => {
    try {
        const { lat, lng, radius = 10, limit = 20 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const properties = await Property.find({
            isAvailable: true,
            'location.coordinates': {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: radius * 1000 // Convert km to meters
                }
            }
        })
            .populate('owner', 'name email phone')
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: properties.length,
            data: { properties }
        });
    } catch (error) {
        console.error('Location search error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Get featured properties
 * @route   GET /api/properties/featured
 * @access  Public
 */
const getFeaturedProperties = async (req, res) => {
    try {
        const { limit = 6 } = req.query;

        const properties = await Property.find({
            isFeatured: true,
            isAvailable: true
        })
            .populate('owner', 'name email phone')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: properties.length,
            data: { properties }
        });
    } catch (error) {
        console.error('Get featured properties error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Get property statistics (Admin only)
 * @route   GET /api/properties/stats
 * @access  Private/Admin
 */
const getPropertyStats = async (req, res) => {
    try {
        const stats = await Property.aggregate([
            {
                $group: {
                    _id: null,
                    totalProperties: { $sum: 1 },
                    availableProperties: {
                        $sum: { $cond: [{ $eq: ['$isAvailable', true] }, 1, 0] }
                    },
                    averagePrice: { $avg: '$price' },
                    totalViews: { $sum: '$views' }
                }
            }
        ]);

        const typeStats = await Property.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    averagePrice: { $avg: '$price' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        const locationStats = await Property.aggregate([
            {
                $group: {
                    _id: '$location.city',
                    count: { $sum: 1 },
                    averagePrice: { $avg: '$price' }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            }
        ]);

        const priceRangeStats = await Property.aggregate([
            {
                $bucket: {
                    groupBy: '$price',
                    boundaries: [0, 100000, 500000, 1000000, 2000000, 5000000],
                    default: '5000000+',
                    output: {
                        count: { $sum: 1 },
                        averagePrice: { $avg: '$price' }
                    }
                }
            }
        ]);

        const monthlyStats = await Property.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': -1, '_id.month': -1 }
            },
            {
                $limit: 12
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                overview: stats[0] || {
                    totalProperties: 0,
                    availableProperties: 0,
                    averagePrice: 0,
                    totalViews: 0
                },
                byType: typeStats,
                byLocation: locationStats,
                byPriceRange: priceRangeStats,
                monthlyTrend: monthlyStats
            }
        });
    } catch (error) {
        console.error('Get property stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Get similar properties
 * @route   GET /api/properties/:id/similar
 * @access  Public
 */
const getSimilarProperties = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }

        const { limit = 4 } = req.query;

        // Find similar properties based on type, location, and price range
        const similarProperties = await Property.find({
            _id: { $ne: property._id },
            isAvailable: true,
            $or: [
                { type: property.type },
                { 'location.city': property.location.city },
                {
                    price: {
                        $gte: property.price * 0.8,
                        $lte: property.price * 1.2
                    }
                }
            ]
        })
            .populate('owner', 'name email phone')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: similarProperties.length,
            data: { properties: similarProperties }
        });
    } catch (error) {
        console.error('Get similar properties error:', error);
        if (error.name === 'CastError') {
            return res.status(404).json({
                success: false,
                message: 'Property not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = {
    getProperties,
    getProperty,
    createProperty,
    updateProperty,
    deleteProperty,
    searchByLocation,
    getFeaturedProperties,
    getPropertyStats,
    getSimilarProperties
};