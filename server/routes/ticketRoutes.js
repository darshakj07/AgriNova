import express from 'express';
import Ticket from '../models/Ticket.js';
import { protectUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Raise a support ticket
// @route   POST /api/tickets
// @access  Private
router.post('/', protectUser, async (req, res) => {
  try {
    const { subject, category, priority, description } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ success: false, message: 'Subject and description are required' });
    }

    const randomId = `TIC-${Math.floor(10000 + Math.random() * 90000)}`;

    const newTicket = new Ticket({
      id: randomId,
      userId: req.user._id,
      userRole: req.user.role,
      subject,
      category: category || 'Other',
      priority: priority || 'Medium',
      description,
      status: 'Open'
    });

    const savedTicket = await newTicket.save();
    res.status(201).json({ success: true, ticket: savedTicket });
  } catch (error) {
    console.error(`[POST /api/tickets Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to raise support ticket', error: error.message });
  }
});

// @desc    Get support tickets for logged in user (all for admin)
// @route   GET /api/tickets
// @access  Private
router.get('/', protectUser, async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query = { userId: req.user._id };
    }
    const tickets = await Ticket.find(query)
      .populate('userId', 'firstName lastName email role companyName farmName')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: tickets.length, tickets });
  } catch (error) {
    console.error(`[GET /api/tickets Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to fetch support tickets', error: error.message });
  }
});

// @desc    Add reply and update ticket status
// @route   PUT /api/tickets/:id/reply
// @access  Private
router.put('/:id/reply', protectUser, async (req, res) => {
  try {
    const { text, status } = req.body;
    const ticket = await Ticket.findOne({ id: req.params.id });
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (text) {
      ticket.responses.push({
        sender: req.user.role === 'admin' ? 'Admin' : `${req.user.firstName} ${req.user.lastName}`,
        text,
        createdAt: new Date()
      });
    }

    if (status) {
      ticket.status = status;
    }

    await ticket.save();
    res.json({ success: true, ticket });
  } catch (error) {
    console.error(`[PUT /api/tickets/:id/reply Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to update/reply to ticket', error: error.message });
  }
});

export default router;
