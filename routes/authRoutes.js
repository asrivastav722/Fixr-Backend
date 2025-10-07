const express = require("express");
const { registerCustomer, loginCustomer } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");



const router = express.Router();

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);
router.get("/profile", protect, async (req, res) => {
  res.json({
    message: "Welcome to your profile!",
    customer: req.customer,
  });
});

module.exports = router;
