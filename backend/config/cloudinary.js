import { v2 as cloudinary } from 'cloudinary';

// Reads either a single CLOUDINARY_URL (cloudinary://key:secret@cloud_name)
// or the three separate CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET vars.
// CLOUDINARY_URL, if present, is picked up automatically by the SDK.
if (!process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

export const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_URL ||
  (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
);

export default cloudinary;
