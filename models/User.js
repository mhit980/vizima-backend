const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false,
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: false,
        unique: true,
        sparse: true,
        lowercase: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
            'Please enter a valid email address'
        ]
    },
    password: {
        type: String,
        required: false,
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^(\+\d{1,4})?\d{10}$/, 'Please enter a valid phone number with country code (e.g. +911234567890) or 10-digit number']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    avatar: {
        type: String,
        default: ''
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'unisex'],
        required: false
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters'],
        required: false
    },
    dob: {
        type: Date,
        required: false,
    },
    maritalStatus: {
        type: String,
        enum: ['single', 'married', 'divorced', 'widowed'],
        required: false,
    },
    address: {
        type: String,
        required: false
    },
    occupation: {
        type: String,
        required: false
    },
    company: {
        type: String,
        required: false
    },
    website: {
        type: String,
        required: false,
        match: [/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/, 'Please enter a valid URL']
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    preferences: {
        location: String,
        priceRange: {
            min: { type: Number, default: 0 },
            max: { type: Number, default: 100000 }
        },
        propertyType: [String]
    },
    isPhoneVerified: {
        type: Boolean,
        default: false,
    },
    passwordResetOTP: {
        type: String,
        select: false,
    },
    passwordResetOTPExpire: {
        type: Date,
        select: false
    },
    otpVerified: {
        type: Boolean,
        default: false,
        select: false
    },
    phoneVerificationOTP: {
        type: String,
        select: false
    },
    phoneVerificationOTPExpire: {
        type: Date,
        select: false
    },
    tempPhone: {
        type: String,
        select: false
    }
}, {
    timestamps: true
});

// Index for faster queries
// userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate verification token
userSchema.methods.generateVerificationToken = function () {
    const crypto = require('crypto');
    const token = crypto.randomBytes(20).toString('hex');
    this.verificationToken = token;
    return token;
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
};

module.exports = mongoose.model('User', userSchema);