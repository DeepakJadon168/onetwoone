const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    type: { type: String, enum: ["Scooty", "Bike", "Car"], required: true },
    imageUrl: { type: String, default: "" }, // cover image (kept for backward compatibility)
    images: { type: [String], default: [] }, // multiple gallery images (Cloudinary URLs)
    pricePerHour: { type: Number, required: true },
    pricePerDay: { type: Number, required: true },
    location: { type: String, required: true, default: "Indore" },
    description: { type: String, default: "" },
    available: { type: Boolean, default: true },
    fuelType: { type: String, enum: ["Petrol", "Diesel", "Electric", "CNG"], default: "Petrol" },
    seats: { type: Number, default: 2 },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    features: { type: [String], default: [] }, // e.g. ["Helmet Included", "Free Delivery"]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
