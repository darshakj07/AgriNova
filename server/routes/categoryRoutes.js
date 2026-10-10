import express from 'express';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

const router = express.Router();

// Get all categories with listing counts
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    
    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ category: cat.name });
        return {
          id: cat._id,
          name: cat.name,
          description: cat.description,
          rateRange: cat.rateRange,
          listings: count,
        };
      })
    );

    res.json({ success: true, categories: categoriesWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create a new category
router.post('/', async (req, res) => {
  try {
    const { name, description, rateRange } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = await Category.create({ name, description, rateRange });

    res.status(201).json({
      success: true,
      category: {
        id: category._id,
        name: category.name,
        description: category.description,
        rateRange: category.rateRange,
        listings: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
