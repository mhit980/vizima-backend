const ServiceHighlight = require('../models/ServiceHighlight.js');

// Create a new service highlight
const createServiceHighlight = async (req, res) => {
    try {
        const highlight = new ServiceHighlight(req.body);
        const result = await highlight.save();
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all service highlights
const getAllServiceHighlights = async (req, res) => {
    try {
        const highlights = await ServiceHighlight.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: highlights });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get a service highlight by ID
const getServiceHighlightById = async (req, res) => {
    try {
        const highlight = await ServiceHighlight.findById(req.params.id);
        if (!highlight) {
            return res.status(404).json({ success: false, message: 'Service Highlight not found' });
        }
        res.status(200).json({ success: true, data: highlight });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a service highlight by ID
const updateServiceHighlight = async (req, res) => {
    try {
        const updated = await ServiceHighlight.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) {
            return res.status(404).json({ success: false, message: 'Service Highlight not found' });
        }
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a service highlight by ID
const deleteServiceHighlight = async (req, res) => {
    try {
        const deleted = await ServiceHighlight.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Service Highlight not found' });
        }
        res.status(200).json({ success: true, message: 'Service Highlight deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createServiceHighlight,
    getAllServiceHighlights,
    getServiceHighlightById,
    updateServiceHighlight,
    deleteServiceHighlight
};
