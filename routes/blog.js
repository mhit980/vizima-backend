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
 *               status:
 *                 type: string
 *               seo:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   meta:
 *                     type: string
 *     responses:
 *       201:
 *         description: Blog created
 */
router.post('/', protect, blogController.createBlog);

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
 *     summary: Get all blogs with pagination and search
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
 *     responses:
 *       200:
 *         description: List of user blogs
 */
router.get('/user/:userId', protect, blogController.getBlogsByUserId);

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
 *         description: Search by blog title or category
 *     responses:
 *       200:
 *         description: Paginated list of current user's blogs
 */
router.get('/me', protect, blogController.currentUserBlogs);

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
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *               seo:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   meta:
 *                     type: string
 */
router.put('/:id', protect, blogController.updateBlog);


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
