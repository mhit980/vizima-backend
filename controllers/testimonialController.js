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
        const testimonials = await Testimonial.find({ status: 'approved' })
            .sort({ order: 1 });

        res.status(200).json({
            total: testimonials.length,
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
