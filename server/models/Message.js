import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Message text content is required'],
      trim: true,
    },
    cropContext: {
      type: String,
      default: 'General Negotiation',
      trim: true,
    },
    status: {
      type: String,
      enum: ['sent', 'read'],
      default: 'sent',
    },
    analysis: {
      riskScore: { type: Number, default: 0 },
      riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
      category: { type: String, default: 'Safe' },
      summary: { type: String, default: '' },
      violations: [{ type: String }],
      suggestedAction: { type: String, default: 'None' },
      analyzedAt: { type: Date }
    },
    moderationStatus: {
      type: String,
      enum: ['Safe', 'Flagged', 'Under Review', 'Resolved', 'Escalated'],
      default: 'Safe'
    }
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
