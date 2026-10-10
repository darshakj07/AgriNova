import express from 'express';
import { protectUser } from '../middleware/authMiddleware.js';
import {
  getUserChats,
  getConversationHistory,
  postMessage,
  getChatSuggestions
} from '../controllers/messageController.js';

const router = express.Router();

// Apply general auth check for all messaging operations
router.use(protectUser);

router.get('/chats', getUserChats);
router.get('/history/:participantId', getConversationHistory);
router.post('/', postMessage);
router.post('/suggestions', getChatSuggestions);

export default router;
