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
 *                 example: '9988774422'
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
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated successfully
 */
router.put('/:id', protect, authorize('admin'), updateVisitBooking);

/**
 * @swagger
 * /api/visit-bookings/stats:
 *   get:
 *     summary: Get visit booking statistics and the most recent booking
 *     tags: [VisitBookings]
 *     responses:
 *       200:
 *         description: Visit booking stats fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Stats fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 4
 *                     pending:
 *                       type: integer
 *                       example: 1
 *                     confirmed:
 *                       type: integer
 *                       example: 1
 *                     cancelled:
 *                       type: integer
 *                       example: 1
 *                     completed:
 *                       type: integer
 *                       example: 1
 *                     recent:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         date:
 *                           type: string
 *                           format: date
 *                         timeSlot:
 *                           type: string
 *                         mode:
 *                           type: string
 *                         description:
 *                           type: string
 *                         status:
 *                           type: string
 *                         name:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 */
router.get('/stats', protect, authorize('admin'), getVisitBookingStats);

/**
 * @swagger
 * /api/visit-bookings:
 *   get:
 *     summary: Get all visit bookings with pagination
 *     tags: [VisitBookings]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         default: 10
 *     responses:
 *       200:
 *         description: List of visit bookings
 */
router.get('/', protect, authorize('admin'), getAllVisitBookings);

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
