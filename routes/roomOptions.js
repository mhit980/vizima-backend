const express = require('express');
const { body, param } = require('express-validator');
const {
    createRoomOption,
    updateRoomOption,
    getAllRoomOptions,
    getRoomOptionById,
    deleteRoomOption,
}  = require('../controllers/roomOptionsController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: RoomOptions
 *   description: API for managing room options
 */

/**
 * @swagger
 * /api/room-options:
 *   post:
 *     summary: Create a new room option
 *     tags: [RoomOptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roomType:
 *                 type: string
 *                 enum: [single, double, triple]
 *               monthlyRent:
 *                 type: number
 *               securityDeposit:
 *                 type: number
 *               acType:
 *                 type: string
 *                 enum: [AC, Non-AC]
 *               mealsIncluded:
 *                 type: boolean
 *               bookingUrl:
 *                 type: string
 *               property:
 *                 type: string
 *     responses:
 *       201:
 *         description: Room option created
 */
router.post(
    '/',
    [
        body('roomType').isIn(['single', 'double', 'triple']),
        body('monthlyRent').isFloat({ gt: 0 }),
        body('securityDeposit').isFloat({ gt: 0 }),
        body('acType').isIn(['AC', 'Non-AC']),
        body('mealsIncluded').isBoolean(),
        body('property').isMongoId(),
    ],
    createRoomOption
);

/**
 * @swagger
 * /api/room-options:
 *   get:
 *     summary: Get all room options
 *     tags: [RoomOptions]
 *     responses:
 *       200:
 *         description: A list of room options
 */
router.get('/', getAllRoomOptions);

/**
 * @swagger
 * /api/room-options/{id}:
 *   get:
 *     summary: Get a room option by ID
 *     tags: [RoomOptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: RoomOption ID
 *     responses:
 *       200:
 *         description: Room option details
 */
router.get('/:id', [param('id').isMongoId()], getRoomOptionById);

/**
 * @swagger
 * /api/room-options/{id}:
 *   put:
 *     summary: Update a room option
 *     tags: [RoomOptions]
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
 *             type: object
 *             properties:
 *               roomType:
 *                 type: string
 *                 enum: [single, double, triple]
 *               monthlyRent:
 *                 type: number
 *               securityDeposit:
 *                 type: number
 *               acType:
 *                 type: string
 *                 enum: [AC, Non-AC]
 *               mealsIncluded:
 *                 type: boolean
 *               bookingUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Room option updated
 */
router.put(
    '/:id',
    [
        param('id').isMongoId(),
        body('roomType').optional().isIn(['single', 'double', 'triple']),
        body('monthlyRent').optional().isFloat({ gt: 0 }),
        body('securityDeposit').optional().isFloat({ gt: 0 }),
        body('acType').optional().isIn(['AC', 'Non-AC']),
        body('mealsIncluded').optional().isBoolean(),
        body('bookingUrl').optional().isString(),
    ],
    updateRoomOption
);

/**
 * @swagger
 * /api/room-options/{id}:
 *   delete:
 *     summary: Delete a room option
 *     tags: [RoomOptions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room option deleted
 */
router.delete('/:id', [param('id').isMongoId()], deleteRoomOption);

module.exports = router;
