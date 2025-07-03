const express = require('express');
const { body, param, query } = require('express-validator');
const controller = require('../controllers/userDocumentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const DOCUMENT_TYPES = ['id_proof', 'address_proof', 'income_proof'];
const SUBTYPES = {
    id_proof: ['passport', 'driving_license', 'national_id'],
    address_proof: ['utility_bill', 'bank_statement'],
    income_proof: ['salary_slip', 'bank_statement']
};
const STATUS_TYPES = ['pending', 'approved', 'rejected'];

/**
 * @swagger
 * tags:
 *   name: UserDocuments
 *   description: User document management
 */

/**
 * @swagger
 * /api/user-documents/document:
 *   post:
 *     summary: Upload a new document
 *     tags: [UserDocuments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - subType
 *               - documentUrl
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [id_proof, address_proof, income_proof]
 *               subType:
 *                 type: string
 *               documentUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Document uploaded successfully
 */
router.post(
    '/document',
    protect,
    [
        body('type').isIn(DOCUMENT_TYPES).withMessage('Invalid document type'),
        body('subType').custom((value, { req }) => {
            const type = req.body.type;
            if (!SUBTYPES[type]?.includes(value)) {
                throw new Error(`Invalid subtype for type ${type}`);
            }
            return true;
        }),
        body('documentUrl').isURL().withMessage('Valid documentUrl is required')
    ],
    controller.createDocument
);

/**
 * @swagger
 * /api/user-documents/{id}:
 *   get:
 *     summary: Get a document by ID
 *     tags: [UserDocuments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document found
 */
router.get('/:id', controller.getDocumentById);

/**
 * @swagger
 *  /api/user-documents/:
 *   get:
 *     summary: Get all documents (admin)
 *     tags: [UserDocuments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of documents
 */
router.get('/', protect, controller.getAllDocumentsAdmin);

/**
 * @swagger
 * /api/user-documents/user:
 *   get:
 *     summary: Get all documents for current user
 *     tags: [UserDocuments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user documents
 */
router.get('/user', protect, controller.getUserDocuments);

/**
 * @swagger
 * /api/user-documents/{id}:
 *   patch:
 *     summary: Update a document by ID
 *     tags: [UserDocuments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [id_proof, address_proof, income_proof]
 *               subType:
 *                 type: string
 *               documentUrl:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *               rejectionReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Document updated
 */
router.patch(
    '/:id',
    protect,
    [
        param('id').isMongoId().withMessage('Invalid document ID'),
        body('type').optional().isIn(DOCUMENT_TYPES),
        body('subType').optional().custom((value, { req }) => {
            const type = req.body.type || req.existingDocType;
            if (type && !SUBTYPES[type]?.includes(value)) {
                throw new Error(`Invalid subtype for type ${type}`);
            }
            return true;
        }),
        body('documentUrl').optional().isURL(),
        body('status').optional().isIn(STATUS_TYPES),
        body('rejectionReason').optional().isString()
    ],
    controller.updateDocumentById
);

/**
 * @swagger
 * /api/user-documents/{id}:
 *   delete:
 *     summary: Delete a document by ID
 *     tags: [UserDocuments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted
 */
router.delete('/:id', protect, controller.deleteDocumentById);

module.exports = router;
