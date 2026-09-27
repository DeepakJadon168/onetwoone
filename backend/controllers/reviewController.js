const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");

const recalcVehicleRating = async (vehicleId) => {
  const reviews = await Review.find({ vehicle: vehicleId });
  const numReviews = reviews.length;
  const avgRating = numReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews : 4.5;
  await Vehicle.findByIdAndUpdate(vehicleId, {
    rating: Math.round(avgRating * 10) / 10,
    numReviews,
  });
};

const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "This booking does not belong to you" });
    }
    if (booking.status !== "completed") {
      return res.status(400).json({ message: "You can only leave a review for a completed booking" });
    }

    const alreadyReviewed = await Review.findOne({ booking: bookingId });
    if (alreadyReviewed) {
      return res.status(400).json({ message: "You have already reviewed this booking" });
    }

    const review = await Review.create({
      user: req.user._id,
      vehicle: booking.vehicle,
      booking: bookingId,
      rating,
      comment,
    });

    await recalcVehicleRating(booking.vehicle);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVehicleReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ vehicle: req.params.vehicleId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getVehicleReviews };