import Product from '../models/Product.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

/**
 * Helper to process product images from Multer files or body images (base64, objects, URLs)
 */
const processProductImages = async (files, bodyImages) => {
  const images = [];

  // 1. Handle Multer uploaded files
  if (files && Array.isArray(files) && files.length > 0) {
    for (const file of files) {
      try {
        const uploadRes = await uploadToCloudinary(file.buffer, { folder: 'agrinova/products' });
        images.push({
          secure_url: uploadRes.secure_url,
          public_id: uploadRes.public_id,
        });
      } catch (err) {
        console.error('[Cloudinary Product File Upload Error]', err.message);
      }
    }
  }

  // 2. Handle images in req.body (e.g. Base64 strings, existing URLs, or {secure_url, public_id} objects)
  if (bodyImages !== undefined && bodyImages !== null) {
    let imagesList = bodyImages;
    if (typeof bodyImages === 'string') {
      try {
        imagesList = JSON.parse(bodyImages);
      } catch {
        imagesList = [bodyImages];
      }
    }
    if (!Array.isArray(imagesList)) {
      imagesList = [imagesList];
    }

    for (const img of imagesList) {
      if (!img) continue;
      if (typeof img === 'string') {
        if (img.startsWith('data:image')) {
          try {
            const uploadRes = await uploadToCloudinary(img, { folder: 'agrinova/products' });
            images.push({
              secure_url: uploadRes.secure_url,
              public_id: uploadRes.public_id,
            });
          } catch (err) {
            console.error('[Cloudinary Base64 Upload Error]', err.message);
          }
        } else if (img.startsWith('http://') || img.startsWith('https://')) {
          images.push({
            secure_url: img,
            public_id: '',
          });
        }
      } else if (typeof img === 'object' && (img.secure_url || img.url)) {
        images.push({
          secure_url: img.secure_url || img.url,
          public_id: img.public_id || '',
        });
      }
    }
  }

  return images;
};

// @desc    Create a new crop listing product
// @route   POST /api/products
// @access  Private (Farmer)
export const createProduct = async (req, res) => {
  try {
    const { name, category, quantity, price, description, images } = req.body;

    if (!name || !category || quantity === undefined || price === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields (Name, Category, Quantity, Price)' });
    }

    const processedImages = await processProductImages(req.files, images);

    const product = new Product({
      farmerId: req.user._id,
      name,
      category,
      quantity: Number(quantity),
      price: Number(price),
      description,
      images: processedImages,
      status: Number(quantity) > 10 ? 'In Stock' : Number(quantity) > 0 ? 'Low Stock' : 'Out of Stock'
    });

    await product.save();

    // Trigger socket io broadcast
    const io = req.app.get('socketio');
    if (io) {
      console.log(`[Socket Broadcast] Emitting productCreated for productId=${product._id}`);
      io.emit('productCreated', { productId: product._id.toString() });
    }

    res.status(201).json({
      success: true,
      message: 'Product listed successfully',
      product
    });
  } catch (error) {
    console.error(`[Create Product Error] ${error.message}`);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error listing product' });
  }
};

// @desc    Get all crop products listed by the logged-in farmer
// @route   GET /api/products/my-products
// @access  Private (Farmer)
export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ farmerId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    console.error(`[Get My Products Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error fetching crop listings' });
  }
};

// @desc    Get crop product details by ID
// @route   GET /api/products/:id
// @access  Private
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmerId', 'firstName lastName farmName farmLocation');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Crop product listing not found' });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error(`[Get Product By ID Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error fetching product details' });
  }
};

// @desc    Update crop listing details
// @route   PUT /api/products/:id
// @access  Private (Farmer)
export const updateProduct = async (req, res) => {
  try {
    const { name, category, quantity, price, description, images, status, verified } = req.body;
    
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Crop product listing not found' });
    }

    // Verify ownership (unless Admin)
    if (product.farmerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this crop listing' });
    }

    // Auto-resolve status based on quantity
    let stockStatus = status;
    if (quantity !== undefined) {
      stockStatus = Number(quantity) > 10 ? 'In Stock' : Number(quantity) > 0 ? 'Low Stock' : 'Out of Stock';
    }

    product.name = name || product.name;
    product.category = category || product.category;
    if (quantity !== undefined) product.quantity = Number(quantity);
    if (price !== undefined) product.price = Number(price);
    if (description !== undefined) product.description = description;
    
    // Process images if uploaded or provided
    if (req.files?.length > 0 || images !== undefined) {
      product.images = await processProductImages(req.files, images);
    }

    product.status = stockStatus || product.status;
    if (verified !== undefined) {
      product.verified = verified;
    }

    await product.save();

    // Trigger socket io broadcast
    const io = req.app.get('socketio');
    if (io) {
      console.log(`[Socket Broadcast] Emitting productUpdated and stockUpdated for productId=${product._id}`);
      io.emit('productUpdated', { productId: product._id.toString() });
      io.emit('stockUpdated', { productId: product._id.toString(), newQuantity: product.quantity });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error(`[Update Product Error] ${error.message}`);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error updating crop listing' });
  }
};

// @desc    Delete crop listing
// @route   DELETE /api/products/:id
// @access  Private (Farmer)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Crop product listing not found' });
    }

    // Verify ownership (unless Admin)
    if (product.farmerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this crop listing' });
    }

    // Clean up images in Cloudinary
    if (product.images && Array.isArray(product.images)) {
      for (const img of product.images) {
        if (img && img.public_id) {
          await deleteFromCloudinary(img.public_id).catch(() => {});
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    // Trigger socket io broadcast
    const io = req.app.get('socketio');
    if (io) {
      console.log(`[Socket Broadcast] Emitting productDeleted for productId=${req.params.id}`);
      io.emit('productDeleted', { productId: req.params.id });
    }

    res.status(200).json({
      success: true,
      message: 'Crop product listing deleted successfully'
    });
  } catch (error) {
    console.error(`[Delete Product Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error deleting crop listing' });
  }
};

// @desc    Get all listed crop products
// @route   GET /api/products
// @access  Private
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('farmerId', 'firstName lastName farmName farmLocation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    console.error(`[Get All Products Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error fetching crop listings' });
  }
};
