const Customer = require("../models/Customer");
const generateToken = require("../utils/generateToken");

// Register Customer
const registerCustomer = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const existing = await Customer.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Customer already exists" });
    }

    const customer = await Customer.create({ name, email, password, phone });

    res.status(201).json({
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      token: generateToken(customer._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login Customer
const loginCustomer = async (req, res) => {
  const { email, password } = req.body;

  try {
    const customer = await Customer.findOne({ email });

    if (customer && (await customer.matchPassword(password))) {
      res.json({
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        token: generateToken(customer._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerCustomer, loginCustomer };
