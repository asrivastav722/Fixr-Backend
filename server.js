const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Utility Imports
const connectDB = require('./utils/db.js');
const authRoutes = require('./routes/authRoutes.js');

// Initialization
dotenv.config();
const app = express();
const PORT = process.env.PORT || 1000;
const updatesFolder = path.join(__dirname, 'updates');

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toLocaleTimeString()}`);
  next();
});

// --- ROUTES ---

app.use('/api/auth', authRoutes);

app.get('/api/hello', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is live and routes are registered!",
  });
});

// Optimized Static Serving for Updates (Prevents Caching Issues)
app.use('/updates', express.static(updatesFolder, {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Expires', '0');
  }
}));

/**
 * EXPO MANIFEST ENDPOINT
 * This version uses a Stable ID and File-Based Timestamps to fix the "One-Time Update" issue.
 */
app.get('/api/manifest', (req, res) => {
  try {
    const bundlePath = path.join(updatesFolder, 'index.android.bundle');
    
    // 1. Verify the bundle exists
    if (!fs.existsSync(bundlePath)) {
      console.log("❌ Bundle not found at:", bundlePath);
      return res.status(404).json({ error: "No bundle found" });
    }

    const fileBuffer = fs.readFileSync(bundlePath);
    
    // 2. Generate the Expo-compliant Base64 SHA256 Hash
    const hash = crypto.createHash('sha256')
      .update(fileBuffer)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, ''); 

    // 3. Generate a STABLE but UNIQUE ID (Manifest ID)
    // We derive this from the file content so it only changes when the code changes.
    const fileContentHash = crypto.createHash('md5').update(fileBuffer).digest('hex');
    const stableId = `${fileContentHash.slice(0, 8)}-${fileContentHash.slice(8, 12)}-4${fileContentHash.slice(12, 15)}-a${fileContentHash.slice(16, 19)}-${fileContentHash.slice(20, 32)}`;

    // 4. Get the ACTUAL file modification time
    // This tells the APK that this version is "newer" than the one it currently has.
    const stats = fs.statSync(bundlePath);
    const fileTimestamp = stats.mtime.toISOString();

    // --- CONSOLIDATED HEADERS ---
    
    // Clear cache to prevent 304 Not Modified errors
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    // Expo-specific protocol headers
    res.setHeader('expo-protocol-version', '0');
    res.setHeader('expo-sfv-version', '0');
    res.setHeader('content-type', 'application/json');
    
    // Bypass NGROK warning page
    res.setHeader('ngrok-skip-browser-warning', 'true');

    // Remove ETag to force a fresh 200 OK response
    res.removeHeader('ETag');

    // 5. Send the Manifest
    res.json({
      id: stableId,
      createdAt: fileTimestamp, 
      runtimeVersion: req.headers['expo-runtime-version'] || "1.0.0",
      launchAsset: {
        hash: hash,
        key: "bundle",
        contentType: "application/javascript",
        url: `https://${req.get('host')}/updates/index.android.bundle`
      },
      assets: [],
      metadata: {
        branchName: "main",
        // We include the stableId here to force the native side to notice the change
        bundleUpdateId: stableId 
      }
    });

    console.log(`✅ Manifest [${stableId}] sent. File Time: ${fileTimestamp}`);

  } catch (error) {
    console.error("Critical Manifest Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Debug Route
app.get('/api/debug-ota', (req, res) => {
  res.json({
    searchingIn: updatesFolder,
    bundleExists: fs.existsSync(path.join(updatesFolder, 'index.android.bundle')),
    files: fs.existsSync(updatesFolder) ? fs.readdirSync(updatesFolder) : "Folder missing"
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});