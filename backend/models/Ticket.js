const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: { type: String, enum: ["user", "admin"], required: true },
    senderName: { type: String, default: "" },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const ticketSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
    subject: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Booking Issue", "Payment Issue", "Vehicle Issue", "General", "Other"],
      default: "General",
    },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["open", "in-progress", "resolved", "closed"], default: "open" },
    messages: [messageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
