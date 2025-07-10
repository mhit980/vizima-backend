const Banner = require('../models/Banner');
const {cloudinary, extractPublicId} = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure multer with Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'banners',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
            { width: 1920, height: 600, crop: 'limit', quality: 'auto' }
        ]
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// @desc    Get all banners with pagination and filtering
// @route   GET /api/banners
// @access  Public
const getBanners = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build filter object
        const filter = {};

        if (req.query.isActive !== undefined) {
            filter.isActive = req.query.isActive === 'true';
        }

        if (req.query.type) {
            filter.type = req.query.type;
        }

        if (req.query.targetAudience) {
            filter.targetAudience = req.query.targetAudience;
        }

        if (req.query.displayLocation) {
            filter.displayLocation = req.query.displayLocation;
        }

        // Date range filter
        if (req.query.startDate || req.query.endDate) {
            filter.startDate = {};
            if (req.query.startDate) {
                filter.startDate.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                filter.startDate.$lte = new Date(req.query.endDate);
            }
        }

        const banners = await Banner.find(filter)
            .populate('createdBy', 'name email')
            .sort({ order: 1, createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Banner.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: banners,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching banners',
            error: error.message
        });
    }
};

// @desc    Get active banners for specific location
// @route   GET /api/banners/active/:location
// @access  Public
const getActiveBanners = async (req, res) => {
    try {
        const location = req.params.location || 'home';
        const banners = await Banner.getActiveBanners(location);

        res.status(200).json({
            success: true,
            data: banners
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching active banners',
            error: error.message
        });
    }
};

// @desc    Get single banner by ID
// @route   GET /api/banners/:id
// @access  Public
const getBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
        }

        res.status(200).json({
            success: true,
            data: banner
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching banner',
            error: error.message
        });
    }
};

// @desc    Create new banner
// @route   POST /api/banners
// @access  Private
const createBanner = async (req, res) => {
    try {
        const {
            title,
            description,
            image,
            link,
            isActive,
            order,
            type,
            targetAudience,
            displayLocation,
            startDate,
            endDate
        } = req.body;

        console.log(req.body);

        // Check if image was uploaded
        // if (!req.file) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Banner image is required'
        //     });
        // }

        const bannerData = {
            title,
            description,
            image,
            link,
            isActive,
            order,
            type,
            targetAudience,
            displayLocation: Array.isArray(displayLocation) ? displayLocation : [displayLocation],
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            createdBy: req.user.id
        };

        const banner = await Banner.create(bannerData);
        await banner.populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            data: banner,
            message: 'Banner created successfully'
        });
    } catch (error) {
        // Delete uploaded image if banner creation fails
        // if (req.file) {
        //     const publicId = req.file.filename;
        //     await cloudinary.uploader.destroy(publicId);
        // }

        res.status(400).json({
            success: false,
            message: 'Error creating banner',
            error: error.message
        });
    }
};

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Private
const updateBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
        }

        const {
            title,
            description,
            image,
            link,
            isActive,
            order,
            type,
            targetAudience,
            displayLocation,
            startDate,
            endDate
        } = req.body;

        // Store old image URL for cleanup
        // const oldImageUrl = banner.image;

        // Update fields
        const updateData = {
            title,
            description,
            image,
            link,
            isActive,
            order,
            type,
            targetAudience,
            displayLocation: Array.isArray(displayLocation) ? displayLocation : [displayLocation],
            startDate: startDate ? new Date(startDate) : banner.startDate,
            endDate: endDate ? new Date(endDate) : banner.endDate
        };

        // Update image if new file uploaded
        if (req.file) {
            updateData.image = req.file.path;
        }

        const updatedBanner = await Banner.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email');

        // Delete old image from Cloudinary if new image was uploaded
        // if (image && oldImageUrl) {
        //     const publicId = oldImageUrl.split('/').pop().split('.')[0];
        //     await cloudinary.uploader.destroy(`banners/${publicId}`);
        // }

        res.status(200).json({
            success: true,
            data: updatedBanner,
            message: 'Banner updated successfully'
        });
    } catch (error) {
        // Delete uploaded image if update fails
        if (req.file) {
            const publicId = req.file.filename;
            await cloudinary.uploader.destroy(publicId);
        }

        res.status(400).json({
            success: false,
            message: 'Error updating banner',
            error: error.message
        });
    }
};

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Private
const deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
        }

        // Delete image from Cloudinary
        // if (banner.image) {
        //     const publicId = banner.image.split('/').pop().split('.')[0];
        //     await cloudinary.uploader.destroy(`banners/${publicId}`);
        // }

        // if (banner.image) {
        //     const publicId = extractPublicId(banner.image);
        //     await cloudinary.uploader.destroy(publicId);
        // }

        await Banner.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Banner deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting banner',
            error: error.message
        });
    }
};

// @desc    Toggle banner status
// @route   PATCH /api/banners/:id/toggle
// @access  Private
const toggleBannerStatus = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
        }

        banner.isActive = !banner.isActive;
        await banner.save();

        res.status(200).json({
            success: true,
            data: banner,
            message: `Banner ${banner.isActive ? 'activated' : 'deactivated'} successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error toggling banner status',
            error: error.message
        });
    }
};

// @desc    Record banner impression
// @route   POST /api/banners/:id/impression
// @access  Public
const recordImpression = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
        }

        await banner.incrementImpressions();

        res.status(200).json({
            success: true,
            message: 'Impression recorded'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error recording impression',
            error: error.message
        });
    }
};

// @desc    Record banner click
// @route   POST /api/banners/:id/click
// @access  Public
const recordClick = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
        }

        await banner.incrementClicks();

        res.status(200).json({
            success: true,
            message: 'Click recorded'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error recording click',
            error: error.message
        });
    }
};

// @desc    Get banner analytics
// @route   GET /api/banners/:id/analytics
// @access  Private
const getBannerAnalytics = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner not found'
            });
        }

        const analytics = {
            impressions: banner.impressionCount,
            clicks: banner.clickCount,
            ctr: banner.ctr,
            isActive: banner.isActive,
            createdAt: banner.createdAt,
            daysActive: Math.ceil((new Date() - banner.createdAt) / (1000 * 60 * 60 * 24))
        };

        res.status(200).json({
            success: true,
            data: analytics
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics',
            error: error.message
        });
    }
};

// @desc    Reorder banners
// @route   PUT /api/banners/reorder
// @access  Private
const reorderBanners = async (req, res) => {
    try {
        const { bannerOrders } = req.body; // Array of { id, order }

        if (!Array.isArray(bannerOrders)) {
            return res.status(400).json({
                success: false,
                message: 'bannerOrders must be an array'
            });
        }

        const updatePromises = bannerOrders.map(({ id, order }) =>
            Banner.findByIdAndUpdate(id, { order }, { new: true })
        );

        await Promise.all(updatePromises);

        res.status(200).json({
            success: true,
            message: 'Banners reordered successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error reordering banners',
            error: error.message
        });
    }
};

module.exports = {
    getBanners,
    getActiveBanners,
    getBanner,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
    recordImpression,
    recordClick,
    getBannerAnalytics,
    reorderBanners,
    upload
};