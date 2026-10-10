import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewerRole: {
      type: String,
      enum: ['Farmer', 'Buyer'],
      required: true,
    },
    reviewedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewedUserRole: {
      type: String,
      enum: ['Farmer', 'Buyer'],
      required: true,
    },
    orderId: {
      type: String, // Storing as String since orders use "ORD-XXXX" format
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
    },
    review: {
      type: String,
      required: true,
    },
    // Buyer -> Farmer specific
    productQuality: {
      type: Number,
      min: 1,
      max: 5,
    },
    deliveryExperience: {
      type: Number,
      min: 1,
      max: 5,
    },
    // Farmer -> Buyer specific
    paymentReliability: {
      type: Number,
      min: 1,
      max: 5,
    },
    professionalism: {
      type: Number,
      min: 1,
      max: 5,
    },
    // Shared specific
    communication: {
      type: Number,
      min: 1,
      max: 5,
    },
    status: {
      type: String,
      enum: ['Approved', 'Flagged', 'Hidden'],
      default: 'Approved',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews from the same user for the same order
reviewSchema.index({ reviewerId: 1, orderId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
