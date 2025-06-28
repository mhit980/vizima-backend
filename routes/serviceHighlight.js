const express = require('express');
const router = express.Router();
const controller = require('../controllers/serviceHighlightController');

/**
 * @swagger
 * tags:
 *   name: ServiceHighlights
 *   description: Manage service highlights
 */

/**
 * @swagger
 * /api/service-highlights:
 *   post:
 *     summary: Create a new service highlight
 *     tags: [ServiceHighlights]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Service highlight created
 */
router.post('/', controller.createServiceHighlight);

/**
 * @swagger
 * /api/service-highlights:
 *   get:
 *     summary: Get all service highlights
 *     tags: [ServiceHighlights]
 *     responses:
 *       200:
 *         description: List of service highlights
 */
router.get('/', controller.getAllServiceHighlights);

/**
 * @swagger
 * /api/service-highlights/{id}:
 *   get:
 *     summary: Get a service highlight by ID
 *     tags: [ServiceHighlights]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service highlight details
 */
router.get('/:id', controller.getServiceHighlightById);

/**
 * @swagger
 * /api/service-highlights/{id}:
 *   put:
 *     summary: Update a service highlight
 *     tags: [ServiceHighlights]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated service highlight
 */
router.put('/:id', controller.updateServiceHighlight);

/**
 * @swagger
 * /api/service-highlights/{id}:
 *   delete:
 *     summary: Delete a service highlight
 *     tags: [ServiceHighlights]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service highlight deleted
 */
router.delete('/:id', controller.deleteServiceHighlight);

module.exports = router;
