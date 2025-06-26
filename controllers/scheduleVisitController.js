const ScheduleVisit = require('../models/ScheduleVisit');

exports.createVisit = async (req, res) => {
    try {
        const newVisit = new ScheduleVisit(req.body);
        const saved = await newVisit.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateVisit = async (req, res) => {
    try {
        const updated = await ScheduleVisit.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: 'Visit not found' });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllVisits = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3;
        const skip = (page - 1) * limit;

        const visits = await ScheduleVisit.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await ScheduleVisit.countDocuments();

        res.json({ data: visits, total, page, limit });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getVisitById = async (req, res) => {
    try {
        const visit = await ScheduleVisit.findById(req.params.id);
        if (!visit) return res.status(404).json({ message: 'Visit not found' });
        res.json(visit);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteVisit = async (req, res) => {
    try {
        const deleted = await ScheduleVisit.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Visit not found' });
        res.json({ message: 'Visit deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
