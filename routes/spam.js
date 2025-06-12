// routes/spam.js
const express = require('express');
const router = express.Router();
const spamController = require('../controllers/spamController');
const { protect, authorize } = require('../middleware/auth');
const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation'); // Changed this line

// Validation rules
const reportValidation = [
    body('contentType')
        .isIn(['property', 'booking', 'message', 'user', 'review'])
        .withMessage('Invalid content type'),
    body('contentId')
        .isMongoId()
        .withMessage('Invalid content ID'),
    body('category')
        .isIn(['spam', 'inappropriate', 'fake_listing', 'duplicate', 'misleading', 'other'])
        .withMessage('Invalid report category'),
    body('reason')
        .isLength({ min: 10, max: 500 })
        .withMessage('Reason must be between 10-500 characters'),
    body('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description must not exceed 1000 characters'),
    body('evidence')
        .optional()
        .isArray()
        .withMessage('Evidence must be an array')
];

const reviewValidation = [
    param('reportId')
        .isMongoId()
        .withMessage('Invalid report ID'),
    body('status')
        .isIn(['confirmed', 'false_positive', 'dismissed'])
        .withMessage('Invalid status'),
    body('notes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Notes must not exceed 1000 characters'),
    body('action')
        .optional()
        .isIn(['none', 'warning', 'content_removed', 'user_suspended', 'user_banned', 'shadowban'])
        .withMessage('Invalid action')
];

const appealValidation = [
    param('reportId')
        .isMongoId()
        .withMessage('Invalid report ID'),
    body('reason')
        .isLength({ min: 20, max: 1000 })
        .withMessage('Appeal reason must be between 20-1000 characters')
];

const bulkReviewValidation = [
    body('reportIds')
        .isArray({ min: 1, max: 50 })
        .withMessage('Report IDs must be an array with 1-50 items'),
    body('reportIds.*')
        .isMongoId()
        .withMessage('Invalid report ID'),
    body('status')
        .isIn(['confirmed', 'false_positive', 'dismissed'])
        .withMessage('Invalid status'),
    body('action')
        .optional()
        .isIn(['none', 'warning', 'content_removed', 'user_suspended', 'user_banned', 'shadowban'])
        .withMessage('Invalid action')
];

const checkContentValidation = [
    body('contentType')
        .isIn(['property', 'booking'])
        .withMessage('Invalid content type'),
    body('contentId')
        .isMongoId()
        .withMessage('Invalid content ID')
];

/**
 * @swagger
 * components:
 *   schemas:
 *     SpamReport:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Report ID
 *         contentType:
 *           type: string
 *           enum: [property, booking, message, user, review]
 *           description: Type of content being reported
 *         contentId:
 *           type: string
 *           description: ID of the reported content
 *         reporterId:
 *           type: string
 *           description: ID of the user who reported
 *         reportedUserId:
 *           type: string
 *           description: ID of the reported user
 *         reportType:
 *           type: string
 *           enum: [automated, user_reported, system_flagged]
 *           description: How the report was generated
 *         category:
 *           type: string
 *           enum: [spam, inappropriate, fake_listing, duplicate, misleading, other]
 *           description: Category of the report
 *         severity:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           description: Severity level of the report
 *         status:
 *           type: string
 *           enum: [pending, under_review, confirmed, false_positive, resolved, dismissed]
 *           description: Current status of the report
 *         userReportDetails:
 *           type: object
 *           properties:
 *             reason:
 *               type: string
 *               description: Reason for reporting
 *             description:
 *               type: string
 *               description: Additional description
 *             evidence:
 *               type: array
 *               items:
 *                 type: string
 *               description: Evidence URLs or descriptions
 *         detectionResult:
 *           type: object
 *           properties:
 *             confidence:
 *               type: number
 *               description: AI confidence score (0-1)
 *             reasons:
 *               type: array
 *               items:
 *                 type: string
 *               description: Reasons for flagging
 *         actionTaken:
 *           type: string
 *           enum: [none, warning, content_removed, user_suspended, user_banned, shadowban]
 *           description: Action taken after review
 *         appeal:
 *           type: object
 *           properties:
 *             submitted:
 *               type: boolean
 *               description: Whether appeal was submitted
 *             reason:
 *               type: string
 *               description: Appeal reason
 *             status:
 *               type: string
 *               enum: [pending, approved, rejected]
 *               description: Appeal status
 *         reportedAt:
 *           type: string
 *           format: date-time
 *           description: When the report was created
 *         resolvedAt:
 *           type: string
 *           format: date-time
 *           description: When the report was resolved
 *         reviewerId:
 *           type: string
 *           description: ID of the admin who reviewed
 *         reviewNotes:
 *           type: string
 *           description: Admin review notes
 *   
 *     SpamReportInput:
 *       type: object
 *       required:
 *         - contentType
 *         - contentId
 *         - category
 *         - reason
 *       properties:
 *         contentType:
 *           type: string
 *           enum: [property, booking, message, user, review]
 *           description: Type of content being reported
 *         contentId:
 *           type: string
 *           description: ID of the content to report
 *         category:
 *           type: string
 *           enum: [spam, inappropriate, fake_listing, duplicate, misleading, other]
 *           description: Category of the report
 *         reason:
 *           type: string
 *           minLength: 10
 *           maxLength: 500
 *           description: Reason for reporting
 *         description:
 *           type: string
 *           maxLength: 1000
 *           description: Additional description (optional)
 *         evidence:
 *           type: array
 *           items:
 *             type: string
 *           description: Evidence URLs or descriptions (optional)
 *   
 *     ReviewInput:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [confirmed, false_positive, dismissed]
 *           description: Review decision
 *         notes:
 *           type: string
 *           maxLength: 1000
 *           description: Review notes (optional)
 *         action:
 *           type: string
 *           enum: [none, warning, content_removed, user_suspended, user_banned, shadowban]
 *           description: Action to take (optional)
 *   
 *     BulkReviewInput:
 *       type: object
 *       required:
 *         - reportIds
 *         - status
 *       properties:
 *         reportIds:
 *           type: array
 *           minItems: 1
 *           maxItems: 50
 *           items:
 *             type: string
 *           description: Array of report IDs to review
 *         status:
 *           type: string
 *           enum: [confirmed, false_positive, dismissed]
 *           description: Review decision for all reports
 *         notes:
 *           type: string
 *           maxLength: 1000
 *           description: Review notes for all reports (optional)
 *         action:
 *           type: string
 *           enum: [none, warning, content_removed, user_suspended, user_banned, shadowban]
 *           description: Action to take for all reports (optional)
 *   
 *     AppealInput:
 *       type: object
 *       required:
 *         - reason
 *       properties:
 *         reason:
 *           type: string
 *           minLength: 20
 *           maxLength: 1000
 *           description: Reason for appeal
 *   
 *     CheckContentInput:
 *       type: object
 *       required:
 *         - contentType
 *         - contentId
 *       properties:
 *         contentType:
 *           type: string
 *           enum: [property, booking]
 *           description: Type of content to check
 *         contentId:
 *           type: string
 *           description: ID of the content to check
 *   
 *     SpamStatistics:
 *       type: object
 *       properties:
 *         totalReports:
 *           type: number
 *           description: Total number of reports in period
 *         reportsByStatus:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 description: Status name
 *               count:
 *                 type: number
 *                 description: Number of reports with this status
 *         reportsByType:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 description: Report type
 *               count:
 *                 type: number
 *                 description: Number of reports of this type
 *         averageConfidence:
 *           type: number
 *           description: Average AI confidence score
 *         topReportedUsers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 description: User ID
 *               count:
 *                 type: number
 *                 description: Number of reports against this user
 *               user:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   email:
 *                     type: string
 */

// Admin routes for managing spam reports

/**
 * @swagger
 * /api/spam/reports:
 *   get:
 *     summary: Get all spam reports with pagination and filtering
 *     description: Retrieve spam reports with optional filtering and pagination. Admin access required.
 *     tags: [Spam Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of reports per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, under_review, confirmed, false_positive, resolved, dismissed]
 *         description: Filter by report status
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filter by severity level
 *       - in: query
 *         name: contentType
 *         schema:
 *           type: string
 *           enum: [property, booking, message, user, review]
 *         description: Filter by content type
 *       - in: query
 *         name: reportType
 *         schema:
 *           type: string
 *           enum: [automated, user_reported, system_flagged]
 *         description: Filter by report type
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: reportedAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Spam reports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     docs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SpamReport'
 *                     totalDocs:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     page:
 *                       type: number
 *                     totalPages:
 *                       type: number
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/reports',
    protect,
    authorize,
    [
        query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
        query('status').optional().isIn(['pending', 'under_review', 'confirmed', 'false_positive', 'resolved', 'dismissed']),
        query('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
        query('contentType').optional().isIn(['property', 'booking', 'message', 'user', 'review']),
        query('reportType').optional().isIn(['automated', 'user_reported', 'system_flagged']),
        query('sortBy').optional().isString(),
        query('sortOrder').optional().isIn(['asc', 'desc'])
    ],
    handleValidationErrors, // Changed this line
    spamController.getSpamReports
);

/**
 * @swagger
 * /api/spam/reports/urgent:
 *   get:
 *     summary: Get urgent spam reports
 *     description: Retrieve spam reports that need immediate attention. Admin access required.
 *     tags: [Spam Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Urgent reports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SpamReport'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/reports/urgent',
    protect,
    authorize,
    spamController.getUrgentReports
);

/**
 * @swagger
 * /api/spam/reports/user/{userId}:
 *   get:
 *     summary: Get spam reports for a specific user
 *     description: Retrieve all pending spam reports for a specific user. Admin access required.
 *     tags: [Spam Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to get reports for
 *     responses:
 *       200:
 *         description: User reports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SpamReport'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/reports/user/:userId',
    protect,
    authorize,
    [
        param('userId').isMongoId().withMessage('Invalid user ID')
    ],
    handleValidationErrors, // Changed this line
    spamController.getUserReports
);

/**
 * @swagger
 * /api/spam/reports/{reportId}/review:
 *   put:
 *     summary: Review a spam report
 *     description: Review and resolve a spam report with optional action. Admin access required.
 *     tags: [Spam Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the report to review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewInput'
 *     responses:
 *       200:
 *         description: Report reviewed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/SpamReport'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Report not found
 *       500:
 *         description: Internal server error
 */
router.put('/reports/:reportId/review',
    protect,
    authorize,
    reviewValidation,
    handleValidationErrors, // Changed this line
    spamController.reviewReport
);

/**
 * @swagger
 * /api/spam/reports/bulk-review:
 *   put:
 *     summary: Bulk review multiple spam reports
 *     description: Review and resolve multiple spam reports at once. Admin access required.
 *     tags: [Spam Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkReviewInput'
 *     responses:
 *       200:
 *         description: Bulk review completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     successful:
 *                       type: number
 *                       description: Number of successfully reviewed reports
 *                     failed:
 *                       type: number
 *                       description: Number of failed reviews
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.put('/reports/bulk-review',
    protect,
    authorize,
    bulkReviewValidation,
    handleValidationErrors, // Changed this line
    spamController.bulkReviewReports
);

/**
 * @swagger
 * /api/spam/statistics:
 *   get:
 *     summary: Get spam detection statistics
 *     description: Retrieve comprehensive spam detection statistics for a specified period. Admin access required.
 *     tags: [Spam Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [1d, 7d, 30d, 90d]
 *           default: 7d
 *         description: Time period for statistics
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SpamStatistics'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/statistics',
    protect,
    authorize,
    [
        query('period').optional().isIn(['1d', '7d', '30d', '90d']).withMessage('Invalid period')
    ],
    handleValidationErrors, // Changed this line
    spamController.getStatistics
);

/**
 * @swagger
 * /api/spam/check-content:
 *   post:
 *     summary: Manual spam check for content
 *     description: Manually trigger spam detection on specific content. Admin access required.
 *     tags: [Spam Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckContentInput'
 *     responses:
 *       200:
 *         description: Content checked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     content:
 *                       type: object
 *                       description: The checked content
 *                     spamDetection:
 *                       type: object
 *                       description: Spam detection results
 *                     summary:
 *                       type: string
 *                       description: Human-readable summary
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Content not found
 *       500:
 *         description: Internal server error
 */
router.post('/check-content',
    protect,
    authorize,
    checkContentValidation,
    handleValidationErrors, // Changed this line
    spamController.checkContent
);

// User routes for reporting and appeals

/**
 * @swagger
 * /api/spam/report:
 *   post:
 *     summary: Submit a spam report
 *     description: Submit a report about spam or inappropriate content. Authenticated users only.
 *     tags: [User Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SpamReportInput'
 *     responses:
 *       201:
 *         description: Report submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/SpamReport'
 *       400:
 *         description: Invalid input data or duplicate report
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Content not found
 *       500:
 *         description: Internal server error
 */
router.post('/report',
    protect,
    reportValidation,
    handleValidationErrors, // Changed this line
    spamController.submitReport
);

/**
 * @swagger
 * /api/spam/reports/{reportId}/appeal:
 *   post:
 *     summary: Submit an appeal for a spam report
 *     description: Submit an appeal against a confirmed spam report. Only the reported user can appeal.
 *     tags: [User Appeals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the report to appeal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppealInput'
 *     responses:
 *       200:
 *         description: Appeal submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/SpamReport'
 *       400:
 *         description: Invalid input data or appeal already submitted
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Report not found or cannot be appealed
 *       500:
 *         description: Internal server error
 */
router.post('/reports/:reportId/appeal',
    protect,
    appealValidation,
    handleValidationErrors, // Changed this line
    spamController.submitAppeal
);

/**
 * @swagger
 * /api/spam/reports/{reportId}/appeal/review:
 *   put:
 *     summary: Review an appeal
 *     description: Review and decide on an appeal for a spam report. Admin access required.
 *     tags: [Spam Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the report with appeal to review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 description: Appeal decision
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Review notes (optional)
 *     responses:
 *       200:
 *         description: Appeal reviewed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/SpamReport'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Appeal not found
 *       500:
 *         description: Internal server error
 */
router.put('/reports/:reportId/appeal/review',
    protect,
    authorize,
    [
        param('reportId').isMongoId().withMessage('Invalid report ID'),
        body('status').isIn(['approved', 'rejected']).withMessage('Invalid appeal status'),
        body('notes').optional().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters')
    ],
    handleValidationErrors, // Changed this line
    spamController.reviewAppeal
);

module.exports = router;