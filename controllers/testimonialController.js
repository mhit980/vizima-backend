const Testimonial = require('../models/Testimonial');

exports.createTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.create(req.body);
        res.status(201).json({ message: 'Created successfully', data: testimonial });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAllTestimonials = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3;
        const skip = (page - 1) * limit;

        const testimonials = await Testimonial.find()
            .sort({ order: 1 })
            .skip(skip)
            .limit(limit);

        const total = await Testimonial.countDocuments();
        res.status(200).json({
            page,
            limit,
            total,
            data: testimonials
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTestimonialById = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) return res.status(404).json({ error: 'Not found' });
        res.status(200).json({ data: testimonial });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!testimonial) return res.status(404).json({ error: 'Not found' });
        res.status(200).json({ message: 'Updated successfully', data: testimonial });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteTestimonial = async (req, res) => {
    try {
        await Testimonial.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
