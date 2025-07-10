const express = require('express');
const router = express.Router();
const controller = require('../controllers/siteSettingController');

/**
 * @swagger
 * components:
 *   schemas:
 *     SystemSettings:
 *       type: object
 *       required:
 *         - siteName
 *         - siteDescription
 *         - contactEmail
 *         - contactPhone
 *         - address
 *       properties:
 *         siteName:
 *           type: string
 *         siteDescription:
 *           type: string
 *         contactEmail:
 *           type: string
 *         contactPhone:
 *           type: string
 *         address:
 *           type: string
 */

/**
 * @swagger
 * /api/settings:
 *   post:
 *     summary: Create system settings
 *     tags: [SystemSettings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SystemSettings'
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', controller.createSettings);

/**
 * @swagger
 * /api/settings/{id}:
 *   get:
 *     summary: Get system settings by ID
 *     tags: [SystemSettings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Not found
 */
router.get('/:id', controller.getSettingsById);

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get all system settings
 *     tags: [SystemSettings]
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SystemSettings'
 *       500:
 *         description: Internal Server Error
 */
router.get('/', controller.getAllSettings);

/**
 * @swagger
 * /api/settings/{id}:
 *   put:
 *     summary: Update system settings by ID
 *     tags: [SystemSettings]
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
 *             $ref: '#/components/schemas/SystemSettings'
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/:id', controller.updateSettingsById);

/**
 * @swagger
 * /api/settings/{id}:
 *   delete:
 *     summary: Delete system settings by ID
 *     tags: [SystemSettings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
router.delete('/:id', controller.deleteSettingsById);

module.exports = router;
