const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Banner title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    image: {
        type: String,
        required: [true, 'Banner image is required']
    },
    link: {
        type: String,
        validate: {
            validator: function (v) {
                if (!v) return true; // Optional field
                return /^https?:\/\/.+/.test(v);
            },
            message: 'Please provide a valid URL'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0,
        min: [0, 'Order cannot be negative']
    },
    type: {
        type: String,
        enum: {
            values: ['hero', 'promotional', 'informational', 'featured'],
            message: 'Please select a valid banner type'
        },
        default: 'promotional'
    },
    targetAudience: {
        type: String,
        enum: ['all', 'new_users', 'existing_users', 'premium_users'],
        default: 'all'
    },
    displayLocation: [{
        type: String,
        enum: ['home', 'search', 'property_detail', 'booking', 'profile'],
        default: ['home']
    }],
    startDate: {
        type: Date,
        default: Date.now
    },
    // endDate: {
    //     type: Date,
    //     validate: {
    //         validator: function (value) {
    //             return !value || value > this.startDate;
    //         },
    //         message: 'End date must be after start date'
    //     }
    // },
    clickCount: {
        type: Number,
        default: 0,
        min: [0, 'Click count cannot be negative']
    },
    impressionCount: {
        type: Number,
        default: 0,
        min: [0, 'Impression count cannot be negative']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes
bannerSchema.index({ isActive: 1 });
bannerSchema.index({ order: 1 });
bannerSchema.index({ type: 1 });
bannerSchema.index({ displayLocation: 1 });
bannerSchema.index({ startDate: 1, endDate: 1 });

// Virtual for click-through rate
bannerSchema.virtual('ctr').get(function () {
    return this.impressionCount > 0 ?
        ((this.clickCount / this.impressionCount) * 100).toFixed(2) : 0;
});

// Instance method to increment impressions
bannerSchema.methods.incrementImpressions = function () {
    this.impressionCount += 1;
    return this.save();
};

// Instance method to increment clicks
bannerSchema.methods.incrementClicks = function () {
    this.clickCount += 1;
    return this.save();
};

// Static method to get active banners
bannerSchema.statics.getActiveBanners = function (location = 'home') {
    const now = new Date();
    return this.find({
        isActive: true,
        displayLocation: location,
        startDate: { $lte: now },
        $or: [
            { endDate: { $exists: false } },
            { endDate: null },
            { endDate: { $gte: now } }
        ]
    }).sort({ order: 1, createdAt: -1 });
};

module.exports = mongoose.model('Banner', bannerSchema);