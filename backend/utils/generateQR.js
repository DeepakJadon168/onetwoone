const QRCode = require("qrcode");

// The QR encodes a link to the public verify page on the frontend.
// Staff scans it with any phone camera -> opens the verify page -> logs in as admin -> marks check-in.
const buildVerifyUrl = (qrToken) => {
  const base = process.env.FRONTEND_URL || "http://localhost:5173";
  return `${base.replace(/\/$/, "")}/verify/${qrToken}`;
};

const generateQRDataUrl = async (qrToken) => {
  const url = buildVerifyUrl(qrToken);
  const dataUrl = await QRCode.toDataURL(url, { width: 300, margin: 1 });
  return { dataUrl, url };
};

const generateQRBuffer = async (qrToken) => {
  const url = buildVerifyUrl(qrToken);
  const buffer = await QRCode.toBuffer(url, { width: 300, margin: 1 });
  return { buffer, url };
};

module.exports = { generateQRDataUrl, generateQRBuffer, buildVerifyUrl };
