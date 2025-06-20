const express = require('express');
const { query, body } = require('express-validator');
const {
    getAllPgHostel,
    bookVisit,
    getAllVisitBookings,
    getVisitBookingById,
} = require('../controllers/homeController');
const { protect, authorize } = require('../middleware/auth')

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PgHostelProperty:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ObjectId
 *         title:
 *           type: string
 *           description: Property title
 *           example: "Modern PG for Working Professionals"
 *         description:
 *           type: string
 *           description: Property description
 *           example: "Comfortable PG accommodation with all modern amenities"
 *         type:
 *           type: string
 *           enum: [pg, hostel]
 *           description: Property type
 *           example: "pg"
 *         price:
 *           type: number
 *           minimum: 0
 *           description: Property price per month
 *           example: 8000
 *         location:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *               example: "123 College Street"
 *             city:
 *               type: string
 *               example: "Delhi"
 *             state:
 *               type: string
 *               example: "Delhi"
 *             zipCode:
 *               type: string
 *               example: "110001"
 *         gender:
 *           type: string
 *           enum: [male, female, unisex]
 *           description: Gender preference for PG/Hostel
 *           example: "unisex"
 *         amenities:
 *           type: array
 *           items:
 *             type: string
 *           example: ["wifi", "security", "ac", "furnished"]
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs
 *           example: ["https://example.com/pg1.jpg", "https://example.com/pg2.jpg"]
 *         bedrooms:
 *           type: number
 *           minimum: 0
 *           example: 1
 *         bathrooms:
 *           type: number
 *           minimum: 0
 *           example: 1
 *         area:
 *           type: number
 *           minimum: 1
 *           description: Property area in square feet
 *           example: 150
 *         isAvailable:
 *           type: boolean
 *           example: true
 *         owner:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *             name:
 *               type: string
 *               example: "John Doe"
 *             email:
 *               type: string
 *               example: "john@example.com"
 *             phone:
 *               type: string
 *               example: "+91-9876543210"
 *         views:
 *           type: number
 *           example: 25
 *         rating:
 *           type: object
 *           properties:
 *             average:
 *               type: number
 *               minimum: 0
 *               maximum: 5
 *               example: 4.2
 *             count:
 *               type: number
 *               example: 8
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     PgHostelResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         count:
 *           type: number
 *           example: 15
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: number
 *               example: 1
 *             limit:
 *               type: number
 *               example: 10
 *             total:
 *               type: number
 *               example: 150
 *             pages:
 *               type: number
 *               example: 15
 *         data:
 *           type: object
 *           properties:
 *             properties:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PgHostelProperty'
 *     
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Error message"
 */

/**
 * @swagger
 * /api/home/pg-hostel:
 *   get:
 *     summary: Get all PG and Hostel listings with search and gender filter
 *     tags: [Home]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of properties per page
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by location (address, city, state, zipCode)
 *         example: "Delhi"
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [male, female, unisex]
 *         description: Filter by gender preference
 *         example: "unisex"
 *     responses:
 *       200:
 *         description: PG and Hostel properties retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PgHostelResponse'
 *       400:
 *         description: Invalid gender filter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Invalid gender filter"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Server error"
 */
router.get('/pg-hostel', getAllPgHostel);

/**
 * @swagger
 * /api/home/visit-booking:
 *   post:
 *     summary: Book a visit for a property
 *     tags: [Home]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - timeSlot
 *               - mode
 *               - propertyId
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-06-21"
 *               timeSlot:
 *                 type: string
 *                 enum:
 *                   - "9:00 AM"
 *                   - "9:30 AM"
 *                   - "10:00 AM"
 *                   - "10:30 AM"
 *                   - "11:00 AM"
 *                   - "11:30 AM"
 *                   - "12:00 PM"
 *                   - "12:30 PM"
 *                   - "1:00 PM"
 *                   - "1:30 PM"
 *                   - "2:00 PM"
 *                   - "2:30 PM"
 *                   - "3:00 PM"
 *                   - "3:30 PM"
 *                   - "4:00 PM"
 *                   - "4:30 PM"
 *                   - "5:00 PM"
 *                   - "5:30 PM"
 *               mode:
 *                 type: string
 *                 enum: [Physical, Virtual]
 *               description:
 *                 type: string
 *                 example: "Interested in seeing the room condition in person"
 *               propertyId:
 *                 type: string
 *                 example: "665abcf90348f132a8eec12a"
 *     responses:
 *       201:
 *         description: Visit booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Visit booked successfully"
 *                 data:
 *                   $ref: '#/components/schemas/VisitBooking'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post(
    '/visit-booking',
    protect,
    authorize('user'),
    [
        body('date').isISO8601().withMessage('Valid date is required'),
        body('timeSlot').isString().withMessage('Time slot is required'),
        body('mode').isIn(['Physical', 'Virtual']).withMessage('Mode must be Physical or Virtual'),
        body('description').optional().isString(),
        body('propertyId').isMongoId().withMessage('Valid propertyId is required')
    ],
    bookVisit
);


/**
 * @swagger
 * /api/home/visit-bookings:
 *   get:
 *     summary: Get all visit bookings with pagination
 *     tags: [Home]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of bookings per page
 *     responses:
 *       200:
 *         description: A paginated list of visit bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 2
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     pages:
 *                       type: integer
 *                       example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date
 *                       timeSlot:
 *                         type: string
 *                       mode:
 *                         type: string
 *                         enum: [Physical, Virtual]
 *                       description:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Internal server error
 */
router.get('/visit-bookings', protect, authorize('admin'), getAllVisitBookings);

/**
 * @swagger
 * /api/home/visit-bookings/{id}:
 *   get:
 *     summary: Get a visit booking by ID
 *     tags: [Home]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: MongoDB ObjectId of the visit booking
 *         schema:
 *           type: string
 *           example: 665abc12345f132a8eec12a9
 *     responses:
 *       200:
 *         description: Visit booking found
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
 *                     date:
 *                       type: string
 *                       format: date
 *                     timeSlot:
 *                       type: string
 *                     mode:
 *                       type: string
 *                       enum: [Physical, Virtual]
 *                     description:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Visit booking not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Visit booking not found"
 *       500:
 *         description: Server error
 */
router.get('/visit-bookings/:id', getVisitBookingById);

module.exports = router;