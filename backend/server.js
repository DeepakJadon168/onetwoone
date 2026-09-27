const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Allowed frontend origins
const allowedOrigins = [
  "https://onetwoonerental.onrender.com", // naya Render frontend URL
  "https://onetoonerental.vercel.app",     // purana Vercel URL (rakhna ho to)
  "http://localhost:3000",
  "http://localhost:5173", // Vite local dev
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
  })
);

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

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;