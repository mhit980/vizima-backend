// utils/generateToken.js
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Generate JWT token for authentication
 * @param {string} userId - User ID
 * @param {object} payload - Additional payload data
 * @param {string} expiresIn - Token expiration time
 * @returns {string} JWT token
 */
const generateJWTToken = (userId, payload = {}, expiresIn = process.env.JWT_EXPIRE || '7d') => {
    const tokenPayload = {
        id: userId,
        ...payload,
        iat: Math.floor(Date.now() / 1000), // Issued at
    };

    return jwt.sign(tokenPayload, process.env.JWT_SECRET, {
        expiresIn,
        issuer: 'vizima-property-rental',
        audience: 'vizima-users',
    });
};

/**
 * Generate access token (short-lived)
 * @param {string} userId - User ID
 * @param {object} userInfo - User information
 * @returns {string} Access token
 */
const generateAccessToken = (userId, userInfo = {}) => {
    return generateJWTToken(userId, {
        type: 'access',
        email: userInfo.email,
        role: userInfo.role,
        name: userInfo.name,
    }, '15m'); // 15 minutes
};

/**
 * Generate refresh token (long-lived)
 * @param {string} userId - User ID
 * @returns {string} Refresh token
 */
const generateRefreshToken = (userId) => {
    return generateJWTToken(userId, {
        type: 'refresh',
    }, '30d'); // 30 days
};

/**
 * Generate email verification token
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @returns {string} Verification token
 */
const generateEmailVerificationToken = (userId, email) => {
    return generateJWTToken(userId, {
        type: 'email_verification',
        email,
    }, '24h'); // 24 hours
};

/**
 * Generate password reset token
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @returns {string} Password reset token
 */
const generatePasswordResetToken = (userId, email) => {
    return generateJWTToken(userId, {
        type: 'password_reset',
        email,
    }, '1h'); // 1 hour
};

/**
 * Generate random token using crypto
 * @param {number} length - Token length (default: 32)
 * @returns {string} Random token
 */
const generateRandomToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate secure random string
 * @param {number} length - String length
 * @param {string} charset - Character set to use
 * @returns {string} Random string
 */
const generateSecureRandomString = (length = 16, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
    let result = '';
    const charsetLength = charset.length;

    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, charsetLength);
        result += charset[randomIndex];
    }

    return result;
};

/**
 * Generate API key
 * @param {string} prefix - API key prefix
 * @returns {string} API key
 */
const generateAPIKey = (prefix = 'vz') => {
    const timestamp = Date.now().toString(36);
    const randomPart = generateSecureRandomString(24);
    return `${prefix}_${timestamp}_${randomPart}`;
};

/**
 * Generate booking reference
 * @returns {string} Booking reference
 */
const generateBookingReference = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = generateSecureRandomString(6, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');

    return `VZ${year}${month}${day}${random}`;
};

/**
 * Generate property reference
 * @param {string} propertyType - Type of property
 * @returns {string} Property reference
 */
const generatePropertyReference = (propertyType = 'PROP') => {
    const typeCode = propertyType.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = generateSecureRandomString(4, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');

    return `${typeCode}-${timestamp}-${random}`;
};

/**
 * Generate OTP (One-Time Password)
 * @param {number} length - OTP length (default: 6)
 * @returns {string} OTP
 */
const generateOTP = (length = 6) => {
    const digits = '0123456789';
    let otp = '';

    for (let i = 0; i < length; i++) {
        otp += digits[crypto.randomInt(0, digits.length)];
    }

    return otp;
};

/**
 * Generate session token
 * @param {string} userId - User ID
 * @param {string} deviceId - Device identifier
 * @returns {object} Session token and expiry
 */
const generateSessionToken = (userId, deviceId = '') => {
    const sessionId = generateRandomToken(48);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const sessionData = {
        sessionId,
        userId,
        deviceId,
        createdAt: new Date(),
        expiresAt,
    };

    return {
        token: Buffer.from(JSON.stringify(sessionData)).toString('base64'),
        expiresAt,
        sessionId,
    };
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @param {string} expectedType - Expected token type
 * @returns {object} Decoded token payload
 */
const verifyJWTToken = (token, expectedType = null) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            issuer: 'vizima-property-rental',
            audience: 'vizima-users',
        });

        if (expectedType && decoded.type !== expectedType) {
            throw new Error(`Invalid token type. Expected: ${expectedType}, Got: ${decoded.type}`);
        }

        return decoded;
    } catch (error) {
        throw new Error(`Token verification failed: ${error.message}`);
    }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if expired
 */
const isTokenExpired = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) return true;

        return Date.now() >= decoded.exp * 1000;
    } catch (error) {
        return true;
    }
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} Expiration date
 */
const getTokenExpiration = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) return null;

        return new Date(decoded.exp * 1000);
    } catch (error) {
        return null;
    }
};

/**
 * Generate token pair (access + refresh)
 * @param {string} userId - User ID
 * @param {object} userInfo - User information
 * @returns {object} Token pair
 */
const generateTokenPair = (userId, userInfo = {}) => {
    const accessToken = generateAccessToken(userId, userInfo);
    const refreshToken = generateRefreshToken(userId);

    return {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
        expiresIn: 15 * 60, // 15 minutes in seconds
        accessTokenExpiry: new Date(Date.now() + 15 * 60 * 1000),
        refreshTokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };
};

/**
 * Generate magic link token for passwordless login
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @returns {string} Magic link token
 */
const generateMagicLinkToken = (userId, email) => {
    return generateJWTToken(userId, {
        type: 'magic_link',
        email,
    }, '30m'); // 30 minutes
};

/**
 * Generate invitation token
 * @param {string} email - Invitee email
 * @param {string} inviterId - Inviter user ID
 * @param {string} role - Role for the invitee
 * @returns {string} Invitation token
 */
const generateInvitationToken = (email, inviterId, role = 'user') => {
    return generateJWTToken(inviterId, {
        type: 'invitation',
        email,
        role,
        inviterId,
    }, '7d'); // 7 days
};

// Token types enum
const TOKEN_TYPES = {
    ACCESS: 'access',
    REFRESH: 'refresh',
    EMAIL_VERIFICATION: 'email_verification',
    PASSWORD_RESET: 'password_reset',
    MAGIC_LINK: 'magic_link',
    INVITATION: 'invitation',
};

module.exports = {
    generateJWTToken,
    generateAccessToken,
    generateRefreshToken,
    generateEmailVerificationToken,
    generatePasswordResetToken,
    generateRandomToken,
    generateSecureRandomString,
    generateAPIKey,
    generateBookingReference,
    generatePropertyReference,
    generateOTP,
    generateSessionToken,
    generateTokenPair,
    generateMagicLinkToken,
    generateInvitationToken,
    verifyJWTToken,
    isTokenExpired,
    getTokenExpiration,
    TOKEN_TYPES,
};