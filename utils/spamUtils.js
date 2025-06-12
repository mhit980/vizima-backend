// utils/spamUtils.js

// Spam keywords categorized by risk level
const spamKeywords = {
    high: [
        'urgent', 'limited time', 'act now', 'exclusive deal', 'guaranteed',
        'no questions asked', 'risk free', 'cash only', 'wire transfer',
        'western union', 'moneygram', 'advance fee', 'lottery', 'winner',
        'congratulations', 'selected', 'claim now', 'verify account',
        'suspend', 'urgent action required', 'click here now'
    ],
    medium: [
        'free money', 'easy money', 'work from home', 'make money fast',
        'no experience', 'earn extra', 'part time', 'full time income',
        'financial freedom', 'debt consolidation', 'credit repair',
        'lowest price', 'compare rates', 'refinance', 'pre-approved',
        'amazing deal', 'incredible offer', 'must see'
    ],
    low: [
        'discount', 'sale', 'offer', 'promotion', 'deal', 'cheap',
        'affordable', 'budget', 'save money', 'best price',
        'special price', 'reduced price', 'clearance', 'bargain'
    ]
};

// Suspicious patterns with regex and weights
const suspiciousPatterns = [
    {
        name: 'excessive_exclamation',
        regex: /!{3,}/g,
        weight: 0.2,
        description: 'Multiple exclamation marks'
    },
    {
        name: 'phone_numbers',
        regex: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
        weight: 0.15,
        description: 'Phone numbers in content'
    },
    {
        name: 'email_addresses',
        regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        weight: 0.15,
        description: 'Email addresses in content'
    },
    {
        name: 'excessive_numbers',
        regex: /\d{10,}/g,
        weight: 0.1,
        description: 'Long number sequences'
    },
    {
        name: 'currency_symbols',
        regex: /[$€£¥₹]{2,}|\$\d+k|\$\d+,\d+/g,
        weight: 0.1,
        description: 'Multiple currency symbols or large amounts'
    },
    {
        name: 'suspicious_urls',
        regex: /(bit\.ly|tinyurl|t\.co|goo\.gl)/gi,
        weight: 0.3,
        description: 'Shortened URLs'
    },
    {
        name: 'excessive_caps',
        regex: /[A-Z]{5,}/g,
        weight: 0.15,
        description: 'Excessive capitalization'
    },
    {
        name: 'unicode_characters',
        regex: /[^\x00-\x7F]{3,}/g,
        weight: 0.1,
        description: 'Excessive non-ASCII characters'
    }
];

// Risk indicators for property listings
const propertyRiskIndicators = {
    priceAnomalies: {
        // Prices significantly below market rate
        checkBelowMarket: (price, averagePrice) => {
            return price < (averagePrice * 0.5);
        },
        weight: 0.4
    },
    locationMismatches: {
        // Location doesn't match typical patterns
        checkLocationMismatch: (location, description) => {
            // Check if location mentioned in description matches listing location
            return false; // Implement based on your location data
        },
        weight: 0.3
    },
    imageConsistency: {
        // Check for stock photos or mismatched images
        checkImageConsistency: (images) => {
            // Implement image analysis if needed
            return images.length === 0; // No images is suspicious
        },
        weight: 0.2
    }
};

// User behavior risk indicators
const userRiskIndicators = {
    rapidPosting: {
        threshold: 5, // posts per hour
        weight: 0.3
    },
    incompleteProfile: {
        requiredFields: ['firstName', 'lastName', 'phone', 'profilePicture'],
        weight: 0.2
    },
    newAccount: {
        dayThreshold: 1, // accounts newer than 1 day
        weight: 0.25
    },
    suspiciousActivity: {
        multipleReports: 3, // threshold for spam reports
        weight: 0.4
    }
};

// Whitelist patterns (content that should not be flagged)
const whitelistPatterns = [
    {
        name: 'legitimate_business',
        regex: /(licensed|certified|registered|established \d{4})/gi,
        weight: -0.2 // Negative weight reduces spam score
    },
    {
        name: 'property_terms',
        regex: /(bedroom|bathroom|kitchen|furnished|unfurnished|utilities)/gi,
        weight: -0.1
    },
    {
        name: 'location_terms',
        regex: /(near|close to|walking distance|metro|subway|bus stop)/gi,
        weight: -0.05
    }
];

// Content quality indicators
const qualityIndicators = {
    detailedDescription: {
        minLength: 100,
        weight: -0.15 // Good quality reduces spam score
    },
    properGrammar: {
        // Simple grammar check - can be enhanced
        checkGrammar: (text) => {
            const sentences = text.split(/[.!?]+/);
            const avgWordsPerSentence = sentences.reduce((acc, sentence) => {
                return acc + sentence.trim().split(/\s+/).length;
            }, 0) / sentences.length;

            return avgWordsPerSentence > 5 && avgWordsPerSentence < 30;
        },
        weight: -0.1
    },
    hasImages: {
        minImages: 3,
        weight: -0.1
    }
};

// Report categories for user reporting
const reportCategories = {
    SPAM: 'spam',
    INAPPROPRIATE: 'inappropriate',
    FAKE_LISTING: 'fake_listing',
    DUPLICATE: 'duplicate',
    MISLEADING: 'misleading',
    OTHER: 'other'
};

// Action types for spam handling
const spamActions = {
    AUTO_REJECT: 'auto_reject',
    MANUAL_REVIEW: 'manual_review',
    AUTO_APPROVE: 'auto_approve',
    SHADOWBAN: 'shadowban',
    ACCOUNT_SUSPEND: 'account_suspend'
};

// Confidence thresholds for different actions
const actionThresholds = {
    [spamActions.AUTO_REJECT]: 0.9,
    [spamActions.MANUAL_REVIEW]: 0.6,
    [spamActions.SHADOWBAN]: 0.8,
    [spamActions.ACCOUNT_SUSPEND]: 0.95
};

/**
 * Utility functions
 */
const spamUtils = {
    /**
     * Calculate text similarity using simple algorithm
     */
    calculateSimilarity(text1, text2) {
        const words1 = text1.toLowerCase().split(/\s+/);
        const words2 = text2.toLowerCase().split(/\s+/);

        const intersection = words1.filter(word => words2.includes(word));
        const union = [...new Set([...words1, ...words2])];

        return intersection.length / union.length;
    },

    /**
     * Extract contact information from text
     */
    extractContactInfo(text) {
        const phones = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || [];
        const emails = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
        const urls = text.match(/https?:\/\/[^\s]+/gi) || [];

        return { phones, emails, urls };
    },

    /**
     * Check if content is duplicate or similar
     */
    async checkDuplicateContent(content, model) {
        try {
            const recentContent = await model.find({
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }).select('title description');

            for (const item of recentContent) {
                const similarity = this.calculateSimilarity(
                    content.title + ' ' + content.description,
                    item.title + ' ' + item.description
                );

                if (similarity > 0.8) {
                    return { isDuplicate: true, similarity, matchedId: item._id };
                }
            }

            return { isDuplicate: false };
        } catch (error) {
            console.error('Duplicate check error:', error);
            return { isDuplicate: false };
        }
    },

    /**
     * Generate spam report summary
     */
    generateReportSummary(detectionResult) {
        const { isSpam, confidence, scores, reasons, riskLevel } = detectionResult;

        return {
            summary: `${isSpam ? 'SPAM DETECTED' : 'CLEAN'} - ${confidence}% confidence`,
            riskLevel,
            topReasons: reasons.slice(0, 3),
            scoreBreakdown: {
                keywords: Math.round(scores.keywordScore * 100),
                patterns: Math.round(scores.patternScore * 100),
                user: Math.round(scores.userScore * 100),
                frequency: Math.round(scores.frequencyScore * 100)
            }
        };
    },

    /**
     * Get recommended action based on spam score
     */
    getRecommendedAction(spamScore, userHistory = {}) {
        if (spamScore >= actionThresholds[spamActions.AUTO_REJECT]) {
            return spamActions.AUTO_REJECT;
        }

        if (spamScore >= actionThresholds[spamActions.SHADOWBAN] && userHistory.repeatOffender) {
            return spamActions.ACCOUNT_SUSPEND;
        }

        if (spamScore >= actionThresholds[spamActions.SHADOWBAN]) {
            return spamActions.SHADOWBAN;
        }

        if (spamScore >= actionThresholds[spamActions.MANUAL_REVIEW]) {
            return spamActions.MANUAL_REVIEW;
        }

        return spamActions.AUTO_APPROVE;
    }
};

module.exports = {
    spamKeywords,
    suspiciousPatterns,
    propertyRiskIndicators,
    userRiskIndicators,
    whitelistPatterns,
    qualityIndicators,
    reportCategories,
    spamActions,
    actionThresholds,
    spamUtils
};