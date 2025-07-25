const mongoose = require('mongoose');

const ServiceHighlightSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('ServiceHighlight', ServiceHighlightSchema);
