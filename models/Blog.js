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
        enum: ['technology', 'lifestyle', 'general'],
        required: true
    },
    status: {
        type: String,
        enum: ['published', 'draft'],
        default: 'draft'
    },
    publishDate: {
        type: Date,
        required: function () {
            return this.status === 'published';
        }
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    articleBody: {
        type: String,
        required: true,
        trim: true
    },
    blogImageUrl: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Blog', blogSchema);