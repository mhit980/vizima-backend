const FAQ = require('../models/Faq');

exports.createFAQ = async (req, res) => {
    try {
        const faq = new FAQ(req.body);
        await faq.save();
        res.status(201).json(faq);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


exports.updateFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        });
        if (!faq) return res.status(404).json({ error: 'FAQ not found' });
        res.json(faq);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllFAQs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [faqs, totalItems] = await Promise.all([
            FAQ.find().sort({ order: 1 }).skip(skip).limit(limit),
            FAQ.countDocuments()
        ]);

        res.json({
            data: faqs,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.getFAQById = async (req, res) => {
    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq) return res.status(404).json({ error: 'FAQ not found' });
        res.json(faq);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ New: Delete FAQ by ID
exports.deleteFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findByIdAndDelete(req.params.id);
        if (!faq) return res.status(404).json({ error: 'FAQ not found' });
        res.json({ message: 'FAQ deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  };