const SiteSettings = require('../models/SiteSetting');

// Create settings
exports.createSettings = async (req, res) => {
    try {
        const settings = new SiteSettings(req.body);
        await settings.save();
        res.status(201).json(settings);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get settings by ID
exports.getSettingsById = async (req, res) => {
    try {
        const settings = await SiteSettings.findById(req.params.id);
        if (!settings) return res.status(404).json({ message: 'Settings not found' });
        res.json(settings);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update settings by ID
exports.updateSettingsById = async (req, res) => {
    try {
        const updated = await SiteSettings.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updated) return res.status(404).json({ message: 'Settings not found' });
        res.json(updated);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete settings by ID
exports.deleteSettingsById = async (req, res) => {
    try {
        const deleted = await SiteSettings.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Settings not found' });
        res.json({ message: 'Settings deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
