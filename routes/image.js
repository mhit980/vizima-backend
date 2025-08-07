const express = require('express');
const router = express.Router();
const {
    deleteImage,
    deleteMultipleImages,
} = require('../controllers/imageController');

/**
 * @swagger
 * tags:
 *   name: Images
 *   description: Cloudinary image management
 */

/**
 * @swagger
 * /api/images/{publicId}:
 *   delete:
 *     summary: Delete a single image by public ID
 *     tags: [Images]
 *     parameters:
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Public ID of the image on Cloudinary
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *       500:
 *         description: Error deleting image
 */
router.delete('/:publicId', deleteImage);

/**
 * @swagger
 * /api/images:
 *   delete:
 *     summary: Delete multiple images by public IDs
 *     tags: [Images]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               publicIds:
 *                 type: array
 *                 description: Array of Cloudinary public IDs
 *                 items:
 *                   type: string
 *             required:
 *               - publicIds
 *             example:
 *               publicIds: ["image1_public_id", "image2_public_id"]
 *     responses:
 *       200:
 *         description: Images deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 result:
 *                   type: object
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Error deleting images
 */
router.delete('/', deleteMultipleImages);

module.exports = router;
