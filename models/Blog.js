const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    category: {
        type: String,
        enum: ['technology', 'lifestyle'], // extendable
        required: true
    },
    status: {
        type: String,
        enum: ['published', 'draft'],
        default: 'draft'
    },
    views: {
        type: Number,
        default: 0
    },
    publishDate: {
        type: Date,
        required: function () {
            return this.status === 'published';
        }
    },
    seo: {
        title: {
            type: String,
            required: true
        },
        meta: {
            type: String,
            required: true
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Blog', blogSchema);