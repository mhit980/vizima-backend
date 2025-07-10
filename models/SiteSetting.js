const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    siteName: {
        type: String,
        required: true,
    },
    siteDescription: {
        type: String,
        required: true,
    },
    contactEmail: {
        type: String,
        required: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },
    contactPhone: {
        type: String,
        required: true,
        match: [/^\+?[0-9]{10,15}$/, 'Please fill a valid phone number'],
    },
    address: {
        type: String,
        required: true,
    },
}, {
    timestamps: true, // adds createdAt and updatedAt
});

module.exports = mongoose.model('SiteSettings', siteSettingsSchema)