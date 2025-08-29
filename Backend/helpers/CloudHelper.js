// const cloudinary = require("../config/cloudinary");
import fs from "fs"

import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "hotel_management", // ✅ Store images in a specific folder
      width: 800, // ✅ Increase width for better resolution
      height: 800, // ✅ Increase height for better resolution
      crop: "fill", // ✅ Ensures the image fills the size without stretching
      gravity: "auto", // ✅ Auto-detects the main subject (face, object, etc.)
      quality: "auto:best", // ✅ Maximizes quality while still optimizing file size
      format: "webp", // ✅ Convert to WebP (better compression with high quality)
    });

    fs.unlinkSync(filePath);

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Error while uploading to cloudinary", error);
    throw new Error("Error while uploading to cloudinary");
  }
};

// module.exports = {
//   uploadToCloudinary,
// };