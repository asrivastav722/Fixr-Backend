const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  email: { type: String, lowercase: true, trim: true },
  fullName: { type: String, required: true },
  profileImage: { type: String }, // URL to S3/Cloudinary
  role: { 
    type: String, 
    enum: ['customer', 'technician', 'admin'], 
    default: 'customer' 
  },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  
  // App Preferences
  theme: { type: String, enum: ['light', 'dark'], default: 'light' },
  languages: [{ type: String, default: ['Hindi', 'English'] }],
  
  // Geographic Data (Current)
  lastKnownLocation: {
    type: { type: String, default: 'Point' },
    coordinates: [Number], // [longitude, latitude]
    address: String,
    city: String
  },
  
  isActive: { type: Boolean, default: true },
  joinedAt: { type: Date, default: Date.now },
  otpVerified: { type: Boolean, default: false }
}, { timestamps: true });

// Index for distance queries
userSchema.index({ lastKnownLocation: "2dsphere" });