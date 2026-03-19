const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: uuidv4,
  },
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
  languages: {
    type: [String], // Specifies an array of strings
    default: [],
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Others'],
    default:"Male",
    required: true, // Optional: ensures the field isn't left empty
  },
  roles: { 
    type: [String], // Cleaner syntax for Array of Strings
    enum: ['customer', 'technician'], 
    default: ['customer'],
    lowercase: true,
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'A user must have at least one role.'
    }
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
    coordinates: { type: [Number], default: [0.0, 0.0] }, // [Long, Lat]
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
module.exports=User;

//