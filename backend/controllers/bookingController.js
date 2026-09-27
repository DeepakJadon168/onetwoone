const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const Coupon = require("../models/Coupon");
const { generateQRDataUrl } = require("../utils/generateQR");

const createBooking = async (req, res) => {
  try {
    const { vehicleId, startTime, endTime, customerNote, couponCode } = req.body;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    if (!vehicle.available) {
      return res.status(400).json({ message: "This vehicle is currently not available" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) {
      return res.status(400).json({ message: "End time must be after the start time" });
    }

    const hours = Math.ceil((end - start) / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    let totalPrice = days * vehicle.pricePerDay + remHours * vehicle.pricePerHour;

    let discountAmount = 0;
    let appliedCode = "";
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
      if (!coupon) return res.status(400).json({ message: "Invalid coupon code" });
      if (coupon.expiresAt && new Date() > coupon.expiresAt) {
        return res.status(400).json({ message: "This coupon has expired" });
      }
      if (totalPrice < coupon.minAmount) {
        return res.status(400).json({ message: `A minimum booking amount of ₹${coupon.minAmount} is required for this coupon` });
      }
      discountAmount = Math.round((totalPrice * coupon.discountPercent) / 100);
      appliedCode = coupon.code;
      totalPrice -= discountAmount;
    }

    const booking = await Booking.create({
      user: req.user._id,
      vehicle: vehicleId,
      startTime: start,
      endTime: end,
      totalPrice,
      customerNote,
      couponCode: appliedCode,
      discountAmount,
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("vehicle", "name brand type imageUrl pricePerHour pricePerDay location")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("vehicle", "name brand type location")
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = status;
    await booking.save();

    if (status === "confirmed") {
      await Vehicle.findByIdAndUpdate(booking.vehicle, { available: false });
    } else if (status === "completed" || status === "cancelled") {
      await Vehicle.findByIdAndUpdate(booking.vehicle, { available: true });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "This booking does not belong to you" });
    }
    if (!["pending", "confirmed"].includes(booking.status)) {
      return res.status(400).json({ message: "This booking can no longer be cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();
    await Vehicle.findByIdAndUpdate(booking.vehicle, { available: true });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/bookings/verify/:token  (public - shown after scanning the QR)
// Returns limited, non-sensitive info so staff can confirm identity before check-in.
const getBookingByToken = async (req, res) => {
  try {
    const booking = await Booking.findOne({ qrToken: req.params.token })
      .populate("vehicle", "name type location")
      .populate("user", "name phone");
    if (!booking) return res.status(404).json({ message: "Invalid QR code or booking not found" });

    res.json({
      bookingId: booking._id,
      vehicleName: booking.vehicle?.name,
      vehicleType: booking.vehicle?.type,
      location: booking.vehicle?.location,
      customerName: booking.user?.name,
      customerPhone: booking.user?.phone,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      verified: booking.verified,
      verifiedAt: booking.verifiedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/bookings/verify/:token  (admin only - marks check-in done)
const verifyBookingToken = async (req, res) => {
  try {
    const booking = await Booking.findOne({ qrToken: req.params.token });
    if (!booking) return res.status(404).json({ message: "Invalid QR code or booking not found" });
    if (booking.paymentStatus !== "paid") {
      return res.status(400).json({ message: "Payment is not completed yet, check-in is not possible" });
    }
    if (booking.verified) {
      return res.status(400).json({ message: "This booking has already been verified", verifiedAt: booking.verifiedAt });
    }

    booking.verified = true;
    booking.verifiedAt = new Date();
    await booking.save();

    res.json({ message: "✅ Booking verified! You can hand over the vehicle.", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/bookings/:id/qr (owner only) - fetch QR again anytime from My Bookings
const getBookingQR = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "This booking does not belong to you" });
    }
    if (!booking.qrToken) return res.status(400).json({ message: "QR code has not been generated yet. Please complete the payment first." });

    const { dataUrl } = await generateQRDataUrl(booking.qrToken);
    res.json({ qrCodeDataUrl: dataUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  cancelBooking,
  getBookingByToken,
  verifyBookingToken,
  getBookingQR,
};