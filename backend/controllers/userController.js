const User = require("../models/User");

const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { vehicleId } = req.params;

    const index = user.wishlist.findIndex((v) => v.toString() === vehicleId);
    let added;
    if (index > -1) {
      user.wishlist.splice(index, 1);
      added = false;
    } else {
      user.wishlist.push(vehicleId);
      added = true;
    }
    await user.save();
    res.json({ added, wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWishlist, toggleWishlist };