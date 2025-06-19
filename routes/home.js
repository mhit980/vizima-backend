const express = require('express');
const { query } = require('express-validator');
const {
    getAllPgHostel
} = require('../controllers/homeController');

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

module.exports = router;