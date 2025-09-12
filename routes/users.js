const express = require('express');
const {
    getAllUsers,
    getUserProfile,
    getUserById,
    updateUserProfile,
    updateUserById,
    changePassword,
    deleteUserAccount,
    deleteUserById,
    getUserStats,
    editUserProfile
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth'); // Changed 'admin' to 'authorize'
const { validateUserUpdate, validatePasswordChange } = require('../middleware/validation');

const router = express.Router();

// Create admin middleware using authorize
const admin = authorize('admin');
const user = authorize('user');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - phone
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the user
 *         name:
 *           type: string
 *           description: User's full name
 *           maxLength: 50
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         phone:
 *           type: string
 *           pattern: '^[0-9]{10}$'
 *           description: User's 10-digit phone number
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           default: user
 *           description: User's role
 *         avatar:
 *           type: string
 *           description: URL to user's avatar image
 *         isVerified:
 *           type: boolean
 *           default: false
 *           description: Whether user's email is verified
 *         preferences:
 *           type: object
 *           properties:
 *             location:
 *               type: string
 *               description: Preferred location
 *             priceRange:
 *               type: object
 *               properties:
 *                 min:
 *                   type: number
 *                   default: 0
 *                 max:
 *                   type: number
 *                   default: 100000
 *             propertyType:
 *               type: array
 *               items:
 *                 type: string
 *               description: Preferred property types
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         _id: "64a7b8c9d1e2f3a4b5c6d7e8"
 *         name: "John Doe"
 *         email: "john.doe@example.com"
 *         phone: "1234567890"
 *         role: "user"
 *         avatar: "https://example.com/avatar.jpg"
 *         isVerified: true
 *         preferences:
 *           location: "New York"
 *           priceRange:
 *             min: 1000
 *             max: 5000
 *           propertyType: ["apartment", "house"]
 *         createdAt: "2023-07-07T10:30:00.000Z"
 *         updatedAt: "2023-07-07T10:30:00.000Z"
 * 
 *     UserUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 50
 *         phone:
 *           type: string
 *           pattern: '^[0-9]{10}$'
 *         avatar:
 *           type: string
 *         preferences:
 *           type: object
 *           properties:
 *             location:
 *               type: string
 *             priceRange:
 *               type: object
 *               properties:
 *                 min:
 *                   type: number
 *                 max:
 *                   type: number
 *             propertyType:
 *               type: array
 *               items:
 *                 type: string
 * 
 *     AdminUserUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 50
 *         email:
 *           type: string
 *           format: email
 *         phone:
 *           type: string
 *           pattern: '^[0-9]{10}$'
 *         role:
 *           type: string
 *           enum: [user, admin]
 *         isVerified:
 *           type: boolean
 *         avatar:
 *           type: string
 *         preferences:
 *           type: object
 * 
 *     PasswordChange:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           description: Current password
 *         newPassword:
 *           type: string
 *           minLength: 6
 *           description: New password (minimum 6 characters)
 * 
 *     UserStats:
 *       type: object
 *       properties:
 *         totalUsers:
 *           type: number
 *         verifiedUsers:
 *           type: number
 *         unverifiedUsers:
 *           type: number
 *         adminUsers:
 *           type: number
 *         regularUsers:
 *           type: number
 *         recentRegistrations:
 *           type: number
 *         monthlyStats:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: object
 *                 properties:
 *                   year:
 *                     type: number
 *                   month:
 *                     type: number
 *               count:
 *                 type: number
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
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
 *         description: Number of users per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *         description: Filter by user role
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filter by verification status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: number
 *                     totalPages:
 *                       type: number
 *                     totalUsers:
 *                       type: number
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/', protect, admin, getAllUsers);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/profile', protect, getUserProfile);

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user statistics (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserStats'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/stats', protect, admin, getUserStats);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/:id', protect, admin, getUserById);

/**
 * @swagger
 * /api/users/edit-profile:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               phone:
 *                 type: string
 *                 example: "+919876543210"
 *               address:
 *                 type: string
 *                 example: 123 Street, City
 *               dob:
 *                 type: string
 *                 format: date
 *                 example: 1995-06-30
 *               gender:
 *                 type: string
 *                 enum: [male, female, unisex, transgender, other]
 *                 example: male
 *               maritalStatus:
 *                 type: string
 *                 enum: [single, married, divorced, widowed]
 *                 example: single
 *               occupation:
 *                 type: string
 *                 example: Software Engineer
 *               company:
 *                 type: string
 *                 example: Google
 *               website:
 *                 type: string
 *                 example: https://johndoe.com
 *               bio:
 *                 type: string
 *                 example: Passionate developer.
 *               tempPhone:
 *                 type: string
 *                 example: "+919876543210"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.put('/edit-profile', protect, editUserProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/profile', protect, validateUserUpdate, updateUserProfile);

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PasswordChange'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - Invalid current password or validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/change-password', protect, validatePasswordChange, changePassword);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminUserUpdate'
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - Email already exists or validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/:id', protect, admin, updateUserById);


/**
 * @swagger
 * /api/users/profile:
 *   delete:
 *     summary: Delete current user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/profile', protect, deleteUserAccount);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - Cannot delete own account
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, admin, deleteUserById);

module.exports = router;