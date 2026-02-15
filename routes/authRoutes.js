const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Your schema from earlier
const jwt = require('jsonwebtoken');

// STEP 1: SEND OTP (Called by PhoneScreen)
router.post('/send-otp', async (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
    const otpExpires = Date.now() + 600000; // 10 mins

    try {
        // Find user by phone, if not exists create one (Upsert)
        // We don't mark as isVerified yet
        await User.findOneAndUpdate(
            { phone },
            { otp, otpExpires, role: 'customer' }, // default role
            { upsert: true, new: true }
        );

        // LOG OTP TO CONSOLE (Since we don't have Twilio setup yet)
        console.log(`\n--- SMS SIMULATION ---`);
        console.log(`OTP for ${phone} is: ${otp}`);
        console.log(`----------------------\n`);

        res.status(200).json({ message: "OTP sent to console" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// STEP 2: VERIFY OTP (Called by OTPScreen)
router.post('/verify-otp', async (req, res) => {
    const { phone, otp } = req.body;
    try {
        const user = await User.findOne({ 
            phone, 
            otp, 
            otpExpires: { $gt: Date.now() } 
        });

        if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });

        // Update User Status
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Create JWT Token
        const token = jwt.sign({ id: user._id }, "YOUR_SECRET_KEY", { expiresIn: '7d' });

        res.status(200).json({ token, user, message: "Verified!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// STEP 3: UPDATE LOCATION (Called by LocationScreen)
router.post('/update-location', async (req, res) => {
    const { phone, lng, lat } = req.body;
    try {
        // If it's a guest (phone is null), we don't save to DB, just return success
        if (phone) {
            await User.findOneAndUpdate(
                { phone },
                { 
                    location: { 
                        type: 'Point', 
                        coordinates: [parseFloat(lng), parseFloat(lat)] 
                    } 
                }
            );
        }
        res.status(200).json({ success: true, message: "Location updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;