import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    status: {
      type: String,
      required: true,
      enum: ['In Stock', 'Low Stock', 'Out of Stock'],
      default: 'In Stock',
    },
    verified: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
    },
    images: {
      type: [mongoose.Schema.Types.Mixed], // Array of { secure_url, public_id } or legacy string URLs
      default: [],
      get: function (images) {
        if (!Array.isArray(images)) return [];
        return images.map((img) => {
          if (typeof img === 'string') {
            return { secure_url: img, public_id: '', url: img };
          }
          if (img && typeof img === 'object') {
            return {
              secure_url: img.secure_url || img.url || '',
              public_id: img.public_id || '',
              url: img.secure_url || img.url || '',
            };
          }
          return img;
        });
      },
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

productSchema.pre('save', function (next) {
  if (Array.isArray(this.images)) {
    this.images = this.images.map((img) => {
      if (typeof img === 'string') {
        return { secure_url: img, public_id: '' };
      }
      if (img && typeof img === 'object') {
        return {
          secure_url: img.secure_url || img.url || '',
          public_id: img.public_id || '',
        };
      }
      return img;
    });
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;
