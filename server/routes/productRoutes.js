import express from 'express';
import { protectUser, protectFarmer } from '../middleware/authMiddleware.js';
import { uploadMultipleImages } from '../middleware/uploadMiddleware.js';
import {
  createProduct,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllProducts
} from '../controllers/productController.js';

const router = express.Router();

// Public read routes for all authenticated users (buyers and farmers)
router.get('/', protectUser, getAllProducts);
router.get('/my-products', protectFarmer, getMyProducts);
router.get('/:id', protectUser, getProductById);

// Farmer only routes (accepts multipart/form-data images or JSON)
router.post('/', protectFarmer, (req, res, next) => {
  uploadMultipleImages('images', 10)(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
}, createProduct);

router.put('/:id', protectFarmer, (req, res, next) => {
  uploadMultipleImages('images', 10)(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
}, updateProduct);

router.delete('/:id', protectFarmer, deleteProduct);

export default router;
