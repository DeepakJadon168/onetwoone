const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const User = require("../models/User");

const getDashboardStats = async (req, res) => {
  try {
    const totalVehicles = await Vehicle.countDocuments();
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalBookings = await Booking.countDocuments();

    const revenueAgg = await Booking.aggregate([
      { $match: { status: { $in: ["confirmed", "completed"] } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    const statusCounts = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const bookingsByStatus = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    statusCounts.forEach((s) => { bookingsByStatus[s._id] = s.count; });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const bookingsThisMonth = await Booking.countDocuments({ createdAt: { $gte: startOfMonth } });

    const topVehiclesAgg = await Booking.aggregate([
      { $match: { status: { $in: ["confirmed", "completed"] } } },
      { $group: { _id: "$vehicle", bookingCount: { $sum: 1 }, revenue: { $sum: "$totalPrice" } } },
      { $sort: { bookingCount: -1 } },
      { $limit: 5 },
      { $lookup: { from: "vehicles", localField: "_id", foreignField: "_id", as: "vehicle" } },
      { $unwind: "$vehicle" },
      { $project: { _id: 0, name: "$vehicle.name", type: "$vehicle.type", bookingCount: 1, revenue: 1 } },
    ]);

    res.json({ totalVehicles, totalUsers, totalBookings, totalRevenue, bookingsByStatus, bookingsThisMonth, topVehicles: topVehiclesAgg });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };