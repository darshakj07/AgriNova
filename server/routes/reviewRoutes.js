import express from 'express';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import { protectUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
router.post('/', protectUser, async (req, res) => {
  try {
    const {
      orderId,
      rating,
      title,
      review,
      productQuality,
      deliveryExperience,
      paymentReliability,
      professionalism,
      communication,
    } = req.body;

    const reviewerId = req.user._id;

    // Verify order exists
    const order = await Order.findOne({ id: orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify order status
    if (order.status !== 'Delivered' && order.status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Order must be Completed or Delivered to leave a review' });
    }

    // Determine roles
    let reviewerRole, reviewedUserId, reviewedUserRole;

    if (order.buyerId.toString() === reviewerId.toString()) {
      reviewerRole = 'Buyer';
      reviewedUserId = order.farmerId;
      reviewedUserRole = 'Farmer';
    } else if (order.farmerId.toString() === reviewerId.toString()) {
      reviewerRole = 'Farmer';
      reviewedUserId = order.buyerId;
      reviewedUserRole = 'Buyer';
    } else {
      return res.status(403).json({ success: false, message: 'User is not a participant in this order' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ reviewerId, orderId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this order' });
    }

    // Create review
    const newReview = new Review({
      reviewerId,
      reviewerRole,
      reviewedUserId,
      reviewedUserRole,
      orderId,
      rating,
      title,
      review,
      productQuality,
      deliveryExperience,
      paymentReliability,
      professionalism,
      communication,
    });

    const savedReview = await newReview.save();
    res.status(201).json({ success: true, review: savedReview });
  } catch (error) {
    console.error('Error creating review:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Review already exists for this order by this user' });
    }
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

// @desc    Get reviews for a specific user
// @route   GET /api/reviews/user/:userId
// @access  Public/Private
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewedUserId: req.params.userId, status: 'Approved' })
      .populate('reviewerId', 'firstName lastName companyName')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const totalReviews = reviews.length;
    const avgRating = totalReviews > 0 ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1) : 0;

    res.json({ success: true, reviews, totalReviews, avgRating });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Get review for a specific order by current user
// @route   GET /api/reviews/order/:orderId
// @access  Private
router.get('/order/:orderId', protectUser, async (req, res) => {
  try {
    const review = await Review.findOne({ orderId: req.params.orderId, reviewerId: req.user._id });
    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Private
router.get('/', protectUser, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('reviewerId', 'firstName lastName companyName role')
      .populate('reviewedUserId', 'firstName lastName companyName role')
      .sort({ createdAt: -1 });
    
    // Admin needs all data formatted nicely
    const formatted = reviews.map(r => {
      const reviewerName = r.reviewerRole === 'Buyer' 
        ? (r.reviewerId?.companyName || `${r.reviewerId?.firstName} ${r.reviewerId?.lastName}`) 
        : `${r.reviewerId?.firstName} ${r.reviewerId?.lastName}`;
      const targetName = r.reviewedUserRole === 'Buyer'
        ? (r.reviewedUserId?.companyName || `${r.reviewedUserId?.firstName} ${r.reviewedUserId?.lastName}`)
        : `${r.reviewedUserId?.firstName} ${r.reviewedUserId?.lastName}`;

      return {
        id: r._id,
        author: `${reviewerName || 'Unknown'} (${r.reviewerRole})`,
        target: `${targetName || 'Unknown'} (${r.reviewedUserRole})`,
        rating: r.rating,
        comment: r.review,
        status: r.status,
        date: r.createdAt.toISOString().split('T')[0]
      };
    });

    res.json({ success: true, reviews: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Update review status (Admin)
// @route   PUT /api/reviews/:id/status
// @access  Private
router.put('/:id/status', protectUser, async (req, res) => {
  try {
    const { status } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    review.status = status;
    await review.save();
    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Delete review (Admin)
// @route   DELETE /api/reviews/:id
// @access  Private
router.delete('/:id', protectUser, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    await review.deleteOne();
    res.json({ success: true, message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

export default router;
