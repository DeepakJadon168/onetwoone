const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");

const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "scooty-rental/vehicles", resource_type: "image" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// @route POST /api/uploads/images (admin only, field name: images, multiple)
const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No image file was found" });
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return res.status(500).json({
        message:
          "Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in the backend .env file.",
      });
    }

    const uploadPromises = req.files.map((file) => streamUpload(file.buffer));
    const results = await Promise.all(uploadPromises);
    const urls = results.map((r) => r.secure_url);

    res.json({ urls });
  } catch (error) {
    res.status(500).json({ message: error.message || "Upload failed" });
  }
};

module.exports = { uploadImages };
