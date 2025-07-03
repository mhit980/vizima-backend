const express = require('express');
const router = express.Router();
const cityController = require('../controllers/cityController');

/**
 * @swagger
 * components:
 *   schemas:
 *     City:
 *       type: object
 *       required:
 *         - name
 *         - imageUrl
 *         - order
 *       properties:
 *         name:
 *           type: string
 *           example: "New York"
 *         imageUrl:
 *           type: string
 *           example: "https://example.com/images/nyc.jpg"
 *         order:
 *           type: integer
 *           example: 1
 *         isVisible:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * tags:
 *   name: Cities
 *   description: API for managing cities
 */

/**
 * @swagger
 * /api/cities:
 *   post:
 *     summary: Create a new city
 *     tags: [Cities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/City'
 *     responses:
 *       201:
 *         description: City created successfully
 *       500:
 *         description: Server error
 */
router.post('/', cityController.createCity);

/**
 * @swagger
 * /api/cities:
 *   get:
 *     summary: Get all cities (ordered, paginated)
 *     tags: [Cities]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 6
 *     responses:
 *       200:
 *         description: List of cities
 */
router.get('/', cityController.getAllCities);

/**
 * @swagger
 * /api/cities/{id}:
 *   get:
 *     summary: Get a city by ID
 *     tags: [Cities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 60f6c0c5fc13ae3a3500000b
 *     responses:
 *       200:
 *         description: City details
 *       500:
 *         description: Server error
 */
router.get('/:id', cityController.getCityById);

/**
 * @swagger
 * /api/cities/{id}:
 *   put:
 *     summary: Update a city
 *     tags: [Cities]
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
 *             $ref: '#/components/schemas/City'
 *     responses:
 *       200:
 *         description: City updated
 *       500:
 *         description: Server error
 */
router.put('/:id', cityController.updateCity);

/**
 * @swagger
 * /api/cities/{id}:
 *   delete:
 *     summary: Delete a city
 *     tags: [Cities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: City deleted
 *       500:
 *         description: Server error
 */
router.delete('/:id', cityController.deleteCity);

module.exports = router;
