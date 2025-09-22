const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');

/**
 * @swagger
 * tags:
 *   - name: Forms
 *     description: Form submission management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Form:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *         - location
 *         - pgType
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the person
 *         phone:
 *           type: string
 *           description: Phone number of the person
 *         location:
 *           type: string
 *           description: Location of the PG
 *         pgType:
 *           type: string
 *           enum: [male, female, unisex, trans]
 *           description: Type of PG
 */

/**
 * @swagger
 * /api/forms:
 *   post:
 *     summary: Create a new form submission
 *     tags: [Forms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Form'
 *     responses:
 *       201:
 *         description: Form submission created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Form'
 *       400:
 *         description: Invalid input
 */
router.post('/', formController.createForm);

/**
 * @swagger
 * /api/forms:
 *   get:
 *     summary: Retrieve all form submissions
 *     tags: [Forms]
 *     responses:
 *       200:
 *         description: A list of form submissions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Form'
 */
router.get('/', formController.getAllForms);

/**
 * @swagger
 * /api/forms/{id}:
 *   get:
 *     summary: Get a form submission by ID
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The form ID
 *     responses:
 *       200:
 *         description: The form submission
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Form'
 *       404:
 *         description: Form not found
 */
router.get('/:id', formController.getFormById);

/**
 * @swagger
 * /api/forms/{id}:
 *   put:
 *     summary: Update a form submission by ID
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The form ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Form'
 *     responses:
 *       200:
 *         description: Form updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Form'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Form not found
 */
router.put('/:id', formController.updateForm);

/**
 * @swagger
 * /api/forms/{id}:
 *   delete:
 *     summary: Delete a form submission by ID
 *     tags: [Forms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The form ID
 *     responses:
 *       200:
 *         description: Form deleted successfully
 *       404:
 *         description: Form not found
 */
router.delete('/:id', formController.deleteForm);

module.exports = router;