const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Property title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Property description is required'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    type: {
        type: String,
        required: [true, 'Property type is required'],
        enum: {
            values: ['apartment', 'house', 'room', 'studio', 'villa', 'penthouse', 'pg', 'hostel'],
            message: 'Please select a valid property type'
        }
    },
    gender: {
        type: String,
        required: [true, 'gender is required'],
        enum: {
            values: ['male', 'female', 'unisex'],
            message: 'Please select a valid gender'
        }
    },
    bulkAccommodation: {
        type: Boolean,
        default: false,
        required: false
    },
    bulkAccommodationType: {
        type: [String],
        enum: {
            values: ['interns', 'employees', 'students'],
            message: 'Invalid bulk accommodation type'
        },
        required: false,
        default: []
    },
    sharingType: {
        type: [String],
        enum: ['single', 'double', 'triple'],
        required: false,
        default: []
    },
    price: {
        type: Number,
        required: [true, 'Property price is required'],
        min: [0, 'Price cannot be negative']
    },
    location: {
        address: {
            type: String,
            required: [true, 'Address is required']
        },
        city: {
            type: String,
            required: [true, 'City is required']
        },
        state: {
            type: String,
            required: [true, 'State is required']
        },
        zipCode: {
            type: String,
            required: [true, 'Zip code is required']
        },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number }
        }
    },
    amenities: [{
        type: String,
        enum: [
            'wifi', 'parking', 'gym', 'pool', 'laundry', 'ac', 'heating',
            'kitchen', 'balcony', 'garden', 'security', 'elevator', 'pets',
            'furnished', 'tv', 'dishwasher', 'microwave', 'refrigerator'
        ]
    }],
    images: [{
        type: String,
        required: true
    }],
    bedrooms: {
        type: Number,
        required: [true, 'Number of bedrooms is required'],
        min: [0, 'Bedrooms cannot be negative']
    },
    bathrooms: {
        type: Number,
        required: [true, 'Number of bathrooms is required'],
        min: [0, 'Bathrooms cannot be negative']
    },
    area: {
        type: Number,
        required: [true, 'Property area is required'],
        min: [1, 'Area must be at least 1 sq ft']
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    views: {
        type: Number,
        default: 0
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    rules: [{
        type: String
    }],
    nearbyPlaces: [{
        name: String,
        distance: String,
        type: {
            type: String,
            enum: ['hospital', 'school', 'mall', 'restaurant', 'transport', 'other']
        }
    }],
    visitBookings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VisitBooking'
    }],
    scheduleVisits: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ScheduleVisit'
    }],
    // listedVia: [{
    //     type: String,
    //     required: false,
    //     enum: {
    //         values: ['Vizima', 'RentOk'],
    //         message: 'Please select a valid source'
    //     }
    // }],
    microSiteLink: {
        type: String,
        required: false,
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better search performance
propertySchema.index({ 'location.city': 1 });
propertySchema.index({ 'location.state': 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ price: 1 });


// Virtual populate for roomOptions
propertySchema.virtual('roomOptions', {
    ref: 'RoomOption',
    localField: '_id',
    foreignField: 'property'
});


// Indexes for better search performance
propertySchema.index({ 'location.coordinates': '2dsphere' });

// Text search index
propertySchema.index({
    title: 'text',
    description: 'text',
    'location.address': 'text',
    'location.city': 'text',
    'location.state': 'text'
});

// Virtual for average rating
propertySchema.virtual('averageRating').get(function () {
    return this.rating.count > 0 ? (this.rating.average / this.rating.count).toFixed(1) : 0;
});

// Middleware to increment views
propertySchema.methods.incrementViews = function () {
    this.views += 1;
    return this.save();
};

module.exports = mongoose.model('Property', propertySchema);