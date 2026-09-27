// Builds a "click to chat" wa.me link - works with zero setup / zero cost.
// This is what gets shown to the customer as a "Send booking to WhatsApp" button.
const buildWhatsAppLink = (phone, message) => {
  const cleanPhone = (phone || "").replace(/[^\d]/g, "");
  const withCountryCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
};

const buildBookingWhatsAppMessage = (booking, vehicle) => {
  return (
    `✅ Booking Confirmed - One To One Rental\n` +
    `Vehicle: ${vehicle.name} (${vehicle.type})\n` +
    `Pickup: ${vehicle.location}\n` +
    `Start: ${new Date(booking.startTime).toLocaleString("en-IN")}\n` +
    `End: ${new Date(booking.endTime).toLocaleString("en-IN")}\n` +
    `Amount Paid: ₹${booking.totalPrice}\n` +
    `Booking ID: ${booking._id}`
  );
};

// OPTIONAL: automatic server-side WhatsApp send via Twilio WhatsApp API.
// Only runs if TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_WHATSAPP_FROM are set in .env
// and the `twilio` npm package is installed. Safe no-op otherwise.
const trySendWhatsAppAuto = async (toPhone, message) => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_WHATSAPP_FROM) {
    return { sent: false, reason: "Twilio not configured" };
  }
  try {
    // require is inside try so the app doesn't crash if 'twilio' package isn't installed
    const twilio = require("twilio");
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const cleanPhone = (toPhone || "").replace(/[^\d]/g, "");
    const withCountryCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:+${withCountryCode}`,
      body: message,
    });
    return { sent: true };
  } catch (error) {
    console.log("[whatsapp] Twilio auto-send failed:", error.message);
    return { sent: false, reason: error.message };
  }
};

module.exports = { buildWhatsAppLink, buildBookingWhatsAppMessage, trySendWhatsAppAuto };
