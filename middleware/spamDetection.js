// middleware/spamDetection.js
const spamDetectionService = require('../services/spamDetectionService');
const SpamReport = require('../models/SpamReport');
const { spamActions, actionThresholds } = require('../utils/spamUtils');

/**
 * Middleware to detect spam in content before saving
 */
const detectSpam = (contentType) => {
    return async (req, res, next) => {
        try {
            const content = req.body;
            const userId = req.user.id;

            // Skip spam detection for admin users
            if (req.user.role === 'admin') {
                return next();
            }

            // Run spam detection
            const detectionResult = await spamDetectionService.detectSpam(
                content,
                contentType,
                userId
            );

            // Add detection result to request for logging
            req.spamDetection = detectionResult;

            // Determine action based on spam score
            const action = getActionFromScore(detectionResult.overallScore);

            switch (action) {
                case spamActions.AUTO_REJECT:
                    // Create spam report and reject
                    await createSpamReport(content, contentType, userId, detectionResult);
                    return res.status(400).json({
                        success: false,
                        message: 'Content rejected due to spam detection',
                        spamScore: Math.round(detectionResult.confidence)
                    });

                case spamActions.MANUAL_REVIEW:
                    // Create spam report and queue for manual review
                    await createSpamReport(content, contentType, userId, detectionResult);
                    req.requiresManualReview = true;
                    break;

                case spamActions.SHADOWBAN:
                    // Allow content but mark user for shadowban
                    await createSpamReport(content, contentType, userId, detectionResult);
                    req.applyShadowban = true;
                    break;

                case spamActions.AUTO_APPROVE:
                default:
                    // Content is clean, proceed normally
                    break;
            }

            next();
        } catch (error) {
            console.error('Spam detection middleware error:', error);
            // Don't block the request on spam detection errors
            next();
        }
    };
};

/**
 * Middleware to check user spam status before allowing actions
 */
const checkUserSpamStatus = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Check if user is banned or suspended
        if (req.user.status === 'banned') {
            return res.status(403).json({
                success: false,
                message: 'Account has been banned due to spam violations'
            });
        }

        if (req.user.status === 'suspended') {
            const suspendedUntil = req.user.suspendedUntil;
            if (suspendedUntil && suspendedUntil > new Date()) {
                return res.status(403).json({
                    success: false,
                    message: `Account is suspended until ${suspendedUntil.toDateString()}`
                });
            }
        }

        // Check for recent spam reports
        const recentSpamReports = await SpamReport.countDocuments({
            reportedUserId: userId,
            status: 'confirmed',
            reportedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        if (recentSpamReports >= 3) {
            return res.status(429).json({
                success: false,
                message: 'Too many spam violations. Please contact support.'
            });
        }

        next();
    } catch (error) {
        console.error('User spam status check error:', error);
        next();
    }
};

/**
 * Middleware to rate limit based on user behavior
 */
const adaptiveRateLimit = (contentType) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
            const now = new Date();
            const oneHour = new Date(now - 60 * 60 * 1000);

            // Get user's recent spam score
            const recentReports = await SpamReport.find({
                reportedUserId: userId,
                reportedAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) }
            }).sort({ reportedAt: -1 }).limit(5);

            const avgSpamScore = recentReports.length > 0
                ? recentReports.reduce((sum, report) => sum + (report.detectionResult?.overallScore || 0), 0) / recentReports.length
                : 0;

            // Adjust rate limits based on spam score
            let maxRequestsPerHour = 10; // Base limit

            if (avgSpamScore > 0.7) {
                maxRequestsPerHour = 2; // Strict limit for high-risk users
            } else if (avgSpamScore > 0.5) {
                maxRequestsPerHour = 5; // Medium limit for medium-risk users
            }

            // Count recent requests (you might want to use Redis for this in production)
            const recentRequests = await getRecentRequests(userId, contentType, oneHour);

            if (recentRequests >= maxRequestsPerHour) {
                return res.status(429).json({
                    success: false,
                    message: 'Rate limit exceeded. Please try again later.',
                    retryAfter: 3600 // 1 hour
                });
            }

            // Log this request
            await logRequest(userId, contentType);

            next();
        } catch (error) {
            console.error('Adaptive rate limit error:', error);
            next();
        }
    };
};

/**
 * Middleware to handle post-creation spam actions
 */
const handlePostCreationActions = async (req, res, next) => {
    try {
        // Apply shadowban if flagged
        if (req.applyShadowban) {
            req.user.shadowBanned = true;
            await req.user.save();
        }

        // Mark content for manual review if required
        if (req.requiresManualReview && res.locals.createdContent) {
            res.locals.createdContent.requiresReview = true;
            res.locals.createdContent.status = 'pending_review';
            await res.locals.createdContent.save();
        }

        next();
    } catch (error) {
        console.error('Post-creation actions error:', error);
        next();
    }
};

/**
 * Middleware to log spam detection results
 */
const logSpamDetection = async (req, res, next) => {
    // Log after response is sent
    res.on('finish', async () => {
        try {
            if (req.spamDetection && req.spamDetection.confidence > 30) {
                console.log('Spam Detection Log:', {
                    userId: req.user.id,
                    contentType: req.route.path,
                    spamScore: req.spamDetection.overallScore,
                    confidence: req.spamDetection.confidence,
                    reasons: req.spamDetection.reasons,
                    timestamp: new Date()
                });
            }
        } catch (error) {
            console.error('Spam detection logging error:', error);
        }
    });

    next();
};

// Helper functions
function getActionFromScore(spamScore) {
    if (spamScore >= actionThresholds[spamActions.AUTO_REJECT]) {
        return spamActions.AUTO_REJECT;
    }
    if (spamScore >= actionThresholds[spamActions.SHADOWBAN]) {
        return spamActions.SHADOWBAN;
    }
    if (spamScore >= actionThresholds[spamActions.MANUAL_REVIEW]) {
        return spamActions.MANUAL_REVIEW;
    }
    return spamActions.AUTO_APPROVE;
}

async function createSpamReport(content, contentType, userId, detectionResult) {
    try {
        await SpamReport.create({
            contentType,
            contentId: content._id || content.id,
            reportedUserId: userId,
            reportType: 'automated',
            detectionResult,
            status: detectionResult.isSpam ? 'pending' : 'monitored',
            severity: getSeverityFromScore(detectionResult.overallScore),
            metadata: {
                detectionVersion: '1.0',
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error('Failed to create spam report:', error);
    }
}

function getSeverityFromScore(score) {
    if (score >= 0.8) return 'high';
    if (score >= 0.6) return 'medium';
    return 'low';
}

// Simple in-memory request logging (use Redis in production)
const requestLog = new Map();

async function getRecentRequests(userId, contentType, since) {
    const key = `${userId}-${contentType}`;
    const requests = requestLog.get(key) || [];
    return requests.filter(timestamp => timestamp >= since).length;
}

async function logRequest(userId, contentType) {
    const key = `${userId}-${contentType}`;
    const requests = requestLog.get(key) || [];
    requests.push(new Date());

    // Keep only last 100 requests
    if (requests.length > 100) {
        requests.splice(0, requests.length - 100);
    }

    requestLog.set(key, requests);
}

// Clean up old request logs periodically
setInterval(() => {
    const oneHour = new Date(Date.now() - 60 * 60 * 1000);
    for (const [key, requests] of requestLog.entries()) {
        const filtered = requests.filter(timestamp => timestamp >= oneHour);
        if (filtered.length === 0) {
            requestLog.delete(key);
        } else {
            requestLog.set(key, filtered);
        }
    }
}, 60 * 60 * 1000); // Clean every hour

module.exports = {
    detectSpam,
    checkUserSpamStatus,
    adaptiveRateLimit,
    handlePostCreationActions,
    logSpamDetection
};