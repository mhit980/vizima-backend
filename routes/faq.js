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
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
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
 *     summary: Get all FAQs ordered by order field
 *     tags: [FAQs]
 *     responses:
 *       200:
 *         description: List of FAQs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FAQ'
 */
router.get('/', FAQController.getAllFAQs);

module.exports = router;