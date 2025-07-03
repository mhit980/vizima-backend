const UserDocument = require('../models/UserDocuments');

// Create a new document
exports.createDocument = async (req, res) => {
    try {
        const { type, subType, documentUrl } = req.body;
        const userId = req.user.id;

        const newDoc = await UserDocument.create({
            user: userId,
            type,
            subType,
            documentUrl
        });

        return res.status(201).json({ success: true, data: newDoc });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// Get document by ID
exports.getDocumentById = async (req, res) => {
    try {
        const doc = await UserDocument.findById(req.params.id).populate('user');
        if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

        return res.json({ success: true, data: doc });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// Get all documents (admin only) with pagination
exports.getAllDocumentsAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [docs, total] = await Promise.all([
            UserDocument.find().populate('user').skip(skip).limit(limit).sort({ createdAt: -1 }),
            UserDocument.countDocuments()
        ]);

        return res.json({
            success: true,
            data: docs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get all documents for current user
exports.getUserDocuments = async (req, res) => {
    try {
        const userId = req.user.id;

        const docs = await UserDocument.find({ user: userId }).sort({ createdAt: -1 });
        return res.json({ success: true, data: docs });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Update document by ID
exports.updateDocumentById = async (req, res) => {
    try {
        const docId = req.params.id;
        const updateData = req.body;

        const doc = await UserDocument.findByIdAndUpdate(docId, updateData, {
            new: true,
            runValidators: true
        });

        if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

        return res.json({ success: true, data: doc });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

// Delete document by ID
exports.deleteDocumentById = async (req, res) => {
    try {
        const docId = req.params.id;

        const doc = await UserDocument.findByIdAndDelete(docId);
        if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

        return res.json({ success: true, message: 'Document deleted successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
