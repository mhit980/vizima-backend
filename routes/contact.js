const express = require('express');
const { body } = require('express-validator');
const { submitContactForm } = require('../controllers/contactController');

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
 *                 maxLength: 100
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               mobileNumber:
 *                 type: string
 *                 example: "+919876543210"
 *               message:
 *                 type: string
 *                 maxLength: 1000
 *                 example: I would like to know more about your services.
 *     responses:
 *       201:
 *         description: Message submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     mobileNumber:
 *                       type: string
 *                     message:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Validation failed
 *               errors:
 *                 - msg: Email is required
 *                   param: email
 *                   location: body
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Server error
 */

router.post(
    '/message',
    [
        body('fullName')
            .trim()
            .notEmpty()
            .withMessage('Full name is required'),
        body('email')
            .isEmail()
            .withMessage('Valid email is required'),
        body('mobileNumber')
            .matches(/^\+\d{1,4}[6-9]\d{9}$/)
            .withMessage('Valid mobile number with country code is required (e.g., +91 98765 43210)'),
        body('message')
            .trim()
            .notEmpty()
            .withMessage('Message is required')
    ],
    submitContactForm
);

module.exports = router;
