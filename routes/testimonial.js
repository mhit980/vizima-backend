const express = require('express');
const router = express.Router();
const controller = require('../controllers/testimonialController');

/**
 * @swagger
 * tags:
 *   name: Testimonials
 *   description: Testimonial management
 */

/**
 * @swagger
 * /api/testimonials:
 *   post:
 *     summary: Create a new testimonial
 *     tags: [Testimonials]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, picture, city, rating, comment, order]
 *             properties:
 *               name: { type: string }
 *               picture: { type: string }
 *               city: { type: string }
 *               rating: { type: number, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *               status: { type: string, enum: [approved, pending, rejected] }
 *               order: { type: number }
 *     responses:
 *       201:
 *         description: Testimonial created successfully
 */
router.post('/', controller.createTestimonial);

/**
 * @swagger
 * /api/testimonials:
 *   get:
 *     summary: Get all approved testimonials in order
 *     tags: [Testimonials]
 *     responses:
 *       200:
 *         description: List of all approved testimonials
 */
router.get('/', controller.getAllTestimonials);

/**
 * @swagger
 * /api/testimonials/{id}:
 *   get:
 *     summary: Get testimonial by ID
 *     tags: [Testimonials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Testimonial data
 */
router.get('/:id', controller.getTestimonialById);

/**
 * @swagger
 * /api/testimonials/{id}:
 *   put:
 *     summary: Update a testimonial
 *     tags: [Testimonials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               picture: { type: string }
 *               city: { type: string }
 *               rating: { type: number }
 *               comment: { type: string }
 *               status: { type: string }
 *               order: { type: number }
 *     responses:
 *       200:
 *         description: Testimonial updated
 */
router.put('/:id', controller.updateTestimonial);

/**
 * @swagger
 * /api/testimonials/{id}:
 *   delete:
 *     summary: Delete a testimonial
 *     tags: [Testimonials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
router.delete('/:id', controller.deleteTestimonial);

module.exports = router;
