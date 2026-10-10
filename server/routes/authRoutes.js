import express from 'express';
import { 
  registerUser, 
  loginUser, 
  googleLogin, 
  sendOTP, 
  verifyOTP, 
  requestPasswordReset, 
  resetPassword, 
  getBuyers, 
  getFarmers,
  updateProfile,
  getProfile,
  blockUser,
  verifyUser,
  updatePassword
} from '../controllers/authController.js';
import { protectUser } from '../middleware/authMiddleware.js';
import { uploadSingleImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/password-reset/request', requestPasswordReset);
router.post('/password-reset', resetPassword);
router.get('/buyers', getBuyers);
router.get('/farmers', getFarmers);
router.get('/profile', protectUser, getProfile);
router.put('/profile', protectUser, (req, res, next) => {
  uploadSingleImage('profilePhoto')(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
}, updateProfile);
router.put('/password', protectUser, updatePassword);
router.put('/users/:id/block', protectUser, blockUser);
router.put('/users/:id/verify', protectUser, verifyUser);

export default router;
