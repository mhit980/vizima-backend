const express = require('express');
const router = express.Router();
const {
    getAllPgHostel,
    getBulkAccommodationProperties,
} = require('../controllers/homeController');

/**
 * @swagger
 * components:
 *   schemas:
 *     PgHostelProperty:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *           example: "Modern PG for Working Professionals"
 *         description:
 *           type: string
 *           example: "Comfortable PG accommodation with all modern amenities"
 *         type:
 *           type: string
 *           enum: [pg, hostel]
 *           example: "pg"
 *         price:
 *           type: number
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
 *           enum: [male, female, unisex, transgender, other]
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
 *           example: ["https://example.com/pg1.jpg"]
 *         bedrooms:
 *           type: number
 *           example: 1
 *         bathrooms:
 *           type: number
 *           example: 1
 *         area:
 *           type: number
 *           example: 150
 *         isAvailable:
 *           type: boolean
 *           example: true
 *         views:
 *           type: number
 *           example: 25
 *         rating:
 *           type: object
 *           properties:
 *             average:
 *               type: number
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
 *     BulkAccommodationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         count:
 *           type: number
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PgHostelProperty'
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
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         example: "Delhi"
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [male, female, unisex, transgender, other]
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/pg-hostel', getAllPgHostel);

/**
 * @swagger
 * /api/home/bulk-accommodation:
 *   get:
 *     summary: Get all properties offering bulk accommodation
 *     tags: [Home]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [interns, employees, students]
 *         example: interns
 *     responses:
 *       200:
 *         description: Bulk accommodation properties retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BulkAccommodationResponse'
 *       400:
 *         description: Invalid filter value
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/bulk-accommodation', getBulkAccommodationProperties);

module.exports = router;
