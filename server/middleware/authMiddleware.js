import mongoose from 'mongoose';
import User from '../models/User.js';

// Authenticates any logged in user (farmer, buyer, admin)
export const protectUser = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] || req.headers['authorization']?.split(' ')[1];

    if (!userId || userId === 'undefined' || userId === 'null' || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ success: false, message: 'Not authorized, please sign in' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user profile not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(`[Auth User Middleware Error] ${error.message}`);
    res.status(401).json({ success: false, message: 'Authentication error' });
  }
};

// Authenticates farmer or admin only
export const protectFarmer = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'] || req.headers['authorization']?.split(' ')[1];

    if (!userId || userId === 'undefined' || userId === 'null' || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ success: false, message: 'Not authorized, please sign in' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user profile not found' });
    }

    if (user.role !== 'farmer' && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied, only farmers or admins can perform this action' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(`[Auth Farmer Middleware Error] ${error.message}`);
    res.status(401).json({ success: false, message: 'Authentication error' });
  }
};
