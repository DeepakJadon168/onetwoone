const Vehicle = require("../models/Vehicle");

// @route GET /api/vehicles  (public list, optional ?location=&available=true&type=Car)
const getVehicles = async (req, res) => {
  try {
    const filter = {};
    if (req.query.location) {
      filter.location = { $regex: req.query.location, $options: "i" };
    }
    if (req.query.available) {
      filter.available = req.query.available === "true";
    }
    if (req.query.type) {
      filter.type = req.query.type;
    }
    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// keeps legacy `imageUrl` (cover image) in sync with the first item of the `images` gallery array
const syncCoverImage = (body) => {
  if (Array.isArray(body.images) && body.images.length > 0) {
    body.imageUrl = body.images[0];
  }
  return body;
};

// admin only
const createVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(syncCoverImage(req.body));
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, syncCoverImage(req.body), {
      new: true,
      runValidators: true,
    });
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.json({ message: "Vehicle deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};
