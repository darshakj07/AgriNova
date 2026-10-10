import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    phone: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      minlength: [6, 'Password must be at least 6 characters'],
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ['farmer', 'buyer', 'admin'],
        message: 'Role must be farmer, buyer, or admin',
      },
    },
    // Farmer-specific fields
    farmName: {
      type: String,
      required: function () {
        return this.role === 'farmer';
      },
      trim: true,
    },
    farmLocation: {
      type: String,
      required: function () {
        return this.role === 'farmer';
      },
      trim: true,
    },
    farmAcres: {
      type: Number,
      required: function () {
        return this.role === 'farmer';
      },
    },
    primaryCrops: {
      type: String,
      required: function () {
        return this.role === 'farmer';
      },
      trim: true,
    },
    // Buyer-specific fields
    companyName: {
      type: String,
      required: function () {
        return this.role === 'buyer';
      },
      trim: true,
    },
    businessType: {
      type: String,
      required: function () {
        return this.role === 'buyer';
      },
      trim: true,
    },
    city: {
      type: String,
      required: function () {
        return this.role === 'buyer';
      },
      trim: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockedReason: {
      type: String,
      default: '',
    },
    verified: {
      type: Boolean,
      default: false,
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    profilePhotoPublicId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving to DB
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password in DB
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
