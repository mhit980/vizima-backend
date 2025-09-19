const mongoose = require('mongoose');

const contactNumberSchema = new mongoose.Schema({
    number: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        unique: true,
        validate: {
            validator: function(v) {
                // Matches 10-digit Indian mobile numbers
                return /^[6-9]\d{9}$/.test(v);
            },
            message: props => `${props.value} is not a valid Indian mobile number!`
        }
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [100, 'Description cannot exceed 100 characters']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        required: [true, 'Order is required'],
        min: [0, 'Order must be a positive number']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for active contact numbers
contactNumberSchema.index({ isActive: 1, order: 1 });

// Static method to get active contact numbers
contactNumberSchema.statics.getActiveContactNumbers = async function() {
    return await this.find({ isActive: true })
        .sort({ order: 1, createdAt: 1 })
        .select('-__v -updatedAt');
};

module.exports = mongoose.model('ContactNumber', contactNumberSchema);