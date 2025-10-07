const express = require("express");
const jwt = require("jsonwebtoken");
const Technician = require("../models/Technician");
const protect = require("../middleware/authMiddleware");
const router = express.Router();

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @route   POST /api/technicians/register
// @desc    Register a new technician
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, skillset, experienceYears } = req.body;

    const existing = await Technician.findOne({ email });
    if (existing) return res.status(400).json({ message: "Technician already exists" });

    const technician = await Technician.create({
      name,
      email,
      phone,
      password,
      skillset,
      experienceYears,
    });

    res.status(201).json({
      _id: technician._id,
      name: technician.name,
      email: technician.email,
      token: generateToken(technician._id),
    });
  } catch (err) {
    console.error("Technician registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/technicians/login
// @desc    Technician login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const technician = await Technician.findOne({ email });
    if (!technician) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await technician.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      _id: technician._id,
      name: technician.name,
      email: technician.email,
      token: generateToken(technician._id),
    });
  } catch (err) {
    console.error("Technician login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/technicians/profile
// @desc    Get logged-in technician profile
router.get("/profile", protect, async (req, res) => {
  try {
    const technician = await Technician.findById(req.customer?._id || req.technician?._id).select(
      "-password"
    );
    res.json(technician);
  } catch (err) {
    console.error("Fetch technician profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
