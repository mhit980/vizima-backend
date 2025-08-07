const cloudinary = require('cloudinary').v2;

/**
 * Delete a single image by public ID
 */
exports.deleteImage = async (req, res) => {
    try {
        const { publicId } = req.params;
        const result = await cloudinary.uploader.destroy(publicId);

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully',
            // result,
        });
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete image',
        });
    }
};

/**
 * Delete multiple images by public IDs
 */
exports.deleteMultipleImages = async (req, res) => {
    try {
        const { publicIds } = req.body;

        if (!Array.isArray(publicIds) || publicIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'publicIds must be a non-empty array',
            });
        }

        const result = await cloudinary.api.delete_resources(publicIds);

        res.status(200).json({
            success: true,
            message: 'Images deleted successfully',
            result,
        });
    } catch (error) {
        console.error('Error deleting multiple images from Cloudinary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete images',
        });
    }
};
