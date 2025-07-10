const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create storage for property images
const propertyStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'property-rental/properties',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 1200, height: 800, crop: 'limit', quality: 'auto' },
            { flags: 'progressive' }
        ],
        public_id: (req, file) => {
            const timestamp = Date.now();
            const originalName = file.originalname.split('.')[0];
            return `property_${timestamp}_${originalName}`;
        },
    },
});

// Create storage for banner images
const bannerStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'property-rental/banners',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 1920, height: 600, crop: 'fill', quality: 'auto' },
            { flags: 'progressive' }
        ],
        public_id: (req, file) => {
            const timestamp = Date.now();
            const originalName = file.originalname.split('.')[0];
            return `banner_${timestamp}_${originalName}`;
        },
    },
});

// Create storage for user avatars
const avatarStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'property-rental/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [
            { width: 300, height: 300, crop: 'fill', quality: 'auto', gravity: 'face' },
            { flags: 'progressive' }
        ],
        public_id: (req, file) => {
            const userId = req.user?.id || 'anonymous';
            const timestamp = Date.now();
            return `avatar_${userId}_${timestamp}`;
        },
    },
});

// Create multer instances
const propertyUpload = multer({
    storage: propertyStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per file
        files: 10, // Maximum 10 files
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
});

const bannerUpload = multer({
    storage: bannerStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1, // Single file
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
});

const avatarUpload = multer({
    storage: avatarStorage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
        files: 1, // Single file
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    },
});

// Utility functions
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        throw error;
    }
};

const deleteMultipleImages = async (publicIds) => {
    try {
        const result = await cloudinary.api.delete_resources(publicIds);
        return result;
    } catch (error) {
        console.error('Error deleting multiple images from Cloudinary:', error);
        throw error;
    }
};

// Extract public ID from Cloudinary URL
const extractPublicId = (url) => {
    try {
        const parts = url.split('/');
        const lastPart = parts[parts.length - 1];
        const publicId = lastPart.split('.')[0];

        // Find the folder structure
        const folderIndex = parts.findIndex(part => part === 'property-rental');
        if (folderIndex !== -1) {
            const folderParts = parts.slice(folderIndex, -1);
            return `${folderParts.join('/')}/${publicId}`;
        }

        return publicId;
    } catch (error) {
        console.error('Error extracting public ID:', error);
        return null;
    }
};

// Get optimized image URL
const getOptimizedUrl = (publicId, options = {}) => {
    const {
        width = 800,
        height = 600,
        crop = 'fill',
        quality = 'auto',
        format = 'auto'
    } = options;

    return cloudinary.url(publicId, {
        width,
        height,
        crop,
        quality,
        format,
        flags: 'progressive'
    });
};

module.exports = {
    cloudinary,
    propertyUpload,
    bannerUpload,
    avatarUpload,
    deleteImage,
    deleteMultipleImages,
    // extractPublicId,
    getOptimizedUrl,
    bannerStorage,
    extractPublicId,
};