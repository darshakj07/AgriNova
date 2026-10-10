import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userRole: {
      type: String,
      required: true,
      enum: ['buyer', 'farmer', 'admin'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      default: 'Other',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    description: {
      type: String,
      required: [true, 'Description/Message is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved'],
      default: 'Open',
    },
    responses: [
      {
        sender: { type: String, required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
  },
  {
    timestamps: true,
  }
);

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
