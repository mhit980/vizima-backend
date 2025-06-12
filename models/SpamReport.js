// models/SpamReport.js
const mongoose = require('mongoose');

const spamReportSchema = new mongoose.Schema({
    // Content information
    contentType: {
        type: String,
        enum: ['property', 'booking', 'message', 'user', 'review'],
        required: true
    },
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'contentType'
    },

    // Reporter information (for user-generated reports)
    reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // null for system-generated reports
    },

    // Reported user
    reportedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Report details
    reportType: {
        type: String,
        enum: ['automated', 'user_reported', 'admin_flagged'],
        default: 'automated'
    },

    category: {
        type: String,
        enum: ['spam', 'inappropriate', 'fake_listing', 'duplicate', 'misleading', 'other'],
        default: 'spam'
    },

    // Detection results (for automated reports)
    detectionResult: {
        isSpam: Boolean,
        confidence: Number,
        overallScore: Number,
        riskLevel: {
            type: String,
            enum: ['MINIMAL', 'LOW', 'MEDIUM', 'HIGH']
        },
        scores: {
            keywordScore: Number,
            patternScore: Number,
            userScore: Number,
            frequencyScore: Number
        },
        reasons: [String]
    },

    // User report details
    userReportDetails: {
        reason: String,
        description: String,
        evidence: [String] // URLs to screenshots or other evidence
    },

    // Status and resolution
    status: {
        type: String,
        enum: ['pending', 'under_review', 'confirmed', 'false_positive', 'resolved', 'dismissed'],
        default: 'pending'
    },

    // Admin review
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    reviewedAt: {
        type: Date,
        default: null
    },

    reviewNotes: {
        type: String,
        default: null
    },

    // Actions taken
    actionTaken: {
        type: String,
        enum: ['none', 'warning', 'content_removed', 'user_suspended', 'user_banned', 'shadowban'],
        default: 'none'
    },

    actionDetails: {
        duration: Number, // in days, for suspensions
        reason: String,
        automaticExpiry: Date
    },

    // Severity and priority
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },

    priority: {
        type: Number,
        min: 1,
        max: 10,
        default: 5
    },

    // Timestamps
    reportedAt: {
        type: Date,
        default: Date.now
    },

    resolvedAt: {
        type: Date,
        default: null
    },

    // Metadata
    metadata: {
        ipAddress: String,
        userAgent: String,
        location: {
            country: String,
            city: String,
            coordinates: {
                latitude: Number,
                longitude: Number
            }
        },
        deviceInfo: {
            type: String, // mobile, desktop, tablet
            os: String,
            browser: String
        }
    },

    // Related reports (for tracking patterns)
    relatedReports: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SpamReport'
    }],

    // Appeal information
    appeal: {
        submitted: {
            type: Boolean,
            default: false
        },
        submittedAt: Date,
        reason: String,
        status: {
            type: String,
            enum: ['pending', 'approved', 'denied'],
            default: 'pending'
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reviewedAt: Date,
        reviewNotes: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
spamReportSchema.index({ reportedUserId: 1, status: 1 });
spamReportSchema.index({ contentType: 1, contentId: 1 });
spamReportSchema.index({ reportType: 1, status: 1 });
spamReportSchema.index({ reportedAt: -1 });
spamReportSchema.index({ severity: 1, priority: -1 });
spamReportSchema.index({ 'detectionResult.confidence': -1 });

// Virtual for getting content reference
spamReportSchema.virtual('content', {
    refPath: 'contentType',
    localField: 'contentId',
    foreignField: '_id',
    justOne: true
});

// Virtual for reporter information
spamReportSchema.virtual('reporter', {
    ref: 'User',
    localField: 'reporterId',
    foreignField: '_id',
    justOne: true
});

// Virtual for reported user information
spamReportSchema.virtual('reportedUser', {
    ref: 'User',
    localField: 'reportedUserId',
    foreignField: '_id',
    justOne: true
});

// Virtual for admin who reviewed
spamReportSchema.virtual('reviewer', {
    ref: 'User',
    localField: 'reviewedBy',
    foreignField: '_id',
    justOne: true
});

// Virtual for appeal reviewer
spamReportSchema.virtual('appealReviewer', {
    ref: 'User',
    localField: 'appeal.reviewedBy',
    foreignField: '_id',
    justOne: true
});

// Virtual for time elapsed since report
spamReportSchema.virtual('timeElapsed').get(function () {
    return Date.now() - this.reportedAt;
});

// Virtual for resolution time
spamReportSchema.virtual('resolutionTime').get(function () {
    if (this.resolvedAt) {
        return this.resolvedAt - this.reportedAt;
    }
    return null;
});

// Virtual for is urgent (high priority and recent)
spamReportSchema.virtual('isUrgent').get(function () {
    const isHighPriority = this.priority >= 8 || this.severity === 'critical';
    const isRecent = (Date.now() - this.reportedAt) < 24 * 60 * 60 * 1000; // 24 hours
    return isHighPriority && isRecent && this.status === 'pending';
});

// Pre-save middleware to auto-calculate priority based on severity and confidence
spamReportSchema.pre('save', function (next) {
    if (this.isNew || this.isModified('severity') || this.isModified('detectionResult.confidence')) {
        let basePriority = 5;

        // Adjust based on severity
        switch (this.severity) {
            case 'critical':
                basePriority = 9;
                break;
            case 'high':
                basePriority = 7;
                break;
            case 'medium':
                basePriority = 5;
                break;
            case 'low':
                basePriority = 3;
                break;
        }

        // Adjust based on confidence if it's an automated report
        if (this.reportType === 'automated' && this.detectionResult?.confidence) {
            if (this.detectionResult.confidence > 0.9) {
                basePriority += 2;
            } else if (this.detectionResult.confidence > 0.7) {
                basePriority += 1;
            } else if (this.detectionResult.confidence < 0.5) {
                basePriority -= 1;
            }
        }

        // Ensure priority stays within bounds
        this.priority = Math.max(1, Math.min(10, basePriority));
    }

    next();
});

// Pre-save middleware to set resolvedAt when status changes to resolved
spamReportSchema.pre('save', function (next) {
    if (this.isModified('status') &&
        ['resolved', 'dismissed', 'false_positive'].includes(this.status) &&
        !this.resolvedAt) {
        this.resolvedAt = new Date();
    }
    next();
});

// Static method to find pending reports by user
spamReportSchema.statics.findPendingByUser = function (userId) {
    return this.find({
        reportedUserId: userId,
        status: { $in: ['pending', 'under_review'] }
    }).sort({ reportedAt: -1 });
};

// Static method to find urgent reports
spamReportSchema.statics.findUrgent = function () {
    return this.find({
        $or: [
            { severity: 'critical' },
            { priority: { $gte: 8 } }
        ],
        status: { $in: ['pending', 'under_review'] }
    }).sort({ priority: -1, reportedAt: -1 });
};

// Static method to get reports by confidence range
spamReportSchema.statics.findByConfidence = function (minConfidence, maxConfidence) {
    return this.find({
        'detectionResult.confidence': {
            $gte: minConfidence,
            $lte: maxConfidence
        }
    }).sort({ 'detectionResult.confidence': -1 });
};

// Instance method to mark as reviewed
spamReportSchema.methods.markAsReviewed = function (reviewerId, notes, action = 'none') {
    this.reviewedBy = reviewerId;
    this.reviewedAt = new Date();
    this.reviewNotes = notes;
    this.actionTaken = action;
    this.status = 'under_review';
    return this.save();
};

// Instance method to resolve report
spamReportSchema.methods.resolve = function (status, reviewerId, notes) {
    this.status = status;
    this.reviewedBy = reviewerId;
    this.reviewedAt = new Date();
    this.reviewNotes = notes;
    this.resolvedAt = new Date();
    return this.save();
};

// Instance method to add related report
spamReportSchema.methods.addRelatedReport = function (reportId) {
    if (!this.relatedReports.includes(reportId)) {
        this.relatedReports.push(reportId);
        return this.save();
    }
    return Promise.resolve(this);
};

// Instance method to submit appeal
spamReportSchema.methods.submitAppeal = function (reason) {
    this.appeal.submitted = true;
    this.appeal.submittedAt = new Date();
    this.appeal.reason = reason;
    this.appeal.status = 'pending';
    return this.save();
};

// Instance method to review appeal
spamReportSchema.methods.reviewAppeal = function (reviewerId, status, notes) {
    this.appeal.reviewedBy = reviewerId;
    this.appeal.reviewedAt = new Date();
    this.appeal.status = status;
    this.appeal.reviewNotes = notes;

    // If appeal is approved, change the main report status
    if (status === 'approved') {
        this.status = 'false_positive';
        this.resolvedAt = new Date();
    }

    return this.save();
};

// Instance method to check if report is stale (pending for too long)
spamReportSchema.methods.isStale = function () {
    const staleThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days
    return this.status === 'pending' && (Date.now() - this.reportedAt) > staleThreshold;
};

module.exports = mongoose.model('SpamReport', spamReportSchema);