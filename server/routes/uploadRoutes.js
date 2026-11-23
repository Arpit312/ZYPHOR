const router = require("express").Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const auth = require("../middleware/auth");
const fs = require("fs");
const path = require("path");

const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET && 
  !process.env.CLOUDINARY_API_KEY.includes("<your_") && 
  !process.env.CLOUDINARY_API_SECRET.includes("<your_");

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB cap per image
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Only image files are allowed."));
    cb(null, true);
  },
});

router.post("/", auth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // 1. If Cloudinary credentials are valid, upload to Cloudinary
    if (isCloudinaryConfigured) {
      try {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "zyphor/listings",
              resource_type: "auto",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });

        return res.json({
          success: true,
          url: result.secure_url,
          publicId: result.public_id,
        });
      } catch (cloudErr) {
        console.warn("Cloudinary upload failed, falling back to local storage:", cloudErr.message);
      }
    }

    // 2. Local file storage fallback
    const uploadDir = path.join(__dirname, "..", "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const safeName = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadDir, safeName);
    fs.writeFileSync(filePath, req.file.buffer);

    return res.json({
      success: true,
      // Absolute URL — a relative path is unusable from the mobile app.
      url: `${req.protocol}://${req.get("host")}/uploads/${safeName}`,
      source: "local"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Multer-specific errors (file too large, wrong type) land here
router.use((err, req, res, next) => {
  if (err) return res.status(400).json({ error: err.message || "Upload failed." });
  next();
});

module.exports = router;
