const express = require('express');
const twilio = require('twilio');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

const client = new twilio('OR1baa18530032d0eb7c0119c0db7405cc', 'YOUR_TWILIO_AUTH_TOKEN');

// 1. Send OTP Route
app.post('/api/auth/send-otp', async (req, res) => {
    const { phone } = req.body; // Expecting format like +918081111867
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        // 1. Save OTP to your MongoDB
        await User.findOneAndUpdate({ phone }, { otp }, { upsert: true });

        // 2. Send REAL SMS
        await client.messages.create({
            body: `Your TechConnect code is ${otp}. Valid for 10 mins.`,
            from: 'YOUR_TWILIO_NUMBER',
            to: phone
        });

        res.json({ success: true, message: "SMS Sent!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Twilio Error: Check if number is verified in trial" });
    }
});

// 2. Verify OTP Route
app.post('/api/auth/verify-otp', async (req, res) => {
    const { phone, otp } = req.body;
    try {
        const user = await User.findOne({ 
            phone, 
            otp, 
            otpExpires: { $gt: Date.now() } 
        });

        if (!user) return res.status(400).json({ error: "Invalid or expired OTP" });

        // Clear OTP and verify user
        user.otp = null;
        user.isVerified = true;
        await user.save();

        const token = jwt.sign({ id: user._id }, "SECRET", { expiresIn: '7d' });
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ error: "Verification failed" });
    }
});