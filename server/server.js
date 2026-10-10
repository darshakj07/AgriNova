import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import seedAdmin from './config/adminSeeder.js';
import authRoutes from './routes/authRoutes.js';
import { analyzeMessageInBackground } from './services/moderationService.js';
import productRoutes from './routes/productRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import Message from './models/Message.js';
import orderRoutes from './routes/orderRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import subscriberRoutes from './routes/subscriberRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// Load Env variables
dotenv.config();

const app = express();

// Middlewares
// CORS configuration supporting development and production deployments
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : [
      clientUrl,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || process.env.NODE_ENV !== 'production' || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Default Base Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to AgriNova API Service',
    version: '1.0.0'
  });
});

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatbotRoutes);
app.use('/api/subscribers', subscriberRoutes);

// Build Native HTTP Server
const server = http.createServer(app);

// Attach Socket.io with CORS enabled
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || process.env.NODE_ENV !== 'production' || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Socket.io CORS blocked: ${origin}`));
    },
    methods: ['GET', 'POST']
  }
});

// Bind socketio instance to app
app.set('socketio', io);

// Socket.io connection logic
io.on('connection', (socket) => {
  // Join a private room for the user ID
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`[Socket] User ${userId} joined room.`);
    }
  });

  // Handle live message sending
  socket.on('sendMessage', async (data) => {
    try {
      const { senderId, receiverId, text, cropContext } = data;
      console.log(`[Socket] sendMessage received: senderId=${senderId}, receiverId=${receiverId}, text="${text}"`);
      if (!senderId || !receiverId || !text) return;

      const message = new Message({
        senderId,
        receiverId,
        text,
        cropContext: cropContext || 'General Negotiation',
        status: 'sent'
      });

      await message.save();
        analyzeMessageInBackground(message._id);

      const timeStr = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Send message to receiver
      console.log(`[Socket] Broadcasting receiveMessage to receiverId=${receiverId}`);
      io.to(receiverId).emit('receiveMessage', {
        id: message._id,
        sender: 'other',
        senderId: message.senderId,
        receiverId: message.receiverId,
        text: message.text,
        time: timeStr,
        status: message.status,
        cropContext: message.cropContext
      });

      // Confirm to sender
      console.log(`[Socket] Broadcasting messageSent confirmation to senderId=${senderId}`);
      io.to(senderId).emit('messageSent', {
        id: message._id,
        sender: 'self',
        senderId: message.senderId,
        receiverId: message.receiverId,
        text: message.text,
        time: timeStr,
        status: message.status,
        cropContext: message.cropContext
      });

    } catch (err) {
      console.error(`[Socket Message Error] ${err.message}`);
    }
  });

  // Handle marking messages as read in real-time
  socket.on('readMessages', async (data) => {
    try {
      const { senderId, receiverId } = data; // senderId is other user, receiverId is self
      console.log(`[Socket] readMessages request received: senderId=${senderId} (originator), receiverId=${receiverId} (reader)`);
      if (!senderId || !receiverId) return;

      // Update in MongoDB
      const res = await Message.updateMany(
        { senderId, receiverId, status: 'sent' },
        { $set: { status: 'read' } }
      );
      console.log(`[Socket] MongoDB updated unread messages from ${senderId} to ${receiverId}: modifiedCount=${res.modifiedCount}`);

      // Emit read confirmation back to the sender
      console.log(`[Socket] Emitting messagesRead to senderId=${senderId} with readerId=${receiverId}`);
      io.to(senderId).emit('messagesRead', { readerId: receiverId });
    } catch (err) {
      console.error(`[Socket Read Error] ${err.message}`);
    }
  });

  // Handle real-time stock updates
  socket.on('stockUpdate', (data) => {
    console.log(`[Socket] stockUpdate broadcast:`, data);
    socket.broadcast.emit('stockUpdated', data);
  });

  // Handle real-time order status updates
  socket.on('orderUpdate', (data) => {
    console.log(`[Socket] orderUpdate broadcast:`, data);
    socket.broadcast.emit('orderUpdated', data);
  });

  // Handle message deletion
  socket.on('deleteMessage', async (data) => {
    try {
      const { messageId, senderId, receiverId } = data;
      console.log(`[Socket] deleteMessage received for msg: ${messageId}`);
      if (!messageId) return;

      await Message.findByIdAndDelete(messageId);

      // Notify both parties that the message was deleted
      io.to(senderId).emit('messageDeleted', { messageId });
      io.to(receiverId).emit('messageDeleted', { messageId });
    } catch (err) {
      console.error(`[Socket Delete Message Error] ${err.message}`);
    }
  });

  socket.on('sendAnnouncement', (data) => {
    console.log(`[Socket] sendAnnouncement broadcast:`, data);
    io.emit('announcementBroadcast', data);
  });

  socket.on('disconnect', () => {
    // Clean disconnect
  });
});

// Connect to Database and start Server
const startServer = () => {
  // Connect to DB (Mongoose handles buffering and retries in the background)
  connectDB();

  // Run Seeders (Mongoose queues queries until connection goes live)
  seedAdmin();

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`[Server] Run-time environment successfully configured.`);
    console.log(`[Server] Live dashboard API listening at http://localhost:${PORT}`);
  });
};

startServer();
