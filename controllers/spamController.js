// controllers/spamController.js
const SpamReport = require('../models/SpamReport');
const spamDetectionService = require('../services/spamDetectionService');
const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const { spamUtils } = require('../utils/spamUtils');

class SpamController {

    constructor() {
        this.submitReport = this.submitReport.bind(this);
    }
    /**
     * Get all spam reports with pagination and filtering
     */
    async getSpamReports(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                status,
                severity,
                contentType,
                reportType,
                sortBy = 'reportedAt',
                sortOrder = 'desc'
            } = req.query;

            const filter = {};
            if (status) filter.status = status;
            if (severity) filter.severity = severity;
            if (contentType) filter.contentType = contentType;
            if (reportType) filter.reportType = reportType;

            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 },
                populate: [
                    { path: 'reportedUser', select: 'firstName lastName email' },
                    { path: 'reporter', select: 'firstName lastName email' },
                    { path: 'reviewer', select: 'firstName lastName email' }
                ]
            };

            const reports = await SpamReport.paginate(filter, options);

            res.json({
                success: true,
                data: reports
            });
        } catch (error) {
            console.error('Get spam reports error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch spam reports'
            });
        }
    }

    /**
     * Get urgent spam reports that need immediate attention
     */
    async getUrgentReports(req, res) {
        try {
            const urgentReports = await SpamReport.findUrgent()
                .populate('reportedUser', 'firstName lastName email')
                .populate('content')
                .limit(20);

            res.json({
                success: true,
                data: urgentReports
            });
        } catch (error) {
            console.error('Get urgent reports error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch urgent reports'
            });
        }
    }

    /**
     * Get spam reports for a specific user
     */
    async getUserReports(req, res) {
        try {
            const { userId } = req.params;
            const reports = await SpamReport.findPendingByUser(userId)
                .populate('content')
                .populate('reporter', 'firstName lastName email');

            res.json({
                success: true,
                data: reports
            });
        } catch (error) {
            console.error('Get user reports error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user reports'
            });
        }
    }

    /**
     * Review a spam report
     */
    async reviewReport(req, res) {
        try {
            const { reportId } = req.params;
            const { status, notes, action = 'none' } = req.body;
            const reviewerId = req.user.id;

            const report = await SpamReport.findById(reportId);
            if (!report) {
                return res.status(404).json({
                    success: false,
                    message: 'Spam report not found'
                });
            }

            await report.resolve(status, reviewerId, notes);

            // Take action if specified
            if (action !== 'none') {
                await this.takeAction(report, action);
            }

            res.json({
                success: true,
                message: 'Report reviewed successfully',
                data: report
            });
        } catch (error) {
            console.error('Review report error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to review report'
            });
        }
    }

    /**
     * Bulk review multiple reports
     */
    async bulkReviewReports(req, res) {
        try {
            const { reportIds, status, notes, action = 'none' } = req.body;
            const reviewerId = req.user.id;

            const reports = await SpamReport.find({
                _id: { $in: reportIds }
            });

            const results = await Promise.allSettled(
                reports.map(async (report) => {
                    await report.resolve(status, reviewerId, notes);
                    if (action !== 'none') {
                        await this.takeAction(report, action);
                    }
                    return report;
                })
            );

            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;

            res.json({
                success: true,
                message: `Bulk review completed: ${successful} successful, ${failed} failed`,
                data: { successful, failed }
            });
        } catch (error) {
            console.error('Bulk review error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to bulk review reports'
            });
        }
    }

    /**
     * Submit a user report
     */
    async submitReport(req, res) {
        try {

            const { contentType, contentId, category, reason, description, evidence } = req.body;
            const reporterId = req.user.id;

            // Get the content to identify the reported user
            let content;
            let reportedUserId;

            switch (contentType) {
                case 'property':
                    content = await Property.findById(contentId);
                    reportedUserId = content?.owner;
                    break;
                case 'booking':
                    content = await Booking.findById(contentId);
                    reportedUserId = content?.user;
                    break;
                case 'user':
                    reportedUserId = contentId;
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid content type'
                    });
            }

            if (!reportedUserId) {
                return res.status(404).json({
                    success: false,
                    message: 'Content not found'
                });
            }

            // Check if user has already reported this content
            const existingReport = await SpamReport.findOne({
                contentType,
                contentId,
                reporterId,
                status: { $in: ['pending', 'under_review'] }
            });

            if (existingReport) {
                return res.status(400).json({
                    success: false,
                    message: 'You have already reported this content'
                });
            }

            // Create the report
            const report = await SpamReport.create({
                contentType,
                contentId,
                reporterId,
                reportedUserId,
                reportType: 'user_reported',
                category,
                userReportDetails: {
                    reason,
                    description,
                    evidence: evidence || []
                },
                severity: this.calculateReportSeverity(category),
                metadata: {
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent')
                }
            });

            res.status(201).json({
                success: true,
                message: 'Report submitted successfully',
                data: report
            });
        } catch (error) {
            console.error('Submit report error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to submit report'
            });
        }
    }

    /**
     * Submit an appeal for a spam report
     */
    async submitAppeal(req, res) {
        try {
            const { reportId } = req.params;
            const { reason } = req.body;
            const userId = req.user.id;

            const report = await SpamReport.findOne({
                _id: reportId,
                reportedUserId: userId,
                status: { $in: ['confirmed', 'resolved'] }
            });

            if (!report) {
                return res.status(404).json({
                    success: false,
                    message: 'Report not found or cannot be appealed'
                });
            }

            if (report.appeal.submitted) {
                return res.status(400).json({
                    success: false,
                    message: 'Appeal already submitted for this report'
                });
            }

            await report.submitAppeal(reason);

            res.json({
                success: true,
                message: 'Appeal submitted successfully',
                data: report
            });
        } catch (error) {
            console.error('Submit appeal error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to submit appeal'
            });
        }
    }

    /**
     * Review an appeal
     */
    async reviewAppeal(req, res) {
        try {
            const { reportId } = req.params;
            const { status, notes } = req.body;
            const reviewerId = req.user.id;

            const report = await SpamReport.findById(reportId);
            if (!report || !report.appeal.submitted) {
                return res.status(404).json({
                    success: false,
                    message: 'Appeal not found'
                });
            }

            await report.reviewAppeal(reviewerId, status, notes);

            res.json({
                success: true,
                message: 'Appeal reviewed successfully',
                data: report
            });
        } catch (error) {
            console.error('Review appeal error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to review appeal'
            });
        }
    }

    /**
     * Get spam detection statistics
     */
    async getStatistics(req, res) {
        try {
            const { period = '7d' } = req.query;
            const startDate = this.getStartDate(period);

            const stats = await Promise.all([
                // Total reports in period
                SpamReport.countDocuments({
                    reportedAt: { $gte: startDate }
                }),

                // Reports by status
                SpamReport.aggregate([
                    { $match: { reportedAt: { $gte: startDate } } },
                    { $group: { _id: '$status', count: { $sum: 1 } } }
                ]),

                // Reports by type
                SpamReport.aggregate([
                    { $match: { reportedAt: { $gte: startDate } } },
                    { $group: { _id: '$reportType', count: { $sum: 1 } } }
                ]),

                // Average confidence score
                SpamReport.aggregate([
                    { $match: { reportedAt: { $gte: startDate }, 'detectionResult.confidence': { $exists: true } } },
                    { $group: { _id: null, avgConfidence: { $avg: '$detectionResult.confidence' } } }
                ]),

                // Top reported users
                SpamReport.aggregate([
                    { $match: { reportedAt: { $gte: startDate } } },
                    { $group: { _id: '$reportedUserId', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 10 },
                    {
                        $lookup: {
                            from: 'users',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'user'
                        }
                    },
                    { $unwind: '$user' },
                    {
                        $project: {
                            count: 1,
                            'user.firstName': 1,
                            'user.lastName': 1,
                            'user.email': 1
                        }
                    }
                ])
            ]);

            res.json({
                success: true,
                data: {
                    totalReports: stats[0],
                    reportsByStatus: stats[1],
                    reportsByType: stats[2],
                    averageConfidence: stats[3][0]?.avgConfidence || 0,
                    topReportedUsers: stats[4]
                }
            });
        } catch (error) {
            console.error('Get statistics error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch statistics'
            });
        }
    }

    /**
     * Manual spam check for content
     */
    async checkContent(req, res) {
        try {
            const { contentType, contentId } = req.body;

            let content;
            switch (contentType) {
                case 'property':
                    content = await Property.findById(contentId);
                    break;
                case 'booking':
                    content = await Booking.findById(contentId);
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid content type'
                    });
            }

            if (!content) {
                return res.status(404).json({
                    success: false,
                    message: 'Content not found'
                });
            }

            const userId = content.owner || content.user;
            const result = await spamDetectionService.detectSpam(content, contentType, userId);

            res.json({
                success: true,
                data: {
                    content: content,
                    spamDetection: result,
                    summary: spamUtils.generateReportSummary(result)
                }
            });
        } catch (error) {
            console.error('Check content error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to check content'
            });
        }
    }

    // Helper methods
    async takeAction(report, action) {
        const user = await User.findById(report.reportedUserId);
        if (!user) return;

        switch (action) {
            case 'warning':
                // Send warning email to user
                break;
            case 'content_removed':
                await this.removeContent(report.contentType, report.contentId);
                break;
            case 'user_suspended':
                user.status = 'suspended';
                user.suspendedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
                await user.save();
                break;
            case 'user_banned':
                user.status = 'banned';
                await user.save();
                break;
            case 'shadowban':
                user.shadowBanned = true;
                await user.save();
                break;
        }

        report.actionTaken = action;
        await report.save();
    }

    async removeContent(contentType, contentId) {
        switch (contentType) {
            case 'property':
                await Property.findByIdAndUpdate(contentId, { status: 'removed' });
                break;
            case 'booking':
                await Booking.findByIdAndUpdate(contentId, { status: 'cancelled' });
                break;
        }
    }

    calculateReportSeverity(category) {
        const severityMap = {
            'spam': 'medium',
            'inappropriate': 'high',
            'fake_listing': 'high',
            'duplicate': 'low',
            'misleading': 'medium',
            'other': 'low'
        };
        return severityMap[category] || 'medium';
    }

    getStartDate(period) {
        const now = new Date();
        switch (period) {
            case '1d':
                return new Date(now - 24 * 60 * 60 * 1000);
            case '7d':
                return new Date(now - 7 * 24 * 60 * 60 * 1000);
            case '30d':
                return new Date(now - 30 * 24 * 60 * 60 * 1000);
            case '90d':
                return new Date(now - 90 * 24 * 60 * 60 * 1000);
            default:
                return new Date(now - 7 * 24 * 60 * 60 * 1000);
        }
    }
}

module.exports = new SpamController();