const express = require('express');
const router = express.Router();
const {
    getBanners,
    getActiveBanners,
    getBanner,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBannerStatus,
    recordImpression,
    recordClick,
    getBannerAnalytics,
    reorderBanners
} = require('../controllers/bannerController');

const { protect } = require('../middleware/auth');
const { adminOnly, managerOrAdmin } = require('../middleware/roleAuth');
const { upload } = require('../middleware/upload');
const { validateBanner } = require('../middleware/validation');

// Swagger documentation comments (keeping all your existing Swagger docs)
/**
 * @swagger
 * components:
 *   schemas:
 *     Banner:
 *       type: object
 *       required:
 *         - title
 *         - image
 *         - createdBy
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the banner
 *         title:
 *           type: string
 *           maxLength: 100
 *           description: The banner title
 *         description:
 *           type: string
 *           maxLength: 500
 *           description: The banner description
 *         image:
 *           type: string
 *           description: The banner image URL from Cloudinary
 *         link:
 *           type: string
 *           description: Optional link URL for the banner
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the banner is active
 *         order:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Display order of the banner
 *         type:
 *           type: string
 *           enum: [hero, promotional, informational, featured]
 *           default: promotional
 *           description: Type of banner
 *         targetAudience:
 *           type: string
 *           enum: [all, new_users, existing_users, premium_users]
 *           default: all
 *           description: Target audience for the banner
 *         displayLocation:
 *           type: array
 *           items:
 *             type: string
 *             enum: [home, search, property_detail, booking, profile]
 *           default: [home]
 *           description: Where the banner should be displayed
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: When the banner becomes active
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: When the banner expires
 *         clickCount:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Number of clicks on the banner
 *         impressionCount:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Number of times banner was viewed
 *         createdBy:
 *           type: string
 *           description: User ID who created the banner
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *         ctr:
 *           type: string
 *           description: Click-through rate percentage (virtual field)
 * 
 *     BannerAnalytics:
 *       type: object
 *       properties:
 *         impressions:
 *           type: number
 *           description: Total impressions
 *         clicks:
 *           type: number
 *           description: Total clicks
 *         ctr:
 *           type: string
 *           description: Click-through rate percentage
 *         isActive:
 *           type: boolean
 *           description: Banner status
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation date
 *         daysActive:
 *           type: number
 *           description: Number of days since creation
 * 
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Response status
 *         message:
 *           type: string
 *           description: Response message
 *         data:
 *           type: object
 *           description: Response data
 *         error:
 *           type: string
 *           description: Error message (if any)
 * 
 *     PaginatedResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Banner'
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: number
 *             limit:
 *               type: number
 *             total:
 *               type: number
 *             pages:
 *               type: number
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 * tags:
 *   - name: Banners
 *     description: Banner management endpoints
 */

// PUBLIC ROUTES (no authentication required)

/**
 * @swagger
 * /api/banners:
 *   get:
 *     summary: Get all banners with pagination and filtering
 *     tags: [Banners]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [hero, promotional, informational, featured]
 *         description: Filter by banner type
 *       - in: query
 *         name: targetAudience
 *         schema:
 *           type: string
 *           enum: [all, new_users, existing_users, premium_users]
 *         description: Filter by target audience
 *       - in: query
 *         name: displayLocation
 *         schema:
 *           type: string
 *           enum: [home, search, property_detail, booking, profile]
 *         description: Filter by display location
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (from)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (to)
 *     responses:
 *       200:
 *         description: Banners retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       500:
 *         description: Server error
 */
router.get('/', getBanners);

/**
 * @swagger
 * /api/banners/active/{location}:
 *   get:
 *     summary: Get active banners for specific location
 *     tags: [Banners]
 *     parameters:
 *       - in: path
 *         name: location
 *         schema:
 *           type: string
 *           enum: [home, search, property_detail, booking, profile]
 *           default: home
 *         description: Display location
 *     responses:
 *       200:
 *         description: Active banners retrieved successfully
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
 *                     $ref: '#/components/schemas/Banner'
 *       500:
 *         description: Server error
 */
router.get('/active/:location?', getActiveBanners);

/**
 * @swagger
 * /api/banners/{id}:
 *   get:
 *     summary: Get single banner by ID
 *     tags: [Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Banner ID
 *     responses:
 *       200:
 *         description: Banner retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Banner'
 *       404:
 *         description: Banner not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getBanner);

/**
 * @swagger
 * /api/banners/{id}/impression:
 *   post:
 *     summary: Record banner impression
 *     tags: [Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Banner ID
 *     responses:
 *       200:
 *         description: Impression recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Banner not found
 *       500:
 *         description: Server error
 */
router.post('/:id/impression', recordImpression);

/**
 * @swagger
 * /api/banners/{id}/click:
 *   post:
 *     summary: Record banner click
 *     tags: [Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Banner ID
 *     responses:
 *       200:
 *         description: Click recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Banner not found
 *       500:
 *         description: Server error
 */
router.post('/:id/click', recordClick);

// PROTECTED ROUTES (require authentication)
// Note: Moving reorder route before /:id routes to avoid conflicts

/**
 * @swagger
 * /api/banners/reorder:
 *   put:
 *     summary: Reorder banners (Admin only)
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bannerOrders
 *             properties:
 *               bannerOrders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     order:
 *                       type: number
 *     responses:
 *       200:
 *         description: Banners reordered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.put('/reorder', protect, adminOnly, reorderBanners);

/**
 * @swagger
 * /api/banners:
 *   post:
 *     summary: Create new banner (Admin only)
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - image
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               image:
 *                 type: string
 *                 format: binary
 *               link:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               order:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [hero, promotional, informational, featured]
 *               targetAudience:
 *                 type: string
 *                 enum: [all, new_users, existing_users, premium_users]
 *               displayLocation:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [home, search, property_detail, booking, profile]
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Banner created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Banner'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/', protect, adminOnly, upload.single('image'), validateBanner, createBanner);

/**
 * @swagger
 * /api/banners/{id}:
 *   put:
 *     summary: Update banner (Admin only)
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Banner ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               image:
 *                 type: string
 *                 format: binary
 *               link:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               order:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [hero, promotional, informational, featured]
 *               targetAudience:
 *                 type: string
 *                 enum: [all, new_users, existing_users, premium_users]
 *               displayLocation:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [home, search, property_detail, booking, profile]
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Banner updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Banner'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Banner not found
 */
router.put('/:id', protect, adminOnly, upload.single('image'), validateBanner, updateBanner);

/**
 * @swagger
 * /api/banners/{id}:
 *   delete:
 *     summary: Delete banner (Admin only)
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Banner ID
 *     responses:
 *       200:
 *         description: Banner deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Banner not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, adminOnly, deleteBanner);

/**
 * @swagger
 * /api/banners/{id}/toggle:
 *   patch:
 *     summary: Toggle banner status (Admin only)
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Banner ID
 *     responses:
 *       200:
 *         description: Banner status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Banner'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Banner not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/toggle', protect, adminOnly, toggleBannerStatus);

/**
 * @swagger
 * /api/banners/{id}/analytics:
 *   get:
 *     summary: Get banner analytics (Admin/Manager only)
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Banner ID
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BannerAnalytics'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin/Manager access required
 *       404:
 *         description: Banner not found
 *       500:
 *         description: Server error
 */
router.get('/:id/analytics', protect, managerOrAdmin, getBannerAnalytics);

module.exports = router;