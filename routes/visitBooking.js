const express = require('express');
const router = express.Router();
const {
    createVisitBooking,
    updateVisitBooking,
    getAllVisitBookings,
    getVisitBookingById,
    deleteVisitBooking,
    getVisitBookingStats
} = require('../controllers/visitBookingController');
const { protect, authorize } = require('../middleware/auth')

/**
 * @swagger
 * tags:
 *   name: VisitBookings
 *   description: Visit booking management
 */

/**
 * @swagger
 * /api/visit-bookings:
 *   post:
 *     summary: Create a new visit booking
 *     tags: [VisitBookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date, timeSlot, mode, name, phone]
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               timeSlot:
 *                 type: string
 *                 example: '11:00 AM'
 *               mode:
 *                 type: string
 *                 enum: [physical, virtual]
 *               description:
 *                 type: string
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *                 example: '+919988774422'
 * 
 *     responses:
 *       201:
 *         description: Visit booking created
 */
router.post('/', createVisitBooking);

/**
 * @swagger
 * /api/visit-bookings/{id}:
 *   put:
 *     summary: Update a visit booking
 *     tags: [VisitBookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mode:
 *                 type: string
 *                 example: 'physical'
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled, completed]
 *                 example: 'confirmed'
 *               timeSlot:
 *                 type: string
 *                 example: '11:00 AM'
 *               phone:
 *                 type: string
 *                 example: '+919988774422'
 * 
 *     responses:
 *       200:
 *         description: Updated successfully
 */
router.put('/:id', protect, authorize('admin'), updateVisitBooking);

/**
 * @swagger
 * /api/visit-bookings:
 *   get:
 *     summary: Get all visit bookings with optional filters and pagination
 *     tags: [VisitBookings]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *       - in: query
 *         name: mode
 *         schema:
 *           type: string
 *           enum: [physical, virtual]
 *         description: Filter by mode of visit
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed]
 *         description: Filter by booking status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, phone, or description
 *     responses:
 *       200:
 *         description: Returns a list of visit bookings
 *       500:
 *         description: Internal server error
 */
router.get('/', protect, authorize('admin'), getAllVisitBookings);

/**
 * @swagger
 * /api/visit-bookings/stats:
 *   get:
 *     summary: Get visit booking statistics
 *     tags: [VisitBookings]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Success
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                       example: 124
 *                     pending:
 *                       type: number
 *                       example: 23
 *                     confirmed:
 *                       type: number
 *                       example: 44
 *                     cancelled:
 *                       type: number
 *                       example: 15
 *                     completed:
 *                       type: number
 *                       example: 42
 */
router.get('/stats', getVisitBookingStats);

/**
 * @swagger
 * /api/visit-bookings/{id}:
 *   get:
 *     summary: Get visit booking by ID
 *     tags: [VisitBookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Visit booking found
 */
router.get('/:id', getVisitBookingById);

/**
 * @swagger
 * /api/visit-bookings/{id}:
 *   delete:
 *     summary: Delete visit booking by ID
 *     tags: [VisitBookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Visit booking deleted
 */
router.delete('/:id', protect, authorize('admin'), deleteVisitBooking);



module.exports = router;
