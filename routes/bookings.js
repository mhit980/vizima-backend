const express = require('express');
const router = express.Router();
const {
    createBooking,
    getAllBookings,
    getUserBookings,
    getBooking,
    updateBooking,
    cancelBooking,
    confirmBooking,
    checkAvailability,
    getBookingStats
} = require('../controllers/bookingController');

const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roleAuth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - property
 *         - user
 *         - checkIn
 *         - checkOut
 *         - guests
 *         - totalAmount
 *         - contactInfo
 *         - fullName
 *         - phoneNumber
 *         - email
 *         - gender
 *         - sharing
 *         - scheduleDate
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the booking
 *         property:
 *           type: string
 *           description: Property ID reference
 *         user:
 *           type: string
 *           description: User ID reference
 *         checkIn:
 *           type: string
 *           format: date
 *           description: Check-in date
 *         checkOut:
 *           type: string
 *           format: date
 *           description: Check-out date
 *         guests:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           description: Number of guests
 *         totalAmount:
 *           type: float
 *           minimum: 0
 *           description: Total booking amount
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed, in-progress]
 *           default: pending
 *           description: Booking status
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, failed, refunded, partial]
 *           default: pending
 *           description: Payment status
 *         paymentMethod:
 *           type: string
 *           enum: [credit_card, debit_card, paypal, bank_transfer, cash]
 *           default: credit_card
 *           description: Payment method
 *         paymentId:
 *           type: string
 *           description: Payment transaction ID
 *         specialRequests:
 *           type: string
 *           maxLength: 500
 *           description: Special requests from guest
 *         cancellationReason:
 *           type: string
 *           maxLength: 500
 *           description: Reason for cancellation
 *         refundAmount:
 *           type: number
 *           minimum: 0
 *           default: 0
 *           description: Refund amount
 *         reviewSubmitted:
 *           type: boolean
 *           default: false
 *           description: Whether review has been submitted
 *         contactInfo:
 *           type: object
 *           required:
 *             - phone
 *             - email
 *           properties:
 *             phone:
 *               type: string
 *               description: Contact phone number
 *             email:
 *               type: string
 *               format: email
 *               description: Contact email address
 *             emergencyContact:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: Emergency contact name
 *                 phone:
 *                   type: string
 *                   description: Emergency contact phone
 *                 relation:
 *                   type: string
 *                   description: Relation to guest
 *         fullName:
 *           type: string
 *           maxLength: 100
 *           description: Full name of the guest
 *         phoneNumber:
 *           type: string
 *           pattern: '^\d{10}$'
 *           description: 10-digit phone number
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the guest
 *         gender:
 *           type: string
 *           enum: [male, female, unisex]
 *           description: Gender of the guest
 *         sharing:
 *           type: string
 *           enum: [single, double, triple]
 *           description: Sharing type preference
 *         scheduleDate:
 *           type: string
 *           format: date
 *           description: Booking date
 *         duration:
 *           type: integer
 *           description: Duration of stay in days (virtual field)
 *         bookingReference:
 *           type: string
 *           description: Booking reference number (virtual field)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *       example:
 *         _id: "64f8b2c1d4e5f6a7b8c9d0e1"
 *         property: "64f8b2c1d4e5f6a7b8c9d0e2"
 *         user: "64f8b2c1d4e5f6a7b8c9d0e3"
 *         checkIn: "2024-01-15"
 *         checkOut: "2024-01-20"
 *         guests: 2
 *         totalAmount: 500
 *         status: "pending"
 *         paymentStatus: "pending"
 *         paymentMethod: "credit_card"
 *         specialRequests: "Late check-in preferred"
 *         contactInfo:
 *           phone: "+1234567890"
 *           email: "john@example.com"
 *           emergencyContact:
 *             name: "Jane Doe"
 *             phone: "+1234567891"
 *             relation: "Spouse"
 *         fullName: "John Doe"
 *         phoneNumber: "9876543210"
 *         email: "john.doe@example.com"
 *         gender: "male"
 *         sharing: "single"
 *         scheduleDate: "2024-01-15"
 *         duration: 5
 *         bookingReference: "BKD4E5F6A7"
 *     
 *     BookingInput:
 *       type: object
 *       required:
 *         - property
 *         - checkIn
 *         - checkOut
 *         - guests
 *         - contactInfo
 *         - fullName
 *         - phoneNumber
 *         - email
 *         - gender
 *         - sharing
 *         - scheduleDate
 *       properties:
 *         property:
 *           type: string
 *           description: Property ID
 *         checkIn:
 *           type: string
 *           format: date
 *           description: Check-in date
 *         checkOut:
 *           type: string
 *           format: date
 *           description: Check-out date
 *         guests:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           description: Number of guests
 *         totalAmount:
 *           type: float
 *           minimum: 0
 *           description: Total amount
 *         specialRequests:
 *           type: string
 *           maxLength: 500
 *           description: Special requests
 *         paymentMethod:
 *           type: string
 *           enum: [credit_card, debit_card, paypal, bank_transfer, cash]
 *           default: credit_card
 *           description: Payment method
 *         contactInfo:
 *           type: object
 *           required:
 *             - phone
 *             - email
 *           properties:
 *             phone:
 *               type: string
 *               description: Contact phone number
 *             email:
 *               type: string
 *               format: email
 *               description: Contact email address
 *             emergencyContact:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: Emergency contact name
 *                 phone:
 *                   type: string
 *                   description: Emergency contact phone
 *                 relation:
 *                   type: string
 *                   description: Relation to guest
 *         fullName:
 *           type: string
 *           maxLength: 100
 *           description: Full name of the guest
 *         phoneNumber:
 *           type: string
 *           pattern: '^\d{10}$'
 *           description: 10-digit phone number
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the guest
 *         gender:
 *           type: string
 *           enum: [male, female, unisex]
 *           description: Gender of the guest
 *         sharing:
 *           type: string
 *           enum: [single, double, triple]
 *           description: Sharing type preference
 *         scheduleDate:
 *           type: string
 *           format: date
 *           description: Booking date
 *       example:
 *         property: "64f8b2c1d4e5f6a7b8c9d0e2"
 *         checkIn: "2024-01-15"
 *         checkOut: "2024-01-20"
 *         guests: 2
 *         totalAmount: 500.00
 *         specialRequests: "Late check-in preferred"
 *         paymentMethod: "credit_card"
 *         contactInfo:
 *           phone: "+1234567890"
 *           email: "john@example.com"
 *           emergencyContact:
 *             name: "Jane Doe"
 *             phone: "+1234567891"
 *             relation: "Spouse"
 *         fullName: "John Doe"
 *         phoneNumber: "9876543210" 
 *         email: "john.doe@example.com"
 *         gender: "male"
 *         sharing: "single"
 *         scheduleDate: "2024-01-15"
 *
 *     AvailabilityCheck:
 *       type: object
 *       required:
 *         - propertyId
 *         - checkIn
 *         - checkOut
 *       properties:
 *         propertyId:
 *           type: string
 *           description: Property ID to check availability
 *         checkIn:
 *           type: string
 *           format: date
 *           description: Check-in date
 *         checkOut:
 *           type: string
 *           format: date
 *           description: Check-out date
 *       example:
 *         propertyId: "64f8b2c1d4e5f6a7b8c9d0e2"
 *         checkIn: "2024-01-15"
 *         checkOut: "2024-01-20"
 *
 *   responses:
 *     BookingResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           $ref: '#/components/schemas/Booking'
 *     
 *     BookingsListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Booking'
 *         pagination:
 *           type: object
 *           properties:
 *             currentPage:
 *               type: integer
 *             totalPages:
 *               type: integer
 *             totalBookings:
 *               type: integer
 *             hasNext:
 *               type: boolean
 *             hasPrev:
 *               type: boolean
 *
 *     AvailabilityResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             available:
 *               type: boolean
 *             property:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 price:
 *                   type: number
 *                 maxGuests:
 *                   type: integer
 *
 *     BookingStatsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             totalBookings:
 *               type: integer
 *             pendingBookings:
 *               type: integer
 *             confirmedBookings:
 *               type: integer
 *             cancelledBookings:
 *               type: integer
 *             completedBookings:
 *               type: integer
 *             totalRevenue:
 *               type: number
 *             recentBookings:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 */

/**
 * @swagger
 * /api/bookings/check-availability:
 *   post:
 *     summary: Check property availability
 *     description: Check if a property is available for booking on specified dates
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AvailabilityCheck'
 *     responses:
 *       200:
 *         description: Availability check successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/AvailabilityResponse'
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Property not found
 *       500:
 *         description: Server error
 */
router.post('/check-availability', checkAvailability);

/**
 * @swagger
 * /api/bookings/admin/stats:
 *   get:
 *     summary: Get booking statistics (Admin only)
 *     description: Get comprehensive booking statistics including counts, revenue, and recent bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Booking statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BookingStatsResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/admin/stats', protect, adminOnly, getBookingStats);

/**
 * @swagger
 * /api/bookings/admin:
 *   get:
 *     summary: Get all bookings (Admin only)
 *     description: Get all bookings in the system with pagination and filtering
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
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
 *         description: Number of bookings per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed, in-progress]
 *         description: Filter by booking status
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [pending, paid, failed, refunded, partial]
 *         description: Filter by payment status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BookingsListResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/admin', protect, adminOnly, getAllBookings);

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     description: Create a new booking for a property
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingInput'
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BookingResponse'
 *       400:
 *         description: Invalid request data or property not available
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Property not found
 *       500:
 *         description: Server error
 */
router.post('/', protect, createBooking);

/**
 * @swagger
 * /api/bookings/my-bookings:
 *   get:
 *     summary: Get user's bookings
 *     description: Get all bookings for the authenticated user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
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
 *         description: Number of bookings per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed, in-progress]
 *         description: Filter by booking status
 *     responses:
 *       200:
 *         description: User bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BookingsListResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/my-bookings', protect, getUserBookings);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get single booking
 *     description: Get details of a specific booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BookingResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to access this booking
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update booking
 *     description: Update an existing booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               checkIn:
 *                 type: string
 *                 format: date
 *                 description: New check-in date
 *               checkOut:
 *                 type: string
 *                 format: date
 *                 description: New check-out date
 *               guests:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *                 description: Updated number of guests
 *               specialRequests:
 *                 type: string
 *                 maxLength: 500
 *                 description: Updated special requests
 *               contactInfo:
 *                 type: object
 *                 description: Updated contact information
 *               paymentMethod:
 *                 type: string
 *                 enum: [credit_card, debit_card, paypal, bank_transfer, cash]
 *                 description: Updated payment method
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BookingResponse'
 *       400:
 *         description: Invalid request data or booking cannot be updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to update this booking
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */
router.get('/:id', protect, getBooking);
router.put('/:id', protect, updateBooking);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   put:
 *     summary: Cancel booking
 *     description: Cancel an existing booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancellationReason:
 *                 type: string
 *                 maxLength: 500
 *                 description: Reason for cancellation
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     booking:
 *                       $ref: '#/components/schemas/Booking'
 *                     refundAmount:
 *                       type: number
 *       400:
 *         description: Booking cannot be cancelled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to cancel this booking
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */
router.put('/:id/cancel', protect, cancelBooking);

/**
 * @swagger
 * /api/bookings/{id}/confirm:
 *   put:
 *     summary: Confirm booking (Admin only)
 *     description: Confirm a pending booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/BookingResponse'
 *       400:
 *         description: Only pending bookings can be confirmed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */
router.put('/:id/confirm', protect, adminOnly, confirmBooking);

module.exports = router;