import multer from 'multer';

// Use memory storage so image buffers can be streamed directly to Cloudinary
const storage = multer.memoryStorage();

// Validate image file types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml'
  ];

  if (allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPG, PNG, WEBP, GIF, SVG) are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum per file
  },
  fileFilter,
});

export const uploadSingleImage = (fieldName = 'image') => upload.single(fieldName);
export const uploadMultipleImages = (fieldName = 'images', maxCount = 10) => upload.array(fieldName, maxCount);

export default upload;
