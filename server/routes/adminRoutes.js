import express from 'express';
import { getAdminDashboardData } from '../controllers/adminController.js';
import { protectUser } from '../middleware/authMiddleware.js';

import Settings from '../models/Settings.js';

const router = express.Router();

router.get('/dashboard', protectUser, getAdminDashboardData);

// Get global settings (like commission rate)
router.get('/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ commissionRate: 2.0 });
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update global settings
router.put('/settings', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    if (req.body.commissionRate !== undefined) {
      settings.commissionRate = req.body.commissionRate;
    }
    
    await settings.save();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

import { getMonitoredMessages, updateMessageModeration, getConversationContext } from '../controllers/adminController.js';

router.get('/messages/monitoring', protectUser, getMonitoredMessages);
router.patch('/messages/:id/moderation', protectUser, updateMessageModeration);
router.get('/messages/context', protectUser, getConversationContext);

export default router;
