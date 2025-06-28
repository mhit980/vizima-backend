const VisitBooking = require('../models/VisitBooking');

const isValidPhone = (phone) => /^\d{10}$/.test(phone);

exports.createVisitBooking = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!isValidPhone(phone)) {
            return res.status(400).json({ message: 'Phone number must be 10 digits' });
        }

        const booking = new VisitBooking(req.body);
        await booking.save();
        return res.status(201).json({ message: 'Created', data: booking });
    } catch (error) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
};

exports.updateVisitBooking = async (req, res) => {
    try {
        const { phone } = req.body;
        if (phone && !isValidPhone(phone)) {
            return res.status(400).json({ message: 'Phone number must be 10 digits' });
        }

        const updated = await VisitBooking.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: 'Not Found' });

        res.json({ message: 'Updated', data: updated });
    } catch (error) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
};

exports.getAllVisitBookings = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const bookings = await VisitBooking.find()
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await VisitBooking.countDocuments();

        res.json({ message: 'Success', data: bookings, total, page });
    } catch (error) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
};

exports.getVisitBookingById = async (req, res) => {
    try {
        const booking = await VisitBooking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Not Found' });
        res.json({ message: 'Success', data: booking });
    } catch (error) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
};

exports.deleteVisitBooking = async (req, res) => {
    try {
        const deleted = await VisitBooking.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Not Found' });
        res.json({ message: 'Deleted', data: deleted });
    } catch (error) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
};

exports.getVisitBookingStats = async (req, res) => {
    try {
        const [pending, confirmed, cancelled, completed, total, latest] = await Promise.all([
            VisitBooking.countDocuments({ status: 'pending' }),
            VisitBooking.countDocuments({ status: 'confirmed' }),
            VisitBooking.countDocuments({ status: 'cancelled' }),
            VisitBooking.countDocuments({ status: 'completed' }),
            VisitBooking.countDocuments(),
            VisitBooking.findOne().sort({ createdAt: -1 })
        ]);

        return res.status(200).json({
            message: 'Stats fetched successfully',
            data: {
                total,
                pending,
                confirmed,
                cancelled,
                completed,
                recent: latest
            }
        });
    } catch (error) {
        console.error('Error fetching visit booking stats:', error);
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
};