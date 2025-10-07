const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");
const Technician = require("../models/Technician");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check both models
      const customer = await Customer.findById(decoded.id).select("-password");
      const technician = await Technician.findById(decoded.id).select("-password");

      if (!customer && !technician) {
        return res.status(401).json({ message: "User not found" });
      }

      // Attach the user to the request object
      if (customer) req.customer = customer;
      if (technician) req.technician = technician;

      next();
    } catch (error) {
      console.error("JWT verification failed:", error);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
};

module.exports = protect;
