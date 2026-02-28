import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  phone: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true 
  },
  fullName: { 
    type: String, 
    required: true,
    trim: true, 
    default:"Verified User"
  },
  email: { 
    type: String, 
    lowercase: true, 
    trim: true 
  },
  profileImage: { 
    type: String,
    default: "https://i.pravatar.cc/150?u=guest" 
  },
  role: { 
    type: String, 
    enum: ['customer', 'technician'], 
    default: 'customer' 
  },
  // Matches your Redux theme state
  theme: { 
    type: String, 
    enum: ['light', 'dark'], 
    default: 'light' 
  },
  // Geo-spatial data for "Technicians Near You" logic
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [82.1851, 27.4099] }, // [Long, Lat]
    address: String,
    city: String
  },
  // For the "Active for Hire" toggle in your Profile UI
  isAvailable: { 
    type: Boolean, 
    default: false 
  },
  otp: { type: String },
  otpExpires: { type: Date }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create a 2dsphere index for location-based searching
userSchema.index({ location: "2dsphere" });

const User = mongoose.model("User", userSchema);
export default User;