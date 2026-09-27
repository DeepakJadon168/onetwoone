const Coupon = require("../models/Coupon");

const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json({ message: "Coupon deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const validateCoupon = async (req, res) => {
  try {
    const { code, amount } = req.body;
    const coupon = await Coupon.findOne({ code: code?.toUpperCase(), active: true });

    if (!coupon) return res.status(404).json({ message: "Invalid coupon code" });
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({ message: "This coupon has expired" });
    }
    if (amount < coupon.minAmount) {
      return res.status(400).json({ message: `A minimum booking amount of ₹${coupon.minAmount} is required for this coupon` });
    }

    const discountAmount = Math.round((amount * coupon.discountPercent) / 100);
    res.json({ valid: true, discountAmount, discountPercent: coupon.discountPercent, code: coupon.code });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCoupons, createCoupon, deleteCoupon, validateCoupon };