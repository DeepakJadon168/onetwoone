const express = require("express");
const router = express.Router();
const { getWishlist, toggleWishlist } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.get("/wishlist", protect, getWishlist);
router.post("/wishlist/:vehicleId", protect, toggleWishlist);

module.exports = router;