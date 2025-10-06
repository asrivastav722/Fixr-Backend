const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// Load environment file based on NODE_ENV
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.local";
dotenv.config({ path: envFile });

const app = express();
app.use(cors());
app.use(express.json());

// Safe MongoDB connection
async function connectMongo() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in your environment file!");
    }

    // Encode password automatically
    const uriParts = process.env.MONGO_URI.split("://");
    const [protocol, rest] = uriParts;
    const encodedURI = rest.replace(/:(.*)@/, (_, pwd) => `:${encodeURIComponent(pwd)}@`);
    const finalURI = `${protocol}://${encodedURI}`;

    await mongoose.connect(finalURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:");

    if (err.codeName === "AtlasError") {
      console.error("- Possible authentication issue (bad username/password).");
    } else if (err.message.includes("ECONNREFUSED") || err.message.includes("failed to connect")) {
      console.error("- Possible network/whitelist issue (check IP access list).");
    }

    console.error(err);
    process.exit(1); // Exit process on failure
  }
}

// Connect to MongoDB
connectMongo();

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Fixr Backend is running 🚀",
    env: process.env.NODE_ENV,
  });
});

app.get("/health", async (req, res) => {
  const mongoState = mongoose.connection.readyState;
  /*
    readyState:
    0 = disconnected
    1 = connected
    2 = connecting
    3 = disconnecting
  */
  res.json({
    status: "Backend running",
    mongoConnection: mongoState === 1 ? "✅ Connected" : "❌ Not connected",
  });
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
