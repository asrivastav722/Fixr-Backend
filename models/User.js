const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, default: 'Verified User' },
  email: { type: String, unique: true, required: false , default: ''},
  role: { type: String, enum: ['customer', 'technician'], required: true ,default: 'customer'},
  category: { type: String, default: '' }, // Only for technicians
  phone: { type: String, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' } // [lng, lat]
  },
  otp: { type: String },
  isVerified: { type: Boolean, default: false },
  otpExpires: { type: Date }
});

module.exports = mongoose.model('User', UserSchema);