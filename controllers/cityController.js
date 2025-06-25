const City = require('../models/City');

exports.createCity = async (req, res) => {
    try {
        const city = new City(req.body);
        const result = await city.save();
        return res.status(201).json(result);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to create city', error });
    }
};

exports.getAllCities = async (req, res) => {
    try {
        const { page = 1, limit = 3 } = req.query;
        const result = await City.find()
            .sort({ order: 1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch cities', error });
    }
};

exports.getCityById = async (req, res) => {
    try {
        const result = await City.findById(req.params.id);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch city', error });
    }
};

exports.updateCity = async (req, res) => {
    try {
        const result = await City.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to update city', error });
    }
};

exports.deleteCity = async (req, res) => {
    try {
        const result = await City.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: 'City deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to delete city', error });
    }
};
