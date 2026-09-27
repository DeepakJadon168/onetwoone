const crypto = require("crypto");
const Razorpay = require("razorpay");
const { v4: uuidv4 } = require("uuid");
const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const { generateQRDataUrl } = require("../utils/generateQR");
const { sendBookingConfirmationEmail } = require("../utils/sendEmail");
const { buildWhatsAppLink, buildBookingWhatsAppMessage, trySendWhatsAppAuto } = require("../utils/whatsapp");

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @route POST /api/payments/create-order   body: { bookingId }
const createOrder = async (req, res) => {
  try {
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return res.status(500).json({
        message: "Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the backend .env file.",
      });
    }

    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "This booking does not belong to you" });
    }
    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ message: "This booking has already been paid" });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(booking.totalPrice * 100), // paise
      currency: "INR",
      receipt: `booking_${booking._id}`,
      notes: { bookingId: booking._id.toString() },
    });

    booking.razorpayOrderId = order.id;
    await booking.save();

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      bookingId: booking._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Could not create the order" });
  }
};

// @route POST /api/payments/verify
// body: { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
const verifyPayment = async (req, res) => {
  try {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const booking = await Booking.findById(bookingId).populate("vehicle").populate("user", "name email phone");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "This booking does not belong to you" });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      booking.paymentStatus = "failed";
      await booking.save();
      return res.status(400).json({ message: "Payment verification failed. Signature mismatch." });
    }

    booking.paymentStatus = "paid";
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;
    if (booking.status === "pending") booking.status = "confirmed";
    if (!booking.qrToken) booking.qrToken = uuidv4();
    await booking.save();

    await Vehicle.findByIdAndUpdate(booking.vehicle._id, { available: false });

    const { dataUrl: qrCodeDataUrl } = await generateQRDataUrl(booking.qrToken);

    // Fire-and-forget notifications so a slow SMTP/Twilio call never blocks the response
    sendBookingConfirmationEmail(booking, booking.vehicle, booking.user)
      .then((r) => {
        if (r.sent) {
          Booking.findByIdAndUpdate(booking._id, { emailSent: true }).catch(() => {});
        }
      })
      .catch((e) => console.log("[email] failed:", e.message));

    const waMessage = buildBookingWhatsAppMessage(booking, booking.vehicle);
    trySendWhatsAppAuto(booking.user.phone, waMessage).catch(() => {});
    const whatsappLink = buildWhatsAppLink(booking.user.phone, waMessage);

    res.json({
      message: "Payment verified successfully — your booking is confirmed!",
      booking,
      qrCodeDataUrl,
      whatsappLink,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Verification failed" });
  }
};

module.exports = { createOrder, verifyPayment };
