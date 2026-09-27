const express = require("express");
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  cancelBooking,
  getBookingByToken,
  verifyBookingToken,
  getBookingQR,
} = require("../controllers/bookingController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.get("/", protect, adminOnly, getAllBookings);
router.put("/:id/status", protect, adminOnly, updateBookingStatus);
router.put("/:id/cancel", protect, cancelBooking);

// QR check-in verification
router.get("/verify/:token", getBookingByToken); // public - scan landing page
router.post("/verify/:token", protect, adminOnly, verifyBookingToken); // admin marks check-in
router.get("/:id/qr", protect, getBookingQR); // re-fetch QR anytime

module.exports = router;