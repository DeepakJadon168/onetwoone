const nodemailer = require("nodemailer");
const { generateQRBuffer } = require("./generateQR");

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null; // email not configured, skip silently
  }
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
};

// Sends a booking confirmation email with a QR code attached (inline).
const sendBookingConfirmationEmail = async (booking, vehicle, user) => {
  const t = getTransporter();
  if (!t) {
    console.log("[sendEmail] SMTP not configured, skipping email. Set SMTP_HOST/SMTP_USER/SMTP_PASS in .env");
    return { sent: false, reason: "SMTP not configured" };
  }

  const { buffer } = await generateQRBuffer(booking.qrToken);

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
      <div style="background:#0f9d58; padding: 20px; text-align:center; color:#fff;">
        <h2 style="margin:0;">Booking Confirmed 🎉</h2>
        <p style="margin:6px 0 0;">One To One Car &amp; Bike Rental - Indore</p>
      </div>
      <div style="padding: 20px; color:#222;">
        <p>Hi ${user.name},</p>
        <p>Your booking has been confirmed and payment has been received successfully. Please find the details below:</p>
        <table style="width:100%; border-collapse: collapse; margin: 14px 0;">
          <tr><td style="padding:6px 0; color:#666;">Vehicle</td><td style="padding:6px 0; text-align:right;"><b>${vehicle.name} (${vehicle.type})</b></td></tr>
          <tr><td style="padding:6px 0; color:#666;">Pickup Location</td><td style="padding:6px 0; text-align:right;">${vehicle.location}</td></tr>
          <tr><td style="padding:6px 0; color:#666;">Start</td><td style="padding:6px 0; text-align:right;">${new Date(booking.startTime).toLocaleString("en-IN")}</td></tr>
          <tr><td style="padding:6px 0; color:#666;">End</td><td style="padding:6px 0; text-align:right;">${new Date(booking.endTime).toLocaleString("en-IN")}</td></tr>
          <tr><td style="padding:6px 0; color:#666;">Amount Paid</td><td style="padding:6px 0; text-align:right;"><b>₹${booking.totalPrice}</b></td></tr>
          <tr><td style="padding:6px 0; color:#666;">Booking ID</td><td style="padding:6px 0; text-align:right;">${booking._id}</td></tr>
        </table>
        <p>Please show the QR code below at the time of vehicle pickup / verification:</p>
        <div style="text-align:center; margin: 16px 0;">
          <img src="cid:bookingqr" alt="Booking QR" style="width:200px; height:200px;" />
        </div>
        <p style="font-size: 0.85rem; color:#888;">This email was sent automatically by One To One Car & Bike Rental. Need help? Call us directly at +91 92946 89832.</p>
      </div>
    </div>
  `;

  await t.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: user.email,
    subject: `Booking Confirmed - ${vehicle.name} | One To One Rental`,
    html,
    attachments: [
      {
        filename: "booking-qr.png",
        content: buffer,
        cid: "bookingqr",
      },
    ],
  });

  return { sent: true };
};

// Generic ticket-reply notification email (best-effort, optional).
const sendTicketReplyEmail = async (toEmail, subject, message) => {
  const t = getTransporter();
  if (!t) return { sent: false };
  await t.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject: `Re: ${subject} | Support Ticket Update`,
    html: `<p>${message.replace(/\n/g, "<br/>")}</p>`,
  });
  return { sent: true };
};

module.exports = { sendBookingConfirmationEmail, sendTicketReplyEmail };
