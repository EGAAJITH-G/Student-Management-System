const cloudinary = require('cloudinary').v2;

// Check if Cloudinary configuration is provided in env
const isConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                    process.env.CLOUDINARY_API_KEY && 
                    process.env.CLOUDINARY_API_SECRET;

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('Cloudinary online service configured successfully.');
} else {
  console.warn('WARNING: Cloudinary credentials missing in .env. Falling back to local data stream handling.');
}

/**
 * Uploads an image (base64 data URI or file path) to Cloudinary
 * @param {string} imageStr - base64 image data string
 * @returns {Promise<string>} - Returns the URL of the uploaded image
 */
const uploadImage = async (imageStr) => {
  if (!imageStr) return '';

  if (isConfigured) {
    try {
      const result = await cloudinary.uploader.upload(imageStr, {
        folder: 'student_management',
        resource_type: 'image'
      });
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload failure:', error.message);
      // Fallback to base64 pass-through in case of upload failure
      return imageStr;
    }
  }

  // Fallback: If not configured, pass-through base64 string as virtual hosted asset
  return imageStr;
};

module.exports = {
  cloudinary,
  uploadImage,
  isConfigured
};
