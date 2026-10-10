import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    statusTimestamps: {
      placedAt: { type: String },
      acceptedAt: { type: String },
      processingAt: { type: String },
      shippedAt: { type: String },
      deliveredAt: { type: String },
      cancelledAt: { type: String },
    },
    buyer: {
      name: { type: String, required: true },
      manager: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    product: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      category: { type: String, required: true },
      qty: { type: String, required: true },
      rate: { type: String, required: true },
      total: { type: String, required: true },
    },
    payment: {
      status: { type: String, required: true },
      method: { type: String, required: true },
      transactionId: { type: String, required: true },
    },
    farmer: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        'Pending',
        'Quality Checking',
        'Processing',
        'In Transit',
        'Shipped',
        'Ready For Dispatch',
        'Delivered',
        'Completed',
        'Cancelled',
        'Rejected',
        'Accepted'
      ],
      default: 'Pending',
    },
    commissionRate: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
