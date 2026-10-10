import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary explicitly with credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload an image (buffer, base64 data URI, or URL) to Cloudinary
 * @param {Buffer|string} input - File buffer, base64 string, or image URL
 * @param {Object} options - Upload options (folder, etc.)
 * @returns {Promise<{secure_url: string, public_id: string, url: string}>}
 */
export const uploadToCloudinary = async (input, options = {}) => {
  const defaultOptions = {
    folder: 'agrinova',
    resource_type: 'auto',
    ...options,
  };

  // If input is already an existing Cloudinary URL and not a base64 string, no need to re-upload
  if (typeof input === 'string' && input.includes('res.cloudinary.com')) {
    return {
      secure_url: input,
      url: input,
      public_id: options.public_id || '',
    };
  }

  // Handle Buffer (from Multer memoryStorage)
  if (Buffer.isBuffer(input)) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        defaultOptions,
        (error, result) => {
          if (error) {
            console.error('[Cloudinary Upload Error]', error);
            return reject(error);
          }
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            url: result.url,
          });
        }
      );
      uploadStream.end(input);
    });
  }

  // Handle string (Base64 data URI or external URL)
  if (typeof input === 'string') {
    try {
      const result = await cloudinary.uploader.upload(input, defaultOptions);
      return {
        secure_url: result.secure_url,
        public_id: result.public_id,
        url: result.url,
      };
    } catch (error) {
      console.error('[Cloudinary Upload Error]', error);
      throw error;
    }
  }

  throw new Error('Unsupported image input format. Expected Buffer or String.');
};

/**
 * Delete an image from Cloudinary by public_id
 * @param {string} public_id - The public_id of the image
 * @returns {Promise<Object>}
 */
export const deleteFromCloudinary = async (public_id) => {
  if (!public_id) return null;
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return result;
  } catch (error) {
    console.error(`[Cloudinary Delete Error] Failed to delete ${public_id}:`, error.message);
    return null;
  }
};

export default cloudinary;
