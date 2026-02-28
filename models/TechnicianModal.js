const technicianSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  profession: { type: String, required: true }, // e.g., "Electrician"
  about: { type: String },
  skills: [{ type: String }],
  
  experience: {
    years: { type: Number, default: 0 },
    type: { type: String } // e.g., "Residential & Commercial"
  },
  
  pricing: {
    startingPrice: { type: Number, required: true },
    unit: { type: String, default: 'per visit' }
  },

  // Availability Logic (Mode Switcher)
  isAvailableNow: { type: Boolean, default: false }, // The toggle in your UI
  workingHours: {
    start: { type: String, default: "09:00" },
    end: { type: String, default: "18:00" },
    days: [{ type: String }] // ["Monday", "Tuesday", etc.]
  },

  // Trust & Verification
  isVerified: { type: Boolean, default: false },
  verificationBadges: [{ type: String }], // ["ID Verified", "Background Checked"]
  reliabilityScore: { type: Number, min: 0, max: 100, default: 0 },
  
  // Stats (Denormalized for performance)
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  profileViews: { type: Number, default: 0 },
  contactClicks: { type: Number, default: 0 },
  
  // Media
  portfolio: [{ type: String }], // URLs to images/videos
  reels: [{ type: String }]      // URLs to service showreel videos
});