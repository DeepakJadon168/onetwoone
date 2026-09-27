const express = require("express");
const router = express.Router();
const { getCoupons, createCoupon, deleteCoupon, validateCoupon } = require("../controllers/couponController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", protect, adminOnly, getCoupons);
router.post("/", protect, adminOnly, createCoupon);
router.delete("/:id", protect, adminOnly, deleteCoupon);
router.post("/validate", protect, validateCoupon);

module.exports = router;