const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { put } = require("@vercel/blob");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");

// 1. ใช้ memoryStorage เพื่อเก็บไฟล์ไว้ใน Buffer ชั่วคราว
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      return callback(null, true);
    }
    callback(new Error("Only JPG, PNG, and WebP images are allowed"));
  },
});

const router = express.Router();

router.post("/game-cover", requireAuth, requireAdmin, upload.single("cover"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "A cover image is required" });

    const extension = path.extname(req.file.originalname).toLowerCase();
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

    // ตรวจสอบว่ารันบน Vercel หรือไม่ (โดยดูจาก BLOB_READ_WRITE_TOKEN หรือ VERCEL env)
    if (process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL) {
      // อัปโหลดขึ้น Vercel Blob
      const blob = await put(`game-covers/${filename}`, req.file.buffer, {
        access: "public",
        contentType: req.file.mimetype,
      });
      return res.status(201).json({ imageUrl: blob.url });
    } else {
      // รันแบบ Local Dev: บันทึกลงเครื่อง
      const uploadDirectory = path.join(__dirname, "../../uploads/game-covers");
      fs.mkdirSync(uploadDirectory, { recursive: true });
      const localFilePath = path.join(uploadDirectory, filename);
      
      fs.writeFileSync(localFilePath, req.file.buffer);

      const imageUrl = `${req.protocol}://${req.get("host")}/uploads/game-covers/${filename}`;
      return res.status(201).json({ imageUrl });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: error.message || "Failed to upload file" });
  }
});

module.exports = router;