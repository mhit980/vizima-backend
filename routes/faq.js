const express = require('express');
const router = express.Router();
const FAQController = require('../controllers/faqController');
const { protect } = require('../middleware/auth');


/**
 * @swagger
 * components:
 *   schemas:
 *     FAQ:
 *       type: object
 *       required:
 *         - question
 *         - answer
 *         - order
 *       properties:
 *         question:
 *           type: string
 *           example: Are meals included in the rent?
 *         answer:
 *           type: string
 *           example: Yes, most PGs offer food packages — some include breakfast, lunch, and dinner.
 *         order:
 *           type: number
 *           example: 1
 */



/**
 * @swagger
 * /api/faqs:
 *   post:
 *     summary: Create a new FAQ
 *     tags: [FAQs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FAQ'
 *     responses:
 *       201:
 *         description: FAQ created successfully
 */
router.post('/', FAQController.createFAQ);

/**
 * @swagger
 * /api/faqs/{id}:
 *   put:
 *     summary: Update an existing FAQ
 *     tags: [FAQs]
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
 *             $ref: '#/components/schemas/FAQ'
 *     responses:
 *       200:
 *         description: FAQ updated successfully
 */
router.put('/:id', FAQController.updateFAQ);

/**
 * @swagger
 * /api/faqs:
 *   get:
 *     summary: Get all FAQs ordered by order field with pagination
 *     tags: [FAQs]
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
 *         description: Number of FAQs per page
 *     responses:
 *       200:
 *         description: Paginated list of FAQs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FAQ'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 */

router.get('/', FAQController.getAllFAQs);

/**
 * @swagger
 * /api/faqs/{id}:
 *   get:
 *     summary: Get FAQ by ID
 *     tags: [FAQs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: FAQ retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FAQ'
 */
router.get('/:id', FAQController.getFAQById);

/**
 * @swagger
 * /api/faqs/{id}:
 *   delete:
 *     summary: Delete FAQ by ID
 *     tags: [FAQs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: FAQ deleted successfully
 */
router.delete('/:id', FAQController.deleteFAQ);


module.exports = router;