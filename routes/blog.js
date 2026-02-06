// blogRoutes.js
const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: Blog management APIs
 */

/**
 * @swagger
 * /api/blogs:
 *   post:
 *     summary: Create a new blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [technology, lifestyle, general]
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 default: draft
 *               description:
 *                 type: string
 *               articleBody:
 *                 type: string
 *               blogImageUrl:
 *                 type: string
 *             required:
 *               - title
 *               - category
 *               - description
 *               - articleBody
 *               - blogImageUrl
 *     responses:
 *       201:
 *         description: Blog created
 */
router.post('/', protect, blogController.createBlog);

/**
 * @swagger
 * /api/blogs/{id}:
 *   put:
 *     summary: Update a blog by ID
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [technology, lifestyle, general]
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *               description:
 *                 type: string
 *               articleBody:
 *                 type: string
 *               blogImageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Blog updated
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Blog not found
 */
router.put('/:id', protect, blogController.updateBlog);

/**
 * @swagger
 * /api/blogs/me:
 *   get:
 *     summary: Get blogs of the current user
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Number of blogs per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by blog title or slug
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [technology, lifestyle, general]
 *         description: Filter by category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [published, draft]
 *         description: Filter by status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter blogs from this date (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter blogs until this date (ISO format)
 *     responses:
 *       200:
 *         description: Paginated list of current user's blogs
 */
router.get('/me', protect, blogController.currentUserBlogs);



/**
 * @swagger
 * /api/blogs/{id}:
 *   get:
 *     summary: Get blog by ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Single blog
 */
router.get('/:id', blogController.getBlogById);

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Get all blogs with pagination, search, and filtering
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by blog title or slug
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [technology, lifestyle, general]
 *         description: Filter by category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [published, draft]
 *         description: Filter by status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter blogs from this date (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter blogs until this date (ISO format)
 *     responses:
 *       200:
 *         description: List of blogs
 */
router.get('/', blogController.getAllBlogs);

/**
 * @swagger
 * /api/blogs/user/{userId}:
 *   get:
 *     summary: Get blogs of a specific user
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by blog title or slug
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [technology, lifestyle, general]
 *         description: Filter by category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [published, draft]
 *         description: Filter by status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter blogs from this date (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter blogs until this date (ISO format)
 *     responses:
 *       200:
 *         description: List of user blogs
 */
router.get('/user/:userId', protect, blogController.getBlogsByUserId);


/**
 * @swagger
 * /api/blogs/{id}:
 *   delete:
 *     summary: Delete blog by ID
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog deleted
 */
router.delete('/:id', protect, blogController.deleteBlog);

module.exports = router;
