import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure the uploads folder exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("uploads/")); // Ensure absolute path
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
  
});

// File filter function
const checkFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images"));
  }
};

// Multer middleware
export default multer({
  storage: storage,
  fileFilter: checkFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});
