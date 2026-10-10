import User from '../models/User.js';
import Review from '../models/Review.js';
import OTP from '../models/OTP.js';
import { sendVerificationEmail, sendAccountBlockEmail } from '../services/emailServices/emailService.js';
import { OAuth2Client } from 'google-auth-library';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      password, 
      role,
      farmName,
      farmLocation,
      farmAcres,
      primaryCrops,
      companyName,
      businessType,
      city,
      googleId
    } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();

    // Check if email already exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    // Build user fields context
    const userData = {
      firstName,
      lastName,
      email: normalizedEmail,
      phone,
      role
    };
    if (password) userData.password = password;
    if (googleId) userData.googleId = googleId;

    // Populate role-specific fields
    if (role === 'farmer') {
      userData.farmName = farmName;
      userData.farmLocation = farmLocation;
      userData.farmAcres = farmAcres;
      userData.primaryCrops = primaryCrops;
    } else if (role === 'buyer') {
      userData.companyName = companyName;
      userData.businessType = businessType;
      userData.city = city;
    }

    // Create and save user
    const user = new User(userData);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Registration completed successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        farmName: user.farmName,
        farmLocation: user.farmLocation,
        farmAcres: user.farmAcres,
        primaryCrops: user.primaryCrops,
        companyName: user.companyName,
        businessType: user.businessType,
        city: user.city,
        profilePhoto: user.profilePhoto,
        profilePhotoPublicId: user.profilePhotoPublicId
      }
    });

  } catch (error) {
    console.error(`[Register Error] ${error.message}`);
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password' });
    }

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Match password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check block status
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: `Your account has been suspended/blocked. Reason: ${user.blockedReason || 'No details provided.'}`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        farmName: user.farmName,
        farmLocation: user.farmLocation,
        farmAcres: user.farmAcres,
        primaryCrops: user.primaryCrops,
        companyName: user.companyName,
        businessType: user.businessType,
        city: user.city,
        profilePhoto: user.profilePhoto,
        profilePhotoPublicId: user.profilePhotoPublicId
      }
    });

  } catch (error) {
    console.error(`[Login Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res) => {
  try {
    const { credential, access_token } = req.body;
    
    let payload;

    if (credential) {
      // Verify Google token
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } else if (access_token) {
      // Fetch user profile using access_token
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (response.ok) {
        payload = await response.json();
      }
    }
    
    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, message: 'Invalid Google token' });
    }

    const { sub: googleId, email, given_name: firstName, family_name: lastName } = payload;
    const normalizedEmail = email.toLowerCase();

    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      // User exists, check block status
      if (user.isBlocked) {
        return res.status(403).json({
          success: false,
          message: `Your account has been suspended/blocked. Reason: ${user.blockedReason || 'No details provided.'}`
        });
      }

      // Update googleId if not present (linking accounts)
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }

      // Return login success
      return res.status(200).json({
        success: true,
        message: 'Google login successful',
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          farmName: user.farmName,
          farmLocation: user.farmLocation,
          farmAcres: user.farmAcres,
          primaryCrops: user.primaryCrops,
          companyName: user.companyName,
          businessType: user.businessType,
          city: user.city,
          profilePhoto: user.profilePhoto,
          profilePhotoPublicId: user.profilePhotoPublicId
        }
      });
    } else {
      // User does NOT exist. Return special response to prompt profile completion
      return res.status(200).json({
        success: true,
        isNewUser: true,
        message: 'Google account verified. Please complete your profile.',
        tempUser: {
          googleId,
          email: normalizedEmail,
          firstName: firstName || '',
          lastName: lastName || ''
        }
      });
    }
  } catch (error) {
    console.error(`[Google Login Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
};

// @desc    Send OTP via email
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email: normalizedEmail });

    // Save the new OTP in database
    const otpDoc = new OTP({ email: normalizedEmail, otp: otpCode });
    await otpDoc.save();

    let emailSent = false;
    try {
      await sendVerificationEmail(normalizedEmail, otpCode);
      emailSent = true;
    } catch (mailErr) {
      console.warn(`[OTP Send Note] SMTP dispatch failed (${mailErr.message}). Fallback code for ${normalizedEmail}: ${otpCode}`);
    }

    res.status(200).json({
      success: true,
      message: emailSent
        ? 'OTP sent successfully to your email address'
        : `OTP sent! (Notice: If email delivery is delayed, your code is ${otpCode})`,
      otp: otpCode
    });

  } catch (error) {
    console.error(`[OTP Send Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to send OTP email. Please try again.' });
  }
};

// @desc    Verify OTP code
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP code are required' });
    }

    const trimmedOtp = otp.toString().trim();

    // Universal bypass for testing/demos
    if (trimmedOtp === '123456') {
      await OTP.deleteMany({ email: normalizedEmail });
      return res.status(200).json({ success: true, message: 'Email address verified successfully' });
    }

    // Find the latest OTP for this email
    const otpDoc = await OTP.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return res.status(400).json({ success: false, message: 'OTP has expired or is invalid. Please request a new code.' });
    }

    // Check if matches
    if (otpDoc.otp !== trimmedOtp) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP code. Please check and try again.' });
    }

    // Success - delete OTP
    await OTP.deleteMany({ email: normalizedEmail });

    res.status(200).json({ success: true, message: 'Email address verified successfully' });

  } catch (error) {
    console.error(`[OTP Verify Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to verify OTP. Please try again.' });
  }
};

// @desc    Request password reset via email OTP
// @route   POST /api/auth/password-reset/request
// @access  Public
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Invalid email or password.' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.deleteMany({ email: normalizedEmail });
    const otpDoc = new OTP({ email: normalizedEmail, otp: otpCode });
    await otpDoc.save();

    await sendVerificationEmail(normalizedEmail, otpCode, 'password_reset');

    res.status(200).json({ success: true, message: 'OTP sent successfully to your email address' });
  } catch (error) {
    console.error(`[Password Reset Request Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to send OTP email. Please try again.' });
  }
};

// @desc    Reset password after OTP verification
// @route   POST /api/auth/password-reset
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !otp || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const otpDoc = await OTP.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
    if (!otpDoc || otpDoc.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP code. Please try again.' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Invalid email or password.' });
    }

    user.password = password;
    await user.save();
    await OTP.deleteMany({ email: normalizedEmail });

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error(`[Password Reset Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to reset password. Please try again.' });
  }
};

// @desc    Get all registered buyers
// @route   GET /api/auth/buyers
// @access  Public
export const getBuyers = async (req, res) => {
  try {
    const buyers = await User.find({ role: 'buyer' }).select('-password').lean();
    const enhancedBuyers = await Promise.all(buyers.map(async (buyer) => {
      const reviews = await Review.find({ reviewedUserId: buyer._id, reviewedUserRole: 'Buyer' });
      let avgRating = 0;
      if (reviews.length > 0) {
        avgRating = reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length;
      }
      return { ...buyer, rating: Number(avgRating.toFixed(1)), reviewsCount: reviews.length };
    }));
    res.status(200).json({
      success: true,
      buyers: enhancedBuyers
    });
  } catch (error) {
    console.error(`[Get Buyers Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error retrieving buyers' });
  }
};

// @desc    Get all registered farmers
// @route   GET /api/auth/farmers
// @access  Public
export const getFarmers = async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' }).select('-password').lean();
    const enhancedFarmers = await Promise.all(farmers.map(async (farmer) => {
      const reviews = await Review.find({ reviewedUserId: farmer._id, reviewedUserRole: 'Farmer' });
      let avgRating = 0;
      if (reviews.length > 0) {
        avgRating = reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length;
      }
      return { ...farmer, rating: Number(avgRating.toFixed(1)), reviewsCount: reviews.length };
    }));
    res.status(200).json({
      success: true,
      farmers: enhancedFarmers
    });
  } catch (error) {
    console.error(`[Get Farmers Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error retrieving farmers' });
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = req.user;

    const {
      firstName,
      lastName,
      phone,
      farmName,
      farmLocation,
      farmAcres,
      primaryCrops,
      companyName,
      businessType,
      city,
      profilePhoto
    } = req.body;

    // Handle profile photo upload (via Multer file buffer or Base64 string)
    if (req.file && req.file.buffer) {
      if (user.profilePhotoPublicId) {
        await deleteFromCloudinary(user.profilePhotoPublicId).catch(() => {});
      }
      const uploadRes = await uploadToCloudinary(req.file.buffer, { folder: 'agrinova/profiles' });
      user.profilePhoto = uploadRes.secure_url;
      user.profilePhotoPublicId = uploadRes.public_id;
    } else if (profilePhoto !== undefined) {
      if (typeof profilePhoto === 'string' && profilePhoto.startsWith('data:image')) {
        if (user.profilePhotoPublicId) {
          await deleteFromCloudinary(user.profilePhotoPublicId).catch(() => {});
        }
        const uploadRes = await uploadToCloudinary(profilePhoto, { folder: 'agrinova/profiles' });
        user.profilePhoto = uploadRes.secure_url;
        user.profilePhotoPublicId = uploadRes.public_id;
      } else if (profilePhoto === '') {
        if (user.profilePhotoPublicId) {
          await deleteFromCloudinary(user.profilePhotoPublicId).catch(() => {});
        }
        user.profilePhoto = '';
        user.profilePhotoPublicId = '';
      } else if (typeof profilePhoto === 'object' && profilePhoto.secure_url) {
        user.profilePhoto = profilePhoto.secure_url;
        user.profilePhotoPublicId = profilePhoto.public_id || '';
      } else if (typeof profilePhoto === 'string') {
        user.profilePhoto = profilePhoto;
      }
    }

    // Update common fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;

    // Update role-specific fields
    if (user.role === 'farmer') {
      if (farmName !== undefined) user.farmName = farmName;
      if (farmLocation !== undefined) user.farmLocation = farmLocation;
      if (farmAcres !== undefined) user.farmAcres = Number(farmAcres);
      if (primaryCrops !== undefined) user.primaryCrops = primaryCrops;
    } else if (user.role === 'buyer') {
      if (companyName !== undefined) user.companyName = companyName;
      if (businessType !== undefined) user.businessType = businessType;
      if (city !== undefined) user.city = city;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        farmName: user.farmName,
        farmLocation: user.farmLocation,
        farmAcres: user.farmAcres,
        primaryCrops: user.primaryCrops,
        companyName: user.companyName,
        businessType: user.businessType,
        city: user.city,
        verified: user.verified,
        profilePhoto: user.profilePhoto,
        profilePhotoPublicId: user.profilePhotoPublicId
      }
    });
  } catch (error) {
    console.error(`[Update Profile Error] ${error.message}`);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

// @desc    Get current user profile details
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        farmName: user.farmName,
        farmLocation: user.farmLocation,
        farmAcres: user.farmAcres,
        primaryCrops: user.primaryCrops,
        companyName: user.companyName,
        businessType: user.businessType,
        city: user.city,
        verified: user.verified,
        profilePhoto: user.profilePhoto,
        profilePhotoPublicId: user.profilePhotoPublicId
      }
    });
  } catch (error) {
    console.error(`[Get Profile Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error retrieving profile' });
  }
};

// @desc    Block or suspend user account
// @route   PUT /api/auth/users/:id/block
// @access  Private (Admin Only)
export const blockUser = async (req, res) => {
  try {
    // Admin check
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied, only admins can perform this action' });
    }

    const { id } = req.params;
    const { isBlocked, reason } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isBlocked = !!isBlocked;
    user.blockedReason = reason || '';
    await user.save();

    // Send email notification to user
    try {
      await sendAccountBlockEmail(user.email, `${user.firstName} ${user.lastName}`, user.isBlocked, user.blockedReason);
    } catch (emailErr) {
      console.error(`[Block Email Error] ${emailErr.message}`);
    }

    res.status(200).json({
      success: true,
      message: `Account status updated successfully to ${user.isBlocked ? 'blocked' : 'active'}.`,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isBlocked: user.isBlocked,
        blockedReason: user.blockedReason
      }
    });
  } catch (error) {
    console.error(`[Block User Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error updating user block status' });
  }
};

// @desc    Verify user account
// @route   PUT /api/auth/users/:id/verify
// @access  Private (Admin Only)
export const verifyUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied, only admins can verify users' });
    }

    const { id } = req.params;
    const { verified } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.verified = !!verified;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User verification status updated successfully to ${user.verified ? 'verified' : 'unverified'}.`,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        verified: user.verified
      }
    });
  } catch (error) {
    console.error(`[Verify User Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error updating user verification status' });
  }
};

// @desc    Update user password
// @route   PUT /api/auth/password
// @access  Private
export const updatePassword = async (req, res) => {
  try {
    const user = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error(`[Update Password Error] ${error.message}`);
    res.status(500).json({ success: false, message: 'Server error updating password' });
  }
};
