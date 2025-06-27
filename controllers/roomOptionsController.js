const { validationResult } = require('express-validator');
const RoomOption = require('../models/RoomOptions');

// Create RoomOption
const createRoomOption = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const roomOption = new RoomOption(req.body);
        await roomOption.save();
        return res.status(201).json(roomOption);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

// Get all RoomOptions
const getAllRoomOptions = async (req, res) => {
    try {
        const roomOptions = await RoomOption.find().populate('property');
        return res.status(200).json(roomOptions);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

// Get RoomOption by ID
const getRoomOptionById = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const roomOption = await RoomOption.findById(req.params.id).populate('property');
        if (!roomOption) return res.status(404).json({ message: 'Room option not found' });
        return res.status(200).json(roomOption);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

// Update RoomOption
const updateRoomOption = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const roomOption = await RoomOption.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!roomOption) return res.status(404).json({ message: 'Room option not found' });
        return res.status(200).json(roomOption);
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

// Delete RoomOption
const deleteRoomOption = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const deleted = await RoomOption.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Room option not found' });
        return res.status(200).json({ message: 'Room option deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
};

// Export all controllers
module.exports = {
    createRoomOption,
    getAllRoomOptions,
    getRoomOptionById,
    updateRoomOption,
    deleteRoomOption,
};
