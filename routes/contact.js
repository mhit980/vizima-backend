const express = require('express');
const { body, param, query } = require('express-validator');
const {
    submitContactForm,
    getAllContactMessages,
    getContactMessageById,
    deleteContactMessageById,
} = require('../controllers/contactController');

const router = express.Router();

/**
 * @swagger
 * /api/contact/message:
 *   post:
 *     summary: Submit a contact form message
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - mobileNumber
 *               - message
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               mobileNumber:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message submitted successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post(
    '/message',
    [
        body('fullName').trim().notEmpty().withMessage('Full name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('mobileNumber')
            .matches(/^\+\d{1,4}[6-9]\d{9}$/)
            .withMessage('Valid mobile number with country code is required'),
        body('message').trim().notEmpty().withMessage('Message is required'),
    ],
    submitContactForm
);

/**
 * @swagger
 * /api/contact/messages:
 *   get:
 *     summary: Get all contact messages with pagination and search
 *     tags: [Contact]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by fullName, email, mobileNumber, or message
 *     responses:
 *       200:
 *         description: A list of contact messages
 */
router.get('/messages', getAllContactMessages);

/**
 * @swagger
 * /api/contact/message/{id}:
 *   get:
 *     summary: Get a contact message by ID
 *     tags: [Contact]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The contact message ID
 *     responses:
 *       200:
 *         description: Contact message found
 *       404:
 *         description: Not found
 */
router.get('/message/:id', getContactMessageById);

/**
 * @swagger
 * /api/contact/message/{id}:
 *   delete:
 *     summary: Delete a contact message by ID
 *     tags: [Contact]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message deleted
 *       404:
 *         description: Not found
 */
router.delete('/message/:id', deleteContactMessageById);

module.exports = router;
