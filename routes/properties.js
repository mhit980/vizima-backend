const express = require('express');
const { body, query, param } = require('express-validator');
const {
    getProperties,
    getProperty,
    createProperty,
    updateProperty,
    deleteProperty,
    searchByLocation,
    getFeaturedProperties,
    getPropertyStats,
    getSimilarProperties,
    getPaginatedPropertyTitles,
    deleteMultipleProperties,
} = require('../controllers/propertyController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Property:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - type
 *         - location
 *         - images
 *         - area
 *         - owner
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ObjectId
 *         title:
 *           type: string
 *           maxLength: 100
 *           description: Property title
 *           example: "Luxury 2BHK Apartment in Downtown"
 *         description:
 *           type: string
 *           maxLength: 1000
 *           description: Property description
 *           example: "Beautiful fully furnished apartment with modern amenities"
 *         type:
 *           type: string
 *           enum: [apartment, house, room, studio, villa, penthouse]
 *           description: Property type
 *           example: "apartment"
 *         location:
 *           type: object
 *           required:
 *             - address
 *             - city
 *             - state
 *             - zipCode
 *           properties:
 *             address:
 *               type: string
 *               example: "123 Main Street"
 *             city:
 *               type: string
 *               example: "New York"
 *             state:
 *               type: string
 *               example: "NY"
 *             zipCode:
 *               type: string
 *               example: "10001"
 *             coordinates:
 *               type: object
 *               properties:
 *                 lat:
 *                   type: number
 *                   example: 40.7128
 *                 lng:
 *                   type: number
 *                   example: -74.0060
 *         amenities:
 *           type: array
 *           items:
 *             type: string
 *             enum: [wifi, parking, gym, daily_cleaning, laundry, ac, heating, kitchen, balcony, garden, security, elevator, power_backup, furnished, tv, transportation, microwave, refrigerator]
 *           example: ["wifi", "parking", "ac", "furnished"]
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs
 *           example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *         area:
 *           type: number
 *           minimum: 1
 *           description: Property area in square feet
 *           example: 1200
 *         isAvailable:
 *           type: boolean
 *           default: true
 *           example: true
 *         isFeatured:
 *           type: boolean
 *           default: false
 *           example: false
 *         owner:
 *           type: string
 *           description: Owner's user ID
 *           example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *         views:
 *           type: number
 *           default: 0
 *           example: 45
 *         rating:
 *           type: object
 *           properties:
 *             average:
 *               type: number
 *               minimum: 0
 *               maximum: 5
 *               default: 0
 *               example: 4.5
 *             count:
 *               type: number
 *               default: 0
 *               example: 10
 *         rules:
 *           type: array
 *           items:
 *             type: string
 *           example: ["No smoking", "No pets", "No parties"]
 *         nearbyPlaces:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Central Hospital"
 *               distance:
 *                 type: string
 *                 example: "0.5 km"
 *               type:
 *                 type: string
 *                 enum: [hospital, school, mall, restaurant, transport, other]
 *                 example: "hospital"
 *         sharingType:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [single, double, triple, quadruple]
 *                 example: "single"
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 15000
 *           example: [{"type": "single", "price": 15000}, {"type": "double", "price": 12000}]
 *         youtubeLink:
 *           type: string
 *           description: YouTube video link for property tour
 *           example: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *         microSiteLink:
 *           type: string
 *           description: Link to microSite
 *           example: "https://example.com/microsite"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         phone:
 *           type: string
 *           description: Owner or property contact phone number
 *           example: "+911234567890"
 *     
 *     PropertyResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             property:
 *               $ref: '#/components/schemas/Property'
 *             phone:
 *               type: string
 *               description: Owner or property contact phone number
 *               example: "+911234567890"
 *     
 *     PropertiesResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         count:
 *           type: number
 *           example: 10
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
 *               example: 100
 *             pages:
 *               type: number
 *               example: 10
 *         data:
 *           type: object
 *           properties:
 *             properties:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Property'
 *             phone:
 *               type: string
 *               description: Owner or property contact phone number
 *               example: "+911234567890"
 *     
 *     PropertyStats:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             overview:
 *               type: object
 *               properties:
 *                 totalProperties:
 *                   type: number
 *                   example: 150
 *                 availableProperties:
 *                   type: number
 *                   example: 120
 *                 averagePrice:
 *                   type: number
 *                   example: 45000
 *                 totalViews:
 *                   type: number
 *                   example: 2500
 *                 phone:
 *                   type: string
 *                   description: Owner or property contact phone number
 *                   example: "+911234567890"
 *             byType:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "apartment"
 *                   count:
 *                     type: number
 *                     example: 75
 *                   averagePrice:
 *                     type: number
 *                     example: 35000
 *             byLocation:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "New York"
 *                   count:
 *                     type: number
 *                     example: 45
 *                   averagePrice:
 *                     type: number
 *                     example: 55000
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
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               msg:
 *                 type: string
 *               param:
 *                 type: string
 *               location:
 *                 type: string
 *   
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// Validation middleware
const createPropertyValidation = [
    body('title')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Title must be between 1 and 100 characters'),
    body('description')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Description must be between 1 and 1000 characters'),
    body('type')
        .isIn(['apartment', 'house', 'room', 'studio', 'villa', 'penthouse', 'pg', 'hostel'])
        .withMessage('Please select a valid property type'),
    body('location.address')
        .trim()
        .notEmpty()
        .withMessage('Address is required'),
    body('location.city')
        .trim()
        .notEmpty()
        .withMessage('City is required'),
    body('location.state')
        .trim()
        .notEmpty()
        .withMessage('State is required'),
    body('location.zipCode')
        .trim()
        .notEmpty()
        .withMessage('Zip code is required'),
    body('location.coordinates.lat')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    body('location.coordinates.lng')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
    body('amenities')
        .optional()
        .isArray()
        .withMessage('Amenities must be an array'),
    body('amenities.*')
        .optional()
        .isIn(['wifi', 'parking', 'gym', 'daily_cleaning', 'laundry', 'ac', 'heating', 'kitchen', 'balcony', 'garden', 'security', 'elevator', 'power_backup', 'furnished', 'tv', 'transportation', 'microwave', 'refrigerator'])
        .withMessage('Invalid amenity'),
    body('images')
        .isArray({ min: 1 })
        .withMessage('At least one image is required'),
    body('images.*')
        .isURL()
        .withMessage('Each image must be a valid URL'),
    body('area')
        .isFloat({ min: 1 })
        .withMessage('Area must be at least 1 square foot'),
    body('rules')
        .optional()
        .isArray()
        .withMessage('Rules must be an array'),
    body('nearbyPlaces')
        .optional()
        .isArray()
        .withMessage('Nearby places must be an array'),
    body('nearbyPlaces.*.name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Nearby place name is required'),
    body('nearbyPlaces.*.distance')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Distance is required'),
    body('nearbyPlaces.*.type')
        .optional()
        .isIn(['hospital', 'school', 'mall', 'restaurant', 'transport', 'other'])
        .withMessage('Invalid nearby place type'),
    body('bulkAccommodation')
        .optional()
        .isBoolean()
        .withMessage('bulkAccommodation must be a boolean'),

    body('bulkAccommodationType')
        .optional()
        .isArray()
        .withMessage('bulkAccommodationType must be an array'),

    body('bulkAccommodationType.*')
        .optional()
        .isIn(['interns', 'employees', 'students', 'managed_accommodation'])
        .withMessage('Invalid bulkAccommodationType value'),

    body('microSiteLink')
        .optional()
        .isURL()
        .withMessage('microSiteLink must be a valid URL'),

    body('sharingType')
        .optional()
        .isArray()
        .withMessage('Sharing type must be an array'),

    body('sharingType.*.type')
        .optional()
        .isIn(['single', 'double', 'triple', 'quadruple'])
        .withMessage('Invalid sharing type'),

    body('sharingType.*.price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Sharing type price must be a positive number'),

    body('youtubeLink')
        .optional({ nullable: true, checkFalsy: true })
        .isURL()
        .withMessage('YouTube link must be a valid URL or null')
];

const updatePropertyValidation = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Title must be between 1 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Description must be between 1 and 1000 characters'),
    body('type')
        .optional()
        .isIn(['apartment', 'house', 'room', 'studio', 'villa', 'penthouse', 'pg', 'hostel'])
        .withMessage('Please select a valid property type'),
    body('location.address')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Address cannot be empty'),
    body('location.city')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('City cannot be empty'),
    body('location.state')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('State cannot be empty'),
    body('location.zipCode')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Zip code cannot be empty'),
    body('area')
        .optional()
        .isFloat({ min: 1 })
        .withMessage('Area must be at least 1 square foot'),
    body('microSiteLink')
        .optional()
        .isURL()
        .withMessage('microSiteLink must be a valid URL'),

    body('sharingType')
        .optional()
        .isArray()
        .withMessage('Sharing type must be an array'),

    body('sharingType.*.type')
        .optional()
        .isIn(['single', 'double', 'triple', 'quadruple'])
        .withMessage('Invalid sharing type'),

    body('sharingType.*.price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Sharing type price must be a positive number'),

    body('youtubeLink')
        .optional({ nullable: true, checkFalsy: true })
        .isURL()
        .withMessage('YouTube link must be a valid URL or null')
];

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Get all properties with filters and pagination
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of properties per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [apartment, house, room, studio, villa, penthouse, pg, hostel]
 *         description: Filter by property type
 *       - in: query
 *         name: sharingType
 *         schema:
 *           type: [string]
 *           enum: [single, double, triple, quadruple]
 *         description: Filter by sharing type
 *       - in: query
 *         name: amenities
 *         schema:
 *           type: string
 *         description: Comma-separated list of amenities
 *         example: "wifi,parking,gym"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Text search in title, description, and location
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, views, title]
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: isAvailable
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filter by availability
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *         description: Filter by featured status
 *     responses:
 *       200:
 *         description: Properties retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PropertiesResponse'
 *       400:
 *         description: Invalid query parameters
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
router.get('/', getProperties);

/**
 * @swagger
 * /api/properties/featured:
 *   get:
 *     summary: Get featured properties
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 6
 *         description: Number of featured properties to return
 *     responses:
 *       200:
 *         description: Featured properties retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 6
 *                 data:
 *                   type: object
 *                   properties:
 *                     properties:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Property'
 *                     phone:
 *                       type: string
 *                       description: Owner or property contact phone number
 *                       example: "+911234567890"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/featured', getFeaturedProperties);

/**
 * @swagger
 * /api/properties/stats:
 *   get:
 *     summary: Get property statistics (Admin only)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Property statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PropertyStats'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
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
router.get('/stats', protect, authorize('admin'), getPropertyStats);

/**
 * @swagger
 * /api/properties/search/location:
 *   get:
 *     summary: Search properties by location coordinates
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         description: Latitude coordinate
 *         example: 40.7128
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *         description: Longitude coordinate
 *         example: -74.0060
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Search radius in kilometers
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *         description: Maximum number of properties to return
 *     responses:
 *       200:
 *         description: Properties found within the specified location
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 15
 *                 data:
 *                   type: object
 *                   properties:
 *                     properties:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Property'
 *                     phone:
 *                       type: string
 *                       description: Owner or property contact phone number
 *                       example: "+911234567890"
 *       400:
 *         description: Missing or invalid coordinates
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
router.get('/search/location', searchByLocation);

/**
 * @swagger
 * /api/properties/property-titles:
 *   get:
 *     summary: Get paginated list of property titles and IDs
 *     tags: [Properties]
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
 *         description: Number of properties per page
 *     responses:
 *       200:
 *         description: Paginated property list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 50
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 pageSize:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64e1f8c2c5c4c0a3d2e6abcd"
 *                       title:
 *                         type: string
 *                         example: "Luxury 2BHK Apartment in Downtown"
 *                       phone:
 *                         type: string
 *                         description: Owner or property contact phone number
 *                         example: "+911234567890"
 *       500:
 *         description: Internal server error
 */
router.get('/property-titles', getPaginatedPropertyTitles);

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Get single property by ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *         example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *     responses:
 *       200:
 *         description: Property retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PropertyResponse'
 *       404:
 *         description: Property not found
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
router.get('/:id', param('id').isMongoId().withMessage('Invalid property ID'), getProperty);

/**
 * @swagger
 * /api/properties/{id}/similar:
 *   get:
 *     summary: Get similar properties
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *         example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           default: 4
 *         description: Number of similar properties to return
 *     responses:
 *       200:
 *         description: Similar properties retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 4
 *                 data:
 *                   type: object
 *                   properties:
 *                     properties:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Property'
 *                     phone:
 *                       type: string
 *                       description: Owner or property contact phone number
 *                       example: "+911234567890"
 *       404:
 *         description: Property not found
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
router.get('/:id/similar', param('id').isMongoId().withMessage('Invalid property ID'), getSimilarProperties);

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Create a new property (Admin only)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - type
 *               - location
 *               - images
 *               - area
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Luxury 2BHK Apartment in Downtown"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Beautiful fully furnished apartment with modern amenities"
 *               type:
 *                 type: string
 *                 enum: [apartment, house, room, studio, villa, penthouse, pg, hostel]
 *                 example: "apartment"
 *               gender:
 *                 type: string
 *                 enum: [male, female, unisex, transgender, other]
 *                 example: "male"
 *               bulkAccommodation:
 *                 type: boolean
 *                 example: false
 *                 default: false
 *                 required: false
 *               bulkAccommodationType:
 *                 type: [string]
 *                 enum: [interns, employees, students, managed_accommodation ]
 *                 example: ["interns", "employees", "students", "managed_accommodation"]
 *                 required: false
 *                 default: []
 *               sharingType:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [single, double, triple, quadruple]
 *                       example: "single"
 *                     price:
 *                       type: number
 *                       minimum: 0
 *                       example: 15000
 *                 example: [{"type": "single", "price": 15000}, {"type": "double", "price": 12000}]
 *                 required: false
 *               youtubeLink:
 *                 type: string
 *                 description: YouTube video link for property tour
 *                 example: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *               location:
 *                 type: object
 *                 required:
 *                   - address
 *                   - city
 *                   - state
 *                   - zipCode
 *                 properties:
 *                   address:
 *                     type: string
 *                     example: "123 Main Street"
 *                   city:
 *                     type: string
 *                     example: "New York"
 *                   state:
 *                     type: string
 *                     example: "NY"
 *                   zipCode:
 *                     type: string
 *                     example: "10001"
 *                   coordinates:
 *                     type: object
 *                     properties:
 *                       lat:
 *                         type: number
 *                         example: 40.7128
 *                       lng:
 *                         type: number
 *                         example: -74.0060
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [wifi, parking, gym, daily_cleaning, laundry, ac, heating, kitchen, balcony, garden, security, elevator, power_backup, furnished, tv, transportation, microwave, refrigerator]
 *                 example: ["wifi", "parking", "ac", "furnished"]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *               area:
 *                 type: number
 *                 minimum: 1
 *                 example: 1200
 *               isAvailable:
 *                 type: boolean
 *                 default: true
 *               isFeatured:
 *                 type: boolean
 *                 default: false
 *               rules:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["No smoking", "No pets", "No parties"]
 *               nearbyPlaces:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Central Hospital"
 *                     distance:
 *                       type: string
 *                       example: "0.5 km"
 *                     type:
 *                       type: string
 *                       enum: [hospital, school, mall, restaurant, transport, other]
 *                       example: "hospital"
 *               microSiteLink:
 *                 type: string
 *                 description: Link to microSite
 *                 example: "https://example.com/microsite"
 *               phone:
 *                 type: string
 *                 description: Owner or property contact phone number
 *                 example: "+911234567890"
 *     responses:
 *       201:
 *         description: Property created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Property created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     property:
 *                       $ref: '#/components/schemas/Property'
 *                     phone:
 *                       type: string
 *                       description: Owner or property contact phone number
 *                       example: "+911234567890"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation failed"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "Title must be between 1 and 100 characters"
 *                       param:
 *                         type: string
 *                         example: "title"
 *                       location:
 *                         type: string
 *                         example: "body"
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin access required
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
router.post('/', protect, authorize('admin'), createPropertyValidation, createProperty);

/**
 * @swagger
 * /api/properties/{id}:
 *   put:
 *     summary: Update a property (Admin or Property Owner only)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *         example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *                 example: "Updated Luxury 2BHK Apartment"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Updated beautiful fully furnished apartment"
 *               type:
 *                 type: string
 *                 enum: [apartment, house, room, studio, villa, penthouse, pg, hostel]
 *                 example: "apartment"
 *               gender:
 *                 type: string
 *                 enum: [male, female, unisex, transgender, other]
 *                 example: "male"
 *               bulkAccommodation:
 *                 type: boolean
 *                 example: false
 *                 default: false
 *                 required: false
 *               bulkAccommodationType:
 *                 type: [string]
 *                 enum: [interns, employees, students, managed_accommodation ]
 *                 example: "interns"
 *                 required: false
 *                 default: []
 *               sharingType:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [single, double, triple, quadruple]
 *                       example: "single"
 *                     price:
 *                       type: number
 *                       minimum: 0
 *                       example: 15000
 *                 example: [{"type": "single", "price": 15000}, {"type": "double", "price": 12000}]
 *                 required: false
 *               youtubeLink:
 *                 type: string
 *                 description: YouTube video link for property tour
 *                 example: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *               location:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                     example: "123 Updated Main Street"
 *                   city:
 *                     type: string
 *                     example: "New York"
 *                   state:
 *                     type: string
 *                     example: "NY"
 *                   zipCode:
 *                     type: string
 *                     example: "10001"
 *                   coordinates:
 *                     type: object
 *                     properties:
 *                       lat:
 *                         type: number
 *                         example: 40.7128
 *                       lng:
 *                         type: number
 *                         example: -74.0060
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [wifi, parking, gym, daily_cleaning, laundry, ac, heating, kitchen, balcony, garden, security, elevator, power_backup, furnished, tv, transportation, microwave, refrigerator]
 *                 example: ["wifi", "parking", "ac", "furnished", "gym"]
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://example.com/updated-image1.jpg", "https://example.com/updated-image2.jpg"]
 *               area:
 *                 type: number
 *                 minimum: 1
 *                 example: 1400
 *               isAvailable:
 *                 type: boolean
 *                 example: true
 *               isFeatured:
 *                 type: boolean
 *                 example: true
 *               rules:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["No smoking", "No pets allowed"]
 *               nearbyPlaces:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "City Mall"
 *                     distance:
 *                       type: string
 *                       example: "1.2 km"
 *                     type:
 *                       type: string
 *                       enum: [hospital, school, mall, restaurant, transport, other]
 *                       example: "mall"
 *               microSiteLink:
 *                type: string
 *                description: Link to microSite
 *                example: "https://example.com/microsite"
 *               phone:
 *                 type: string
 *                 description: Owner or property contact phone number
 *                 example: "+911234567890"
 *     responses:
 *       200:
 *         description: Property updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Property updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     property:
 *                       $ref: '#/components/schemas/Property'
 *                     phone:
 *                       type: string
 *                       description: Owner or property contact phone number
 *                       example: "+911234567890"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation failed"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "Price must be a positive number"
 *                       param:
 *                         type: string
 *                         example: "price"
 *                       location:
 *                         type: string
 *                         example: "body"
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Not authorized to update this property
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Property not found
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
router.put('/:id', protect, authorize('admin'), param('id').isMongoId().withMessage('Invalid property ID'), updatePropertyValidation, updateProperty);

/**
 * @swagger
 * /api/properties/delete-multiple:
 *   delete:
 *     summary: Delete multiple properties by IDs
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               propertyIds:
 *                 type: array
 *                 description: Array of Property IDs to be deleted
 *                 items:
 *                   type: string
 *             required:
 *               - propertyIds
 *             example:
 *               propertyIds: ["64f8c91c937e7a6c6cfe1234", "64f8c91c937e7a6c6cfe5678"]
 *     responses:
 *       200:
 *         description: Successfully deleted properties
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
 *         description: Invalid input
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Properties not found
 *       500:
 *         description: Server error
 */
router.delete('/delete-multiple', protect, deleteMultipleProperties);

/**
 * @swagger
 * /api/properties/{id}:
 *   delete:
 *     summary: Delete a property (Admin or Property Owner only)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *         example: "60f7b3b3b3b3b3b3b3b3b3b3"
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Property deleted successfully"
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Not authorized to delete this property
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Property not found
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
router.delete('/:id', protect, authorize('admin'), param('id').isMongoId().withMessage('Invalid property ID'), deleteProperty);





module.exports = router;