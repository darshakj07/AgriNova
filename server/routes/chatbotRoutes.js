import express from 'express';
import { processChat } from '../controllers/chatbotController.js';

const router = express.Router();

// @desc    Process a chat message with Groq AI
// @route   POST /api/chat
// @access  Public
router.post('/', processChat);

export default router;
