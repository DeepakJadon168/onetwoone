const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// CORS: kept permissive on purpose. This API is public (no cookies — the
// frontend sends the JWT in an Authorization header), so restricting origin
// only adds a common source of "works locally, breaks in production" bugs
// without any real security benefit here.
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("One To One Car & Bike Rental - API is running");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/vehicles", require("./routes/vehicleRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/coupons", require("./routes/couponRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/uploads", require("./routes/uploadRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/tickets", require("./routes/ticketRoutes"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Only start a standalone listener when this file is run directly
// (local dev with `node server.js` / `npm run dev`, or a host like Render/Railway).
// On Vercel this file is imported as a serverless function handler instead,
// so app.listen() must NOT run there.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;