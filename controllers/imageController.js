const cloudinary = require('cloudinary').v2;


function extractPublicIdFromUrl(url) {
    try {
        if (!url) return null;
        let cleanUrl = url.split('?')[0]; // remove query params
        let afterUpload = cleanUrl.split('/upload/')[1];
        if (!afterUpload) return null;
        afterUpload = afterUpload.replace(/^v[0-9]+\/?/, ''); // remove version prefix
        return afterUpload.substring(0, afterUpload.lastIndexOf('.')); // remove extension
    } catch (error) {
        console.error("Error extracting public ID:", error);
        return null;
    }
}

exports.deleteImageFromUrl = async (req, res) => {
    try {
        const { imageUrl } = req.body;
        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'imageUrl is required'
            });
        }

        const publicId = extractPublicIdFromUrl(imageUrl);
        if (!publicId) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Cloudinary URL format'
            });
        }

        await cloudinary.uploader.destroy(publicId);

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete image'
        });
    }
}

/**
 * Delete multiple images by public IDs
 */
exports.deleteMultipleImages = async (req, res) => {
    try {
        const { urls } = req.body; // Accepts array of Cloudinary URLs

        if (!Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'urls must be a non-empty array',
            });
        }

        // Convert URLs to public IDs
        const publicIds = urls.map(extractPublicIdFromUrl).filter(Boolean);

        if (publicIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No valid public IDs could be extracted from provided URLs',
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
