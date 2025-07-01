const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            next();
        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed'
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token provided'
        });
    }
};

// Optional authentication - doesn't throw error if no token
const optionalAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            // Silently fail for optional auth
            req.user = null;
        }
    }

    next();
};

// Grant access to specific roles
const authorize = (...roles) => {

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (!roles.includes(req.user.role)) {

            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this resource`
            });
        }

        next();
    };
};

// Check if user is verified
const requireVerification = (req, res, next) => {
    if (!req.user.isVerified) {
        return res.status(403).json({
            success: false,
            message: 'Please verify your email address to access this resource'
        });
    }
    next();
};

module.exports = {
    protect,
    optionalAuth,
    authorize,
    requireVerification
};