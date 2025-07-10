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

// exports.createCity = async (req, res) => {
//     try {
//         // Find the max order in existing cities
//         const lastCity = await City.findOne().sort({ order: -1 }).lean();

//         // Set order: either 1 if no city exists, or last order + 1
//         const newOrder = lastCity?.order ? lastCity.order + 1 : 1;

//         const city = new City({
//             ...req.body,
//             order: newOrder
//         });

//         const result = await city.save();
//         return res.status(201).json(result);
//     } catch (error) {
//         return res.status(500).json({ message: 'Failed to create city', error });
//     }
// };

exports.getAllCities = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        const total = await City.countDocuments({ isVisible: true });
        const cities = await City.find({ isVisible: true })
            .sort({ order: 1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

        return res.status(200).json({
            total,
            page: pageNum,
            pageSize: cities.length,
            totalPages: Math.ceil(total / limitNum),
            data: cities
        });
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
