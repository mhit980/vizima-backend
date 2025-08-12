const express = require('express');
const router = express.Router();
const {
    // deleteImage,
    deleteMultipleImages,
    deleteImageFromUrl,
} = require('../controllers/imageController');

/**
 * @swagger
 * tags:
 *   name: Images
 *   description: Cloudinary image management
 */

/**
 * @swagger
 * /api/images:
 *   delete:
 *     summary: Delete a single image from Cloudinary by URL
 *     tags: [Images]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 example: "https://res.cloudinary.com/demo/image/upload/v1754543796/folder/myimage.jpg"
 *                 description: The full Cloudinary image URL
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
 *       400:
 *         description: Invalid Cloudinary URL
 *       500:
 *         description: Error deleting image
 */
router.delete('/', deleteImageFromUrl);

/**
 * @swagger
 * /api/images/delete-multiple:
 *   delete:
 *     summary: Delete multiple images from Cloudinary by URLs
 *     tags: [Images]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - urls
 *             properties:
 *               urls:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - "https://res.cloudinary.com/demo/image/upload/v1698765432/folder/image1.jpg"
 *                   - "https://res.cloudinary.com/demo/image/upload/v1698765432/image2.jpg"
 *     responses:
 *       200:
 *         description: Images deleted successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Failed to delete images
 */
router.delete('/delete-multiple', deleteMultipleImages);

module.exports = router;
