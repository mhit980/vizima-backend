const express = require('express');
const contactNumberController = require('../controllers/contactNumberController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     ContactNumber:
 *       type: object
 *       required:
 *         - number
 *         - description
 *         - order
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the contact number
 *         number:
 *           type: string
 *           description: 10-digit Indian mobile number (without country code)
 *           example: "9876543210"
 *           minLength: 10
 *           maxLength: 10
 *           pattern: '^[6-9]\d{9}$'
 *         description:
 *           type: string
 *           description: Description or label for the number
 *           example: "Customer Support"
 *         isActive:
 *           type: boolean
 *           description: Whether the contact number is active and should be displayed
 *           default: true
 *         order:
 *           type: number
 *           description: Display order (lower numbers appear first)
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the contact number was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the contact number was last updated
 *     Error:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: 'error'
 *         message:
 *           type: string
 *           example: 'Error message'
 */

/**
 * @swagger
 * /api/contact-numbers/active:
 *   get:
 *     summary: Get all active contact numbers
 *     tags: [Contact Numbers]
 *     responses:
 *       200:
 *         description: List of active contact numbers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 1
 *                 data:
 *                   type: object
 *                   properties:
 *                     contactNumbers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ContactNumber'
 */
router.get('/active', contactNumberController.getActiveContactNumbers);

// Protected routes (require authentication and admin role)
router.use(protect);
router.use(authorize('admin'));

/**
 * @swagger
 * /api/contact-numbers:
 *   get:
 *     summary: Get all contact numbers (Admin only)
 *     tags: [Contact Numbers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all contact numbers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 1
 *                 data:
 *                   type: object
 *                   properties:
 *                     contactNumbers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ContactNumber'
 *   post:
 *     summary: Create a new contact number (Admin only)
 *     tags: [Contact Numbers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - number
 *               - description
 *               - order
 *             properties:
 *               number:
 *                 type: string
 *                 description: 10-digit Indian mobile number (without country code)
 *                 example: "9876543210"
 *               description:
 *                 type: string
 *                 example: "Customer Support"
 *               isActive:
 *                 type: boolean
 *                 default: true
 *               order:
 *                 type: number
 *                 example: 1
 *     responses:
 *       201:
 *         description: Contact number created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     contactNumber:
 *                       $ref: '#/components/schemas/ContactNumber'
 */
router
    .route('/')
    .get(contactNumberController.getAllContactNumbers)
    .post(contactNumberController.createContactNumber);

/**
 * @swagger
 * /api/contact-numbers/{id}:
 *   get:
 *     summary: Get contact number by ID (Admin only)
 *     tags: [Contact Numbers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact number ID
 *     responses:
 *       200:
 *         description: Contact number retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     contactNumber:
 *                       $ref: '#/components/schemas/ContactNumber'
 *       404:
 *         description: Contact number not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   patch:
 *     summary: Update a contact number (Admin only)
 *     tags: [Contact Numbers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact number ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               number:
 *                 type: string
 *                 description: 10-digit Indian mobile number (without country code)
 *                 example: "9876543210"
 *               description:
 *                 type: string
 *                 example: "Updated Support"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *               order:
 *                 type: number
 *                 example: 2
 *     responses:
 *       200:
 *         description: Contact number updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     contactNumber:
 *                       $ref: '#/components/schemas/ContactNumber'
 *   delete:
 *     summary: Delete a contact number (Admin only)
 *     tags: [Contact Numbers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contact number ID
 *     responses:
 *       204:
 *         description: Contact number deleted successfully
 *         content: false
 *       404:
 *         description: Contact number not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router
    .route('/:id')
    .get(contactNumberController.getContactNumber)
    .patch(contactNumberController.updateContactNumber)
    .delete(contactNumberController.deleteContactNumber);

module.exports = router;
