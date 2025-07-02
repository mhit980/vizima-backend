const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const twilio = require('twilio');
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


const sendEmail = async (options) => {
    const msg = {
        to: options.email,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: options.subject,
        text: options.message,
        html: options.html || options.message,
    };

    try {
        await sgMail.send(msg);
        console.log('Email sent successfully via SendGrid');
    } catch (error) {
        console.error('Error sending email via SendGrid:', error);
        throw error;
    }
}

const sendSMS = async (phone, message) => {
    try {
        const result = await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone
        });
        console.log('SMS sent successfully via Twilio:', result.sid);
    } catch (error) {
        console.error('Error sending SMS via Twilio:', error);
        throw error;
    }
}

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}


// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, password, phone, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phone,
            role: role || 'user'
        });

        console.log('======>>>', user);

        // Generate verification token
        const verificationToken = user.generateVerificationToken();
        await user.save();

        // Send verification email
        try {
            const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
            await sendEmail({
                email: user.email,
                subject: 'Email Verification - Property Rental',
                message: `Please click the following link to verify your email: ${verificationUrl}`,
                html: `
                    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px;">
                        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
                        
                        <h2 style="color: #2c3e50; text-align: center;">✅ Verify Your Email Address</h2>

                        <p style="font-size: 16px; color: #555; line-height: 1.6;">
                            Hi <strong>${user.name || 'there'}</strong>,
                            <br><br>
                            Thanks for signing up on <strong>Property Rental</strong>. To complete your registration, please verify your email address by clicking the button below.
                        </p>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verificationUrl}" style="background-color: #28a745; color: white; padding: 14px 28px; text-decoration: none; font-size: 16px; border-radius: 6px; display: inline-block;">
                            Verify Email
                            </a>
                        </div>

                        <p style="font-size: 14px; color: #777; line-height: 1.5;">
                            If the button above doesn't work, you can also copy and paste the link below into your browser:
                        </p>

                        <p style="word-break: break-word; font-size: 14px; color: #007bff;">
                            <a href="${verificationUrl}" style="color: #007bff;">${verificationUrl}</a>
                        </p>

                        <p style="font-size: 14px; color: #999; margin-top: 30px;">
                            If you didn’t sign up for this account, you can safely ignore this email.
                        </p>

                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

                        <p style="text-align: center; font-size: 12px; color: #bbb;">
                            © ${new Date().getFullYear()} Property Rental. All rights reserved.
                        </p>
                        </div>
                    </div>
                `
            });
        } catch (error) {
            console.error('Email sending failed:', error);
        }

        if (phone) {
            try {
                await sendSMS(phone, `Welcome to Property Rental, ${name}! Your account has been created successfully. Please verify your email to get started.`);
            } catch (error) {
                console.error('Welcome SMS failed', error);
            }
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email for verification.',
            token,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    isVerified: user.isVerified
                }
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Check if user exists and get password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    isVerified: user.isVerified,
                    avatar: user.avatar
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};


/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
    try {
        const userId = req.user._id; // Available from auth middleware

        // await User.findByIdAndUpdate(userId, { refreshToken: null });

        return res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during logout'
        });
    }
};




/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    isVerified: user.isVerified,
                    avatar: user.avatar,
                    preferences: user.preferences,
                    createdAt: user.createdAt
                }
            }
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, phone, preferences } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                name: name || req.user.name,
                phone: phone || req.user.phone,
                preferences: preferences || req.user.preferences
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Verify email
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 */
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        if (user.phone) {
            try {
                await sendSMS(user.phone, `Congratulations ${user.name}! Your email has been verified successfully. Welcome to Property Rental!`)
            } catch (error) {
                console.error('Verification SMS failed', error);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        console.log('====>', user);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate reset token
        const resetToken = user.getResetPasswordToken();

        const otp = generateOTP();
        user.passwordResetOTP = otp;
        user.passwordResetOTPExpire = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

        await user.save();

        // Send reset email
        try {
            const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
            await sendEmail({
                email: user.email,
                subject: 'Password Reset - Property Rental',
                message: `Please click the following link to reset your password: ${resetUrl}`,
                html: `
                    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px;">
                        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
                        <h2 style="color: #333333;">🔐 Password Reset Token</h2>
                        <p style="font-size: 16px; color: #555555;">
                            We received a request to reset your password. Please use the token below to complete the password reset process.
                        </p>

                        <div style="margin: 30px 0; text-align: center;">
                            <div style="display: inline-block; background-color: #f1f1f1; padding: 16px 32px; border-radius: 8px; font-size: 20px; color: #333333; font-weight: bold; letter-spacing: 1px;">
                            ${resetUrl.split('/').pop()}
                            </div>
                        </div>

                        <p style="font-size: 14px; color: #777777;">
                            If you didn’t request this, please ignore this email. This token will expire in <strong>1 hour</strong>.
                        </p>

                        <p style="color: #cccccc; font-size: 12px; text-align: center; margin-top: 40px;">
                            © ${new Date().getFullYear()} Property Rental. All rights reserved.
                        </p>
                        </div>
                    </div>
                `
            });

            if (user.phone) {
                await sendSMS(user.phone, `Your password reset OTP is: ${otp}. This OTP will expire in 10 minutes. If you didn't request this, please ignore.`);
            }

            res.status(200).json({
                success: true,
                message: 'Password reset instructions sent to your email and SMS',
                data: {
                    otpSent: !!user.phone
                }
            });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            user.passwordResetOTP = undefined;
            user.passwordResetOTPExpire = undefined;
            await user.save();

            return res.status(500).json({
                success: false,
                message: 'Unable to send password reset instructions'
            });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Verify OTP for password reset
 * @route   POST /api/auth/verify-reset-otp
 * @access  Public
 */
const verifyResetOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({
            email,
            passwordResetOTP: otp,
            passwordResetOTPExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Mark OTP as verified
        user.otpVerified = true;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully'
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}


/**
 * @desc    Reset password
 * @route   PUT /api/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.passwordResetOTP = undefined;
        user.passwordResetOTPExpire = undefined;
        user.otpVerified = undefined;
        await user.save();

        if (user.phone) {
            try {
                await sendSMS(user.phone, `Hi ${user.name}, your password has been reset successfully. If this wasn't you, please contact support immediately.`);
            } catch (error) {
                console.error('Password reset confirmation SMS failed', error)
            }
        }

        // Generate new token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Password reset successful',
            token
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

/**
 * @desc    Send OTP for phone verification
 * @route   POST /api/auth/send-phone-otp
 * @access  Private
 */

const sendPhoneOTP = async (req, res) => {
    try {
        const { phone } = req.body;
        const userId = req.user.id;

        
        const user = await User.findById(userId);

        if(!user) return res.status(404).json({success: false, message: 'User not found'});
        
        const otp = generateOTP();

        // await User.findByIdAndUpdate(userId, {
        //     tempPhone: phone,
        //     phoneVerificationOTP: otp,
        //     phoneVerificationOTPExpire: Date.now() + 10 * 60 * 1000,
        // });
        await sendSMS(phone, `Your phone verification OTP is: ${otp}. This OTP will expire in 10 minutes.`);

        user.tempPhone = phone;
        user.phoneVerificationOTP = otp;
        user.phoneVerificationOTPExpire = Date.now() + 10 * 60 * 1000; // 10 min expiry
        await user.save();


        res.status(200).json({
            success: true,
            message: 'OTP sent to your phone number'
        });
    } catch (error) {
        console.error('Send phone OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP'
        });
    }
}

/**
 * @desc    Verify phone OTP
 * @route   POST /api/auth/verify-phone-otp
 * @access  Private
 */

const verifyPhoneOTP = async (req, res) => {
    try {
        const { otp } = req.body;
        const userId = req.user.id;

        const user = await User.findOne({
            _id: userId,
            phoneVerificationOTP: otp,
            phoneVerificationOTPExpire: { $gt: Date.now() }
        }).select('+tempPhone');

        console.log('===========>>>>', user)

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            })
        }

        user.phone = user.tempPhone;
        user.isPhoneVerified = true;
        user.phoneVerificationOTP = undefined;
        user.phoneVerificationOTPExpire = undefined;
        user.tempPhone = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Phone number verified successfully',
            data: {
                user: {
                    id: user._id,
                    phone: user.phone,
                    isPhoneVerified: user.isPhoneVerified
                }
            }
        })
    } catch (error) {
        console.error('Verify phone OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}

module.exports = {
    register,
    login,
    getMe,
    updateProfile,
    verifyEmail,
    forgotPassword,
    resetPassword,
    logout,
    verifyResetOTP,
    sendPhoneOTP,
    verifyPhoneOTP,
};