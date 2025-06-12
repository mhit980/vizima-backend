// Role-based authorization middleware

const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }

    next();
};

const managerOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (!['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Admin or Manager access required'
        });
    }

    next();
};

const ownerOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (!['admin', 'owner'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Property owner or Admin access required'
        });
    }

    next();
};

const userOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (!['admin', 'user', 'owner', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'Access denied'
        });
    }

    next();
};

// Check if user owns the resource or is admin
const resourceOwnerOrAdmin = (resourceField = 'user') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Admin can access everything
        if (req.user.role === 'admin') {
            return next();
        }

        // For resource owner check, we'll need to implement this in the controller
        // as we need to fetch the resource first
        req.checkResourceOwner = true;
        req.resourceField = resourceField;
        next();
    };
};

module.exports = {
    adminOnly,
    managerOrAdmin,
    ownerOrAdmin,
    userOrAdmin,
    resourceOwnerOrAdmin
};