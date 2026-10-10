import Message from '../models/Message.js';
import User from '../models/User.js';
import { analyzeMessageInBackground } from '../services/moderationService.js';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

// @desc    Get all chat threads (conversations) for the logged-in user
// @route   GET /api/messages/chats
// @access  Private
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all messages involving the current user
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: 1 });

    // Group messages by participant ID
    const chatsMap = {};

    for (const msg of messages) {
      if (!msg.senderId || !msg.receiverId) continue;
      const isSender = msg.senderId.toString() === userId.toString();
      const participantId = isSender ? msg.receiverId.toString() : msg.senderId.toString();

      if (!chatsMap[participantId]) {
        chatsMap[participantId] = {
          participantId,
          messages: [],
          unreadCount: 0
        };
      }

      chatsMap[participantId].messages.push({
        id: msg._id,
        sender: isSender ? (req.user.role === 'farmer' ? 'farmer' : 'buyer') : (req.user.role === 'farmer' ? 'buyer' : 'farmer'),
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        text: msg.text,
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date(msg.createdAt).toLocaleDateString(),
        createdAt: msg.createdAt,
        status: msg.status,
        cropContext: msg.cropContext
      });

      // Count unread messages (received by current user and not read)
      if (!isSender && msg.status === 'sent') {
        chatsMap[participantId].unreadCount += 1;
      }
    }

    // Fetch details of all unique participants
    const participantIds = Object.keys(chatsMap);
    const participants = await User.find({ _id: { $in: participantIds } }).select('-password');

    const chatThreads = participants.map(participant => {
      const chatData = chatsMap[participant._id.toString()];
      const lastMsg = chatData?.messages ? chatData.messages[chatData.messages.length - 1] : null;

      // Format detail names based on role
      const name = participant.role === 'buyer' 
        ? (participant.companyName || `${participant.firstName || ''} ${participant.lastName || ''}`.trim() || 'Buyer')
        : (`${participant.firstName || ''} ${participant.lastName || ''}`.trim() || participant.farmName || 'Farmer');
      const category = participant.role === 'buyer' 
        ? (participant.businessType || 'Buyer') 
        : (participant.farmName || 'Grower');
      const location = participant.role === 'buyer' 
        ? (participant.city || 'Buyer Location') 
        : (participant.farmLocation || 'Farm Site');

      return {
        id: participant._id,
        name,
        category,
        location,
        cropContext: lastMsg ? lastMsg.cropContext : 'General Negotiation',
        status: 'online', // default online indicator
        unreadCount: chatData ? chatData.unreadCount : 0,
        messages: chatData ? chatData.messages : [],
        lastMessageTime: lastMsg ? lastMsg.time : ''
      };
    });

    // Sort by latest message date/time
    chatThreads.sort((a, b) => {
      const lastMsgA = a.messages && a.messages.length > 0 ? a.messages[a.messages.length - 1] : null;
      const lastMsgB = b.messages && b.messages.length > 0 ? b.messages[b.messages.length - 1] : null;
      if (!lastMsgA && !lastMsgB) return 0;
      if (!lastMsgA) return 1;
      if (!lastMsgB) return -1;
      const timeA = lastMsgA.createdAt ? new Date(lastMsgA.createdAt).getTime() : 0;
      const timeB = lastMsgB.createdAt ? new Date(lastMsgB.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    res.status(200).json({
      success: true,
      chats: chatThreads
    });
  } catch (error) {
    console.error(`[Get User Chats Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error retrieving chat threads' });
  }
};

// @desc    Get full message history with a specific participant
// @route   GET /api/messages/history/:participantId
// @access  Private
export const getConversationHistory = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { participantId } = req.params;

    // Find all messages between current user and participant
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: participantId },
        { senderId: participantId, receiverId: currentUserId }
      ]
    }).sort({ createdAt: 1 });

    // Mark received messages as read
    await Message.updateMany(
      { senderId: participantId, receiverId: currentUserId, status: 'sent' },
      { $set: { status: 'read' } }
    );

    const formattedMessages = messages.map(msg => {
      const isSender = msg.senderId.toString() === currentUserId.toString();
      return {
        id: msg._id,
        sender: isSender ? (req.user.role === 'farmer' ? 'farmer' : 'buyer') : (req.user.role === 'farmer' ? 'buyer' : 'farmer'),
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        text: msg.text,
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date(msg.createdAt).toLocaleDateString(),
        status: msg.status,
        cropContext: msg.cropContext
      };
    });

    res.status(200).json({
      success: true,
      messages: formattedMessages
    });
  } catch (error) {
    console.error(`[Get History Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error retrieving message history' });
  }
};

// @desc    Post a message (standard REST fallback)
// @route   POST /api/messages
// @access  Private
export const postMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId, text, cropContext } = req.body;

    if (!receiverId || !text) {
      return res.status(400).json({ success: false, message: 'Receiver and text are required fields' });
    }

    const message = new Message({
      senderId,
      receiverId,
      text,
      cropContext: cropContext || 'General Negotiation',
      status: 'sent'
    });

    await message.save();
    analyzeMessageInBackground(message._id);

    res.status(201).json({
      success: true,
      message: {
        id: message._id,
        sender: req.user.role === 'farmer' ? 'farmer' : 'buyer',
        senderId: message.senderId,
        receiverId: message.receiverId,
        text: message.text,
        time: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: message.status,
        cropContext: message.cropContext
      }
    });
  } catch (error) {
    console.error(`[Post Message Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error saving message' });
  }
};

// @desc    Generate context-aware chat suggestions
// @route   POST /api/messages/suggestions
// @access  Private
export const getChatSuggestions = async (req, res) => {
  try {
    const { history, context } = req.body;
    const userRole = req.user?.role || 'buyer';

    const defaultSuggestions = userRole === 'buyer'
      ? ["Hi, is this available?", "What is the best price?", "Can we negotiate?", "I need logistics details."]
      : ["Hello, how can I help?", "Yes, it is available.", "What quantity do you need?", "My farm is verified."];

    if (!history || !Array.isArray(history) || history.length === 0) {
      return res.status(200).json({ success: true, suggestions: defaultSuggestions });
    }

    // Keep only the last 10 messages for context to reduce tokens
    const recentHistory = history.slice(-10);

    const systemPrompt = {
      role: 'system',
      content: `You are an AI assistant helping a ${userRole} in an agricultural B2B marketplace negotiate a deal or chat with a ${userRole === 'buyer' ? 'farmer' : 'buyer'}.
The current crop context is: "${context || 'General Negotiation'}".

Based on the recent chat history, provide exactly 4 short, actionable quick replies that the ${userRole} could send next, similar to WhatsApp's predictive text or LinkedIn's smart replies.
Keep them under 8 words each. Do not use quotes inside the string.
Output the response strictly as a JSON array of strings, for example: ["Yes, that works.", "What is the price?", "I can dispatch today.", "No, that is too high."]

IMPORTANT RISK POLICY: If the conversation context involves scams, illegal activities, abuse, severe profanity, or requests to move transactions off-platform to avoid escrow, you MUST return an empty array: []`
    };

    const messages = [
      systemPrompt,
      ...recentHistory.map(msg => ({
        role: msg.sender === userRole ? 'assistant' : 'user',
        content: msg.text || ''
      }))
    ];

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages,
        model: 'openai/gpt-oss-20b',
        temperature: 0.5,
        max_tokens: 500,
        top_p: 1,
        stream: false,
      });

      let replyText = chatCompletion.choices[0]?.message?.content || '[]';
      
      // Attempt to parse the JSON array
      let suggestions = [];
      try {
        const match = replyText.match(/\[[\s\S]*\]/);
        if (match) {
          suggestions = JSON.parse(match[0]);
        } else {
          suggestions = JSON.parse(replyText);
        }
      } catch (e) {
        console.error('[Chat Suggestions Parse Error]', e.message, 'Raw reply:', replyText);
        suggestions = [];
      }

      if (!Array.isArray(suggestions) || suggestions.length === 0) {
        suggestions = userRole === 'buyer'
          ? ["Yes, that works.", "What is the best price?", "Can you share samples?", "When can it be dispatched?"]
          : ["Yes, deal confirmed.", "The price is competitive.", "Quality is premium grade.", "Ready for immediate dispatch."];
      }

      return res.status(200).json({
        success: true,
        suggestions: suggestions.slice(0, 4)
      });
    } catch (aiError) {
      console.warn('[Chat Suggestions AI Warning, using fallback suggestions]', aiError.message);
      const fallbackSuggestions = userRole === 'buyer'
        ? ["Yes, that works.", "What is the best price?", "Can you share samples?", "When can it be dispatched?"]
        : ["Yes, deal confirmed.", "The price is competitive.", "Quality is premium grade.", "Ready for immediate dispatch."];

      return res.status(200).json({
        success: true,
        suggestions: fallbackSuggestions
      });
    }

  } catch (error) {
    console.error('[Chat Suggestions Error]', error.message);
    res.status(200).json({
      success: true,
      suggestions: [
        "Yes, sounds good.",
        "Let's proceed.",
        "Could you clarify?",
        "Thank you."
      ]
    });
  }
};
