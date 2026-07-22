const router = require("express").Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const auth = require("../middleware/auth");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "zyphor/listings",
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
        res.json({
          success: true,
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    stream.end(req.file.buffer);
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
