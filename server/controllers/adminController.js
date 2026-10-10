import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Message from '../models/Message.js';

// @desc    Get aggregated data for admin dashboard
// @route   GET /api/admin/dashboard
// @access  Private (Admin Only)
export const getAdminDashboardData = async (req, res) => {
  try {
    // Admin check
    if (req.user && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied, admin only' });
    }

    const farmers = await User.find({ role: 'farmer' }).select('-password');
    const buyers = await User.find({ role: 'buyer' }).select('-password');
    const products = await Product.find();
    const orders = await Order.find();

    const farmersCount = farmers.length;
    const buyersCount = buyers.length;
    const productsCount = products.length;

    let escrowTotal = 0;
    let escrowTxCount = 0;
    
    // Status breakdown for orders
    const ordersByStatus = {};
    
    orders.forEach(o => {
      if (o.payment && (o.payment.status === 'Held in Escrow' || o.payment.status.includes('Held') || o.payment.status.includes('Locked'))) {
        const numericTotal = parseFloat((o.product?.total || o.amount || '').replace(/[^0-9.]/g, '')) || 0;
        escrowTotal += numericTotal;
        escrowTxCount++;
      }
      
      const status = o.status || 'Pending';
      ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;
    });

    const unverifiedFarmers = farmers.filter(f => !f.verified);
    const unverifiedBuyers = buyers.filter(b => !b.verified);
    
    const recentVerifications = [
      ...unverifiedFarmers.map(f => ({
        id: `REQ-${f._id.toString().slice(-4).toUpperCase()}`,
        name: `${f.firstName} ${f.lastName}`,
        type: 'Farmer Acreage',
        details: `${f.farmAcres || 15} Acres in ${f.farmLocation || 'MH'}`,
        status: 'Pending'
      })),
      ...unverifiedBuyers.map(b => ({
        id: `REQ-${b._id.toString().slice(-4).toUpperCase()}`,
        name: b.companyName || `${b.firstName} ${b.lastName}`,
        type: 'Buyer GSTIN',
        details: `${b.businessType || 'Corporate'} in ${b.city || 'Indore'}`,
        status: 'Pending'
      }))
    ].slice(0, 5);

    // Monthly Analytics
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dataMap = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      dataMap[key] = { month: key, turnoverVal: 0, feesVal: 0, newFarmers: 0, newBuyers: 0 };
    }

    orders.forEach(o => {
      const date = new Date(o.createdAt || o.date);
      const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      if (dataMap[key]) {
        const numericTotal = parseFloat((o.product?.total || o.amount || '').replace(/[^0-9.]/g, '')) || 0;
        dataMap[key].turnoverVal += numericTotal;
        dataMap[key].feesVal += numericTotal * 0.02; // 2% fee
      }
    });

    farmers.forEach(f => {
      const date = new Date(f.createdAt);
      const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      if (dataMap[key]) dataMap[key].newFarmers++;
    });

    buyers.forEach(b => {
      const date = new Date(b.createdAt);
      const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      if (dataMap[key]) dataMap[key].newBuyers++;
    });

    const monthlyAnalytics = Object.values(dataMap).map(d => ({
      ...d,
      turnover: `₹${d.turnoverVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      fees: `₹${d.feesVal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
    }));

    // Category breakdown
    const productsByCategoryRaw = {};
    products.forEach(p => {
      const cat = p.category || 'Other';
      productsByCategoryRaw[cat] = (productsByCategoryRaw[cat] || 0) + 1;
    });
    
    // Default colors for pie chart
    const colors = ['#059669', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];
    const productsByCategory = Object.keys(productsByCategoryRaw).map((cat, idx) => ({
      name: cat,
      value: productsByCategoryRaw[cat],
      color: colors[idx % colors.length]
    }));
    
    // Order Status formatted
    const ordersStatusData = Object.keys(ordersByStatus).map((status, idx) => ({
      name: status,
      value: ordersByStatus[status],
      color: colors[(idx + 2) % colors.length]
    }));

    res.status(200).json({
      success: true,
      stats: {
        farmersCount,
        buyersCount,
        productsCount,
        escrowTotal,
        escrowTxCount
      },
      recentVerifications,
      monthlyAnalytics,
      productsByCategory,
      ordersStatusData
    });
  } catch (error) {
    console.error(`[Admin Dashboard Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error retrieving dashboard data' });
  }
};

export const getMonitoredMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('senderId', 'firstName lastName companyName role')
      .populate('receiverId', 'firstName lastName companyName role')
      .sort({ createdAt: -1 });

    const totalAnalyzed = messages.filter(m => m.analysis && m.analysis.analyzedAt).length;
    const flaggedCount = messages.filter(m => m.moderationStatus === 'Flagged' || m.moderationStatus === 'Under Review').length;
    const highRisk = messages.filter(m => m.analysis && m.analysis.riskLevel === 'High').length;
    const mediumRisk = messages.filter(m => m.analysis && m.analysis.riskLevel === 'Medium').length;
    const lowRisk = messages.filter(m => m.analysis && m.analysis.riskLevel === 'Low').length;
    const resolvedCount = messages.filter(m => m.moderationStatus === 'Resolved').length;

    res.json({
      success: true,
      stats: {
        totalAnalyzed,
        flaggedCount,
        highRisk,
        mediumRisk,
        lowRisk,
        resolvedCount
      },
      messages
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMessageModeration = async (req, res) => {
  try {
    const { status } = req.body;
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

    message.moderationStatus = status;
    await message.save();
    
    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getConversationContext = async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;
    if (!senderId || !receiverId) return res.status(400).json({ success: false, message: 'Missing params' });

    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ createdAt: 1 })
      .populate('senderId', 'firstName lastName companyName role')
      .populate('receiverId', 'firstName lastName companyName role');

    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
