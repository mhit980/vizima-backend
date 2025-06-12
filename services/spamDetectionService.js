// services/spamDetectionService.js
const SpamReport = require('../models/SpamReport');
const { spamKeywords, suspiciousPatterns } = require('../utils/spamUtils');

class SpamDetectionService {
    constructor() {
        this.spamThreshold = 0.7; // Threshold for spam detection (0-1)
        this.moderationQueue = [];
    }

    /**
     * Main spam detection function
     * @param {Object} content - Content to analyze
     * @param {string} type - Type of content (property, booking, message)
     * @param {string} userId - User ID who created the content
     * @returns {Object} Detection result
     */
    async detectSpam(content, type, userId) {
        try {
            const scores = {
                keywordScore: this.analyzeKeywords(content),
                patternScore: this.analyzePatterns(content),
                userScore: await this.analyzeUserBehavior(userId),
                frequencyScore: await this.analyzeFrequency(userId, type)
            };

            const overallScore = this.calculateOverallScore(scores);
            const isSpam = overallScore >= this.spamThreshold;
            const confidence = Math.round(overallScore * 100);

            const result = {
                isSpam,
                confidence,
                scores,
                overallScore,
                riskLevel: this.getRiskLevel(overallScore),
                reasons: this.getSpamReasons(scores, content)
            };

            // Log detection for analysis
            await this.logDetection(content, type, userId, result);

            return result;
        } catch (error) {
            console.error('Spam detection error:', error);
            return { isSpam: false, confidence: 0, error: error.message };
        }
    }

    /**
     * Analyze content for spam keywords
     */
    analyzeKeywords(content) {
        if (!content || typeof content !== 'object') return 0;

        const textFields = ['title', 'description', 'message', 'name', 'comments'];
        let totalScore = 0;
        let fieldCount = 0;

        textFields.forEach(field => {
            if (content[field]) {
                const text = content[field].toLowerCase();
                let fieldScore = 0;

                // Check high-risk keywords
                spamKeywords.high.forEach(keyword => {
                    if (text.includes(keyword)) {
                        fieldScore += 0.3;
                    }
                });

                // Check medium-risk keywords
                spamKeywords.medium.forEach(keyword => {
                    if (text.includes(keyword)) {
                        fieldScore += 0.15;
                    }
                });

                // Check low-risk keywords
                spamKeywords.low.forEach(keyword => {
                    if (text.includes(keyword)) {
                        fieldScore += 0.05;
                    }
                });

                totalScore += Math.min(fieldScore, 1); // Cap at 1.0 per field
                fieldCount++;
            }
        });

        return fieldCount > 0 ? totalScore / fieldCount : 0;
    }

    /**
     * Analyze content for suspicious patterns
     */
    analyzePatterns(content) {
        if (!content || typeof content !== 'object') return 0;

        let score = 0;
        const textContent = Object.values(content)
            .filter(val => typeof val === 'string')
            .join(' ');

        // Check suspicious patterns
        suspiciousPatterns.forEach(pattern => {
            if (pattern.regex.test(textContent)) {
                score += pattern.weight;
            }
        });

        // Additional pattern checks
        if (this.hasExcessiveCapitalization(textContent)) score += 0.2;
        if (this.hasExcessivePunctuation(textContent)) score += 0.15;
        if (this.hasRepeatedText(textContent)) score += 0.25;
        if (this.hasSuspiciousUrls(textContent)) score += 0.4;

        return Math.min(score, 1);
    }

    /**
     * Analyze user behavior patterns
     */
    async analyzeUserBehavior(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) return 0;

            let score = 0;

            // New account risk
            const accountAge = Date.now() - user.createdAt.getTime();
            const daysOld = accountAge / (1000 * 60 * 60 * 24);
            if (daysOld < 1) score += 0.3;
            else if (daysOld < 7) score += 0.15;

            // Incomplete profile risk
            const profileFields = ['firstName', 'lastName', 'phone', 'profilePicture'];
            const missingFields = profileFields.filter(field => !user[field]);
            score += (missingFields.length / profileFields.length) * 0.2;

            // Previous spam reports
            const spamReports = await SpamReport.countDocuments({
                reportedUserId: userId,
                status: 'confirmed'
            });
            score += Math.min(spamReports * 0.2, 0.5);

            return Math.min(score, 1);
        } catch (error) {
            console.error('User behavior analysis error:', error);
            return 0;
        }
    }

    /**
     * Analyze posting frequency
     */
    async analyzeFrequency(userId, type) {
        try {
            const now = new Date();
            const oneHourAgo = new Date(now - 60 * 60 * 1000);
            const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

            let recentCount = 0;
            let dailyCount = 0;

            // Count recent posts based on type
            if (type === 'property') {
                recentCount = await Property.countDocuments({
                    owner: userId,
                    createdAt: { $gte: oneHourAgo }
                });
                dailyCount = await Property.countDocuments({
                    owner: userId,
                    createdAt: { $gte: oneDayAgo }
                });
            } else if (type === 'booking') {
                recentCount = await Booking.countDocuments({
                    user: userId,
                    createdAt: { $gte: oneHourAgo }
                });
                dailyCount = await Booking.countDocuments({
                    user: userId,
                    createdAt: { $gte: oneDayAgo }
                });
            }

            let score = 0;
            if (recentCount > 5) score += 0.4;
            else if (recentCount > 3) score += 0.2;

            if (dailyCount > 20) score += 0.3;
            else if (dailyCount > 10) score += 0.15;

            return Math.min(score, 1);
        } catch (error) {
            console.error('Frequency analysis error:', error);
            return 0;
        }
    }

    /**
     * Calculate overall spam score
     */
    calculateOverallScore(scores) {
        const weights = {
            keywordScore: 0.3,
            patternScore: 0.25,
            userScore: 0.25,
            frequencyScore: 0.2
        };

        return Object.keys(weights).reduce((total, key) => {
            return total + (scores[key] || 0) * weights[key];
        }, 0);
    }

    /**
     * Get risk level based on score
     */
    getRiskLevel(score) {
        if (score >= 0.8) return 'HIGH';
        if (score >= 0.6) return 'MEDIUM';
        if (score >= 0.3) return 'LOW';
        return 'MINIMAL';
    }

    /**
     * Get reasons for spam classification
     */
    getSpamReasons(scores, content) {
        const reasons = [];

        if (scores.keywordScore > 0.3) {
            reasons.push('Contains suspicious keywords');
        }
        if (scores.patternScore > 0.3) {
            reasons.push('Matches spam patterns');
        }
        if (scores.userScore > 0.3) {
            reasons.push('Suspicious user behavior');
        }
        if (scores.frequencyScore > 0.3) {
            reasons.push('High posting frequency');
        }

        return reasons;
    }

    /**
     * Log spam detection for analysis
     */
    async logDetection(content, type, userId, result) {
        try {
            // Only log if spam detected or high confidence
            if (result.isSpam || result.confidence > 50) {
                await SpamReport.create({
                    contentType: type,
                    contentId: content._id || content.id,
                    userId,
                    detectionResult: result,
                    status: result.isSpam ? 'flagged' : 'monitored',
                    detectedAt: new Date()
                });
            }
        } catch (error) {
            console.error('Failed to log spam detection:', error);
        }
    }

    // Helper methods for pattern detection
    hasExcessiveCapitalization(text) {
        const words = text.split(/\s+/);
        const capsWords = words.filter(word =>
            word.length > 2 && word === word.toUpperCase()
        );
        return capsWords.length / words.length > 0.3;
    }

    hasExcessivePunctuation(text) {
        const punctuationCount = (text.match(/[!?]{2,}/g) || []).length;
        return punctuationCount > 2;
    }

    hasRepeatedText(text) {
        const words = text.toLowerCase().split(/\s+/);
        const wordCount = {};

        words.forEach(word => {
            if (word.length > 3) {
                wordCount[word] = (wordCount[word] || 0) + 1;
            }
        });

        return Object.values(wordCount).some(count => count > 3);
    }

    hasSuspiciousUrls(text) {
        const urlRegex = /https?:\/\/[^\s]+/gi;
        const urls = text.match(urlRegex) || [];

        // Check for suspicious URL patterns
        return urls.some(url => {
            return url.includes('bit.ly') ||
                url.includes('tinyurl') ||
                url.includes('t.co') ||
                url.match(/\d+\.\d+\.\d+\.\d+/); // IP addresses
        });
    }
}

module.exports = new SpamDetectionService();