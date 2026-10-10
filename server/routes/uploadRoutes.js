import express from 'express';
import { uploadSingleImage, uploadMultipleImages } from '../middleware/uploadMiddleware.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { protectUser } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @desc    Upload single image to Cloudinary
 * @route   POST /api/upload
 * @access  Private
 */
router.post('/', protectUser, (req, res, next) => {
  uploadSingleImage('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    let imageInput = null;

    if (req.file && req.file.buffer) {
      imageInput = req.file.buffer;
    } else if (req.body.image) {
      imageInput = req.body.image;
    }

    if (!imageInput) {
      return res.status(400).json({
        success: false,
        message: 'No image file or base64 data provided',
      });
    }

    const folder = req.body.folder || 'agrinova/uploads';
    const result = await uploadToCloudinary(imageInput, { folder });

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully to Cloudinary',
      secure_url: result.secure_url,
      public_id: result.public_id,
      url: result.url,
    });
  } catch (error) {
    console.error('[Upload Single Error]', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image to Cloudinary: ' + error.message,
    });
  }
});

/**
 * @desc    Upload multiple images to Cloudinary
 * @route   POST /api/upload/multiple
 * @access  Private
 */
router.post('/multiple', protectUser, (req, res, next) => {
  uploadMultipleImages('images', 10)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const uploadedImages = [];
    const folder = req.body.folder || 'agrinova/products';

    // From Multer files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, { folder });
        uploadedImages.push({
          secure_url: result.secure_url,
          public_id: result.public_id,
          url: result.url,
        });
      }
    } else if (req.body.images && Array.isArray(req.body.images)) {
      // From base64 array in req.body
      for (const img of req.body.images) {
        if (typeof img === 'string') {
          const result = await uploadToCloudinary(img, { folder });
          uploadedImages.push({
            secure_url: result.secure_url,
            public_id: result.public_id,
            url: result.url,
          });
        } else if (img && typeof img === 'object' && img.secure_url) {
          uploadedImages.push(img);
        }
      }
    }

    if (uploadedImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided for upload',
      });
    }

    res.status(200).json({
      success: true,
      message: `${uploadedImages.length} images uploaded successfully`,
      images: uploadedImages,
    });
  } catch (error) {
    console.error('[Upload Multiple Error]', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images: ' + error.message,
    });
  }
});

export default router;
