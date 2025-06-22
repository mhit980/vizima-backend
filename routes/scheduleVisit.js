const express = require('express');
const router = express.Router();
const { scheduleVisit } = require('../controllers/homeController');

/**
 * @swagger
 * tags:
 *   name: Schedule Visit
 *   description: Property visit scheduling operations
 */

/**
 * @swagger
 * /api/schedule/schedule-visit:
 *   post:
 *     summary: Schedule a new property visit
 *     tags: [Schedule Visit]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - mode
 *               - propertyId
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               phoneNumber:
 *                 type: string
 *                 example: "9876543210"
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2023-12-25T14:30:00Z"
 *               mode:
 *                 type: string
 *                 enum: [physical, virtual]
 *                 example: Physical
 *               gender:
 *                 type: string
 *                 enum: [male, female, unisex]
 *                 example: male
 *               sharing:
 *                 type: string
 *                 enum: [single, double, triple]
 *                 example: double
 *               propertyId:
 *                 type: string
 *                 example: "507f191e810c19729de860ea"
 *     responses:
 *       201:
 *         description: Visit scheduled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VisitBooking'
 *       400:
 *         description: Invalid input (e.g., validation error)
 *         content:
 *           application/json:
 *             example:
 *               error: "Phone number must be 10-15 digits"
 *       500:
 *         description: Server error
 */
router.post('/schedule-visit', scheduleVisit);

module.exports = router;