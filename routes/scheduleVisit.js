const express = require('express');
const router = express.Router();
const scheduleVisitController = require('../controllers/scheduleVisitController');

/**
 * @swagger
 * components:
 *   schemas:
 *     ScheduleVisit:
 *       type: object
 *       required:
 *         - propertyId
 *         - fullName
 *         - phone
 *         - email
 *         - mode
 *         - date
 *         - propertyName
 *       properties:
 *         propertyId:
 *           type: string
 *           example: "60c72b2f5f1b2c001c8d4c3b"
 *         gender:
 *           type: string
 *           enum: [male, female, unisex, transgender, other]
 *           example: "male"
 *         sharing:
 *           type: string
 *           enum: [single, double, triple]
 *           example: "double"
 *         propertyName:
 *           type: string
 *           example: "Sunrise Apartments"
 *         fullName:
 *           type: string
 *           example: "John Doe"
 *         phone:
 *           type: string
 *           example: "9876543210"
 *         email:
 *           type: string
 *           example: "john.doe@example.com"
 *         mode:
 *           type: string
 *           enum: [physical, virtual]
 *           example: "physical"
 *         date:
 *           type: string
 *           format: date
 *           example: "2025-06-30"
 */

/**
 * @swagger
 * /api/schedule-visits:
 *   post:
 *     summary: Schedule a new visit
 *     tags: [ScheduleVisit]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScheduleVisit'
 *     responses:
 *       201:
 *         description: Visit scheduled
 */
router.post('/', scheduleVisitController.createVisit);

/**
 * @swagger
 * /api/schedule-visits/{id}:
 *   put:
 *     summary: Update a visit by ID
 *     tags: [ScheduleVisit]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Visit ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScheduleVisit'
 *     responses:
 *       200:
 *         description: Visit updated
 */
router.put('/:id', scheduleVisitController.updateVisit);

/**
 * @swagger
 * /api/schedule-visits:
 *   get:
 *     summary: Get all visits with pagination
 *     tags: [ScheduleVisit]
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
 *         description: Search by propertyName, fullName, phone, or email
 *     responses:
 *       200:
 *         description: List of visits
 */
router.get('/', scheduleVisitController.getAllVisits);

/**
 * @swagger
 * /api/schedule-visits/{id}:
 *   get:
 *     summary: Get a visit by ID
 *     tags: [ScheduleVisit]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Visit details
 */
router.get('/:id', scheduleVisitController.getVisitById);

/**
 * @swagger
 * /api/schedule-visits/{id}:
 *   delete:
 *     summary: Delete a visit by ID
 *     tags: [ScheduleVisit]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Visit deleted
 */
router.delete('/:id', scheduleVisitController.deleteVisit);

module.exports = router;
