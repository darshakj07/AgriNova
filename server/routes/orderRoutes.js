import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { protectUser } from '../middleware/authMiddleware.js';

const router = express.Router();

const formatPresentDateTime = () => {
  return new Date().toLocaleString('en-US', { 
    month: 'short', 
    day: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// helper to parse numeric quantity from strings like "20 Quintals" or "50 qtl"
const parseQuantity = (qtyStr) => {
  if (typeof qtyStr === 'number') return qtyStr;
  if (!qtyStr) return 0;
  const match = qtyStr.toString().match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
};

// @desc    Create new order(s)
// @route   POST /api/orders
// @access  Private
router.post('/', protectUser, async (req, res) => {
  try {
    const ordersData = Array.isArray(req.body) ? req.body : [req.body];
    const createdOrders = [];

    for (const orderData of ordersData) {
      const { id, date, buyer, product, payment, status } = orderData;

      if (!product || !product.id) {
        return res.status(400).json({ success: false, message: 'Product ID is required' });
      }

      // Lookup product to verify existence, check stock, and get farmerId
      const dbProduct = await Product.findById(product.id);
      if (!dbProduct) {
        return res.status(404).json({ success: false, message: `Product with ID ${product.id} not found` });
      }

      const requestedQty = parseQuantity(product.qty);
      if (dbProduct.quantity < requestedQty) {
        return res.status(400).json({ success: false, message: `Insufficient stock for product ${dbProduct.name}. Available: ${dbProduct.quantity} qtl` });
      }

      // Deduct stock
      dbProduct.quantity -= requestedQty;
      if (dbProduct.quantity <= 0) {
        dbProduct.quantity = 0;
        dbProduct.status = 'Out of Stock';
      } else if (dbProduct.quantity < 10) {
        dbProduct.status = 'Low Stock';
      }
      await dbProduct.save();

      // Retrieve farmer name if not explicitly passed
      let farmerName = orderData.farmer;
      if (!farmerName) {
        const farmerUser = await User.findById(dbProduct.farmerId);
        farmerName = farmerUser ? `${farmerUser.firstName} ${farmerUser.lastName}` : 'AgriNova Farmer';
      }

      const nowStr = formatPresentDateTime();
      
      // Fetch global commission rate
      const Settings = (await import('../models/Settings.js')).default;
      let settings = await Settings.findOne();
      const currentCommissionRate = settings ? settings.commissionRate : 2.0;

      // Create new Order document
      const newOrder = new Order({
        id: id || `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        buyerId: req.user._id,
        farmerId: dbProduct.farmerId,
        productId: dbProduct._id,
        date: nowStr,
        statusTimestamps: {
          placedAt: nowStr
        },
        buyer: {
          name: buyer?.name || req.user.companyName || 'Corporate Buyer',
          manager: buyer?.manager || `${req.user.firstName} ${req.user.lastName}`,
          phone: buyer?.phone || req.user.phone || '+91 99887 76655',
          address: buyer?.address || req.user.city || 'Indore, MP',
        },
        product: {
          id: dbProduct._id.toString(),
          name: product.name || dbProduct.name,
          category: product.category || dbProduct.category,
          qty: product.qty,
          rate: product.rate || `₹${dbProduct.price}/qtl`,
          total: product.total,
        },
        payment: {
          status: payment?.status || 'Held in Escrow',
          method: payment?.method || 'AgriNova Escrow Direct',
          transactionId: payment?.transactionId || `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`,
        },
        farmer: farmerName,
        status: status || 'Pending',
        commissionRate: currentCommissionRate,
      });

      const savedOrder = await newOrder.save();
      createdOrders.push(savedOrder);

      // Trigger socket io broadcast
      const io = req.app.get('socketio');
      if (io) {
        console.log(`[Socket Broadcast] Emitting orderUpdated for orderId=${savedOrder.id} and stockUpdated for productId=${dbProduct._id}`);
        io.emit('orderUpdated', { orderId: savedOrder.id, status: savedOrder.status });
        io.emit('stockUpdated', { productId: dbProduct._id.toString(), newQuantity: dbProduct.quantity });
      }
    }

    res.status(201).json({ success: true, count: createdOrders.length, orders: createdOrders });
  } catch (error) {
    console.error(`[POST /api/orders Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to create order', error: error.message });
  }
});

// @desc    Get orders for logged in user (filtered by role)
// @route   GET /api/orders
// @access  Private
router.get('/', protectUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    const limit = parseInt(req.query.limit) || 0;

    let query = {};
    if (role === 'buyer') {
      query = { buyerId: userId };
    } else if (role === 'farmer') {
      query = { farmerId: userId };
    } else if (role === 'admin') {
      query = {}; // admin can see all
    } else {
      return res.status(403).json({ success: false, message: 'Role not authorized to fetch orders' });
    }

    let q = Order.find(query).sort({ createdAt: -1 });
    if (limit > 0) {
      q = q.limit(limit);
    }

    const orders = await q.exec();
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error(`[GET /api/orders Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
  }
});

// @desc    Get order details by custom string ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protectUser, async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findOne({ id: orderId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify ownership
    if (
      req.user.role !== 'admin' &&
      order.buyerId.toString() !== req.user._id.toString() &&
      order.farmerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Access denied: not your order' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error(`[GET /api/orders/:id Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to fetch order details', error: error.message });
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
router.put('/:id/status', protectUser, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status, paymentStatus } = req.body;

    const order = await Order.findOne({ id: orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const oldStatus = order.status;

    if (status) {
      order.status = status;
      const nowStr = formatPresentDateTime();
      if (!order.statusTimestamps) {
        order.statusTimestamps = { placedAt: order.date || nowStr };
      }
      if (status === 'Accepted') order.statusTimestamps.acceptedAt = nowStr;
      if (status === 'Processing' || status === 'Quality Checking') order.statusTimestamps.processingAt = nowStr;
      if (status === 'Shipped' || status === 'In Transit' || status === 'Ready For Dispatch') order.statusTimestamps.shippedAt = nowStr;
      if (status === 'Delivered' || status === 'Completed') order.statusTimestamps.deliveredAt = nowStr;
      if (status === 'Cancelled' || status === 'Rejected') order.statusTimestamps.cancelledAt = nowStr;
    }
    
    if (paymentStatus) order.payment.status = paymentStatus;

    // Handle cancellation or rejection: return stock
    if ((status === 'Cancelled' || status === 'Rejected') && oldStatus !== 'Cancelled' && oldStatus !== 'Rejected') {
      const dbProduct = await Product.findById(order.productId);
      if (dbProduct) {
        const returnedQty = parseQuantity(order.product.qty);
        dbProduct.quantity += returnedQty;
        dbProduct.status = dbProduct.quantity > 10 ? 'In Stock' : dbProduct.quantity > 0 ? 'Low Stock' : 'Out of Stock';
        await dbProduct.save();

        const io = req.app.get('socketio');
        if (io) {
          io.emit('stockUpdated', { productId: dbProduct._id.toString(), newQuantity: dbProduct.quantity });
        }
      }
    }

    const updatedOrder = await order.save();

    // Trigger socket broadcast
    const io = req.app.get('socketio');
    if (io) {
      console.log(`[Socket Broadcast] Emitting orderUpdated for orderId=${updatedOrder.id} status=${updatedOrder.status}`);
      io.emit('orderUpdated', { orderId: updatedOrder.id, status: updatedOrder.status });
    }

    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error(`[PUT /api/orders/:id/status Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to update order status', error: error.message });
  }
});

export default router;
