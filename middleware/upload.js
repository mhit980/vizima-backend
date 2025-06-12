const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'uploads/';

        // Create different folders based on file type or route
        if (file.fieldname === 'image' || file.fieldname === 'banner') {
            uploadPath += 'banners/';
        } else if (file.fieldname === 'avatar') {
            uploadPath += 'avatars/';
        } else if (file.fieldname === 'propertyImages') {
            uploadPath += 'properties/';
        } else {
            uploadPath += 'misc/';
        }

        // Create directory if it doesn't exist
        const fullPath = path.join(__dirname, '../', uploadPath);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = file.fieldname + '-' + uniqueSuffix + ext;
        cb(null, name);
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
        // Check file size (handled by multer limits, but you can add custom logic here)
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 10 // Maximum 10 files
    },
    fileFilter: fileFilter
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 5MB.'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum 10 files allowed.'
            });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected file field.'
            });
        }
    }

    if (error.message === 'Only image files are allowed!') {
        return res.status(400).json({
            success: false,
            message: 'Only image files are allowed!'
        });
    }

    next(error);
};

// Custom upload middleware with error handling
const uploadWithErrorHandling = (uploadFunction) => {
    return (req, res, next) => {
        uploadFunction(req, res, (error) => {
            if (error) {
                return handleMulterError(error, req, res, next);
            }
            next();
        });
    };
};

// Export different upload configurations
module.exports = {
    // Single file upload
    single: (fieldName) => uploadWithErrorHandling(upload.single(fieldName)),

    // Multiple files upload (same field)
    array: (fieldName, maxCount = 5) => uploadWithErrorHandling(upload.array(fieldName, maxCount)),

    // Multiple files upload (different fields)
    fields: (fields) => uploadWithErrorHandling(upload.fields(fields)),

    // Any files
    any: () => uploadWithErrorHandling(upload.any()),

    // No files (for form data only)
    none: () => uploadWithErrorHandling(upload.none()),

    // Raw multer instance (if needed)
    multer: upload,

    // Error handler
    handleMulterError
};

// Alternative export for backwards compatibility
// If your routes are expecting just the multer instance
module.exports.upload = upload;