const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: [true, 'Property is required']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^\+\d{1,4}[6-9]\d{9}$/, 'Please enter a valid phone number with country code (e.g., +919876543210)']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please enter a valid email address']
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'unisex'],
        required: [true, 'Gender is required']
    },
    sharing: {
        type: String,
        enum: ['single', 'double', 'triple'],
        required: [true, 'Sharing type is required']
    },
    scheduleDate: {
        type: Date,
        required: [true, 'Booking date is required']
    },
    checkIn: {
        type: Date,
        required: [true, 'Check-in date is required']
    },
    checkOut: {
        type: Date,
        required: [true, 'Check-out date is required'],
        validate: {
            validator: function (value) {
                return value > this.checkIn;
            },
            message: 'Check-out date must be after check-in date'
        }
    },
    guests: {
        type: Number,
        required: [true, 'Number of guests is required'],
        min: [1, 'At least 1 guest is required'],
        max: [20, 'Maximum 20 guests allowed']
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0, 'Total amount cannot be negative']
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'confirmed', 'cancelled', 'completed', 'in-progress'],
            message: 'Please select a valid booking status'
        },
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: {
            values: ['pending', 'paid', 'failed', 'refunded', 'partial'],
            message: 'Please select a valid payment status'
        },
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash'],
        default: 'credit_card'
    },
    paymentId: {
        type: String
    },
    specialRequests: {
        type: String,
        maxlength: [500, 'Special requests cannot exceed 500 characters']
    },
    cancellationReason: {
        type: String,
        maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
    },
    refundAmount: {
        type: Number,
        default: 0,
        min: [0, 'Refund amount cannot be negative']
    },
    reviewSubmitted: {
        type: Boolean,
        default: false
    },
    contactInfo: {
        phone: {
            type: String,
            required: [true, 'Contact phone is required'],
            match: [/^\+\d{1,4}[6-9]\d{9}$/, 'Please enter a valid phone number with country code (e.g., +919876543210)']
        },
        email: {
            type: String,
            required: [true, 'Contact email is required']
        },
        emergencyContact: {
            name: String,
            phone: String,
            relation: String
        }
    }
}, {
    timestamps: true
});

// Indexes for better query performance
bookingSchema.index({ user: 1 });
bookingSchema.index({ property: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ checkIn: 1, checkOut: 1 });
bookingSchema.index({ createdAt: -1 });

// Virtual for duration in days
bookingSchema.virtual('duration').get(function () {
    const diffTime = Math.abs(this.checkOut - this.checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Virtual for booking reference
bookingSchema.virtual('bookingReference').get(function () {
    return `BK${this._id.toString().slice(-8).toUpperCase()}`;
});

// Pre-save middleware to calculate total amount
bookingSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('checkIn') || this.isModified('checkOut')) {
        try {
            const Property = mongoose.model('Property');
            const property = await Property.findById(this.property);

            if (property) {
                const days = this.duration;
                this.totalAmount = property.price * days;
            }
        } catch (error) {
            console.error('Error calculating total amount:', error);
        }
    }
    next();
});

// Static method to check availability
bookingSchema.statics.checkAvailability = async function (propertyId, checkIn, checkOut, excludeBookingId = null) {
    const query = {
        property: propertyId,
        status: { $in: ['confirmed', 'in-progress'] },
        $or: [
            {
                checkIn: { $lte: checkIn },
                checkOut: { $gt: checkIn }
            },
            {
                checkIn: { $lt: checkOut },
                checkOut: { $gte: checkOut }
            },
            {
                checkIn: { $gte: checkIn },
                checkOut: { $lte: checkOut }
            }
        ]
    };

    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    const conflictingBookings = await this.find(query);
    return conflictingBookings.length === 0;
};

// Instance method to calculate refund amount
bookingSchema.methods.calculateRefund = function () {
    const now = new Date();
    const checkInDate = new Date(this.checkIn);
    const daysUntilCheckIn = Math.ceil((checkInDate - now) / (1000 * 60 * 60 * 24));

    let refundPercentage = 0;

    if (daysUntilCheckIn > 7) {
        refundPercentage = 0.9; // 90% refund
    } else if (daysUntilCheckIn > 3) {
        refundPercentage = 0.5; // 50% refund
    } else if (daysUntilCheckIn > 1) {
        refundPercentage = 0.25; // 25% refund
    } else {
        refundPercentage = 0; // No refund
    }

    return Math.round(this.totalAmount * refundPercentage);
};

module.exports = mongoose.model('Booking', bookingSchema);