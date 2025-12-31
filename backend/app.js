const express = require("express");
const db = require("./config/db");
const bodyParser = require("body-parser");
const cors = require("cors");

// Import all routes
const authRoutes = require("./routes/authRoutes");
const crimeRoutes = require("./routes/crimeRoutes");
const crimeReportRoutes = require("./routes/crimeReportRoutes");
const suspectRoutes = require("./routes/suspectRoutes");
const evidenceRoutes = require("./routes/evidenceRoutes");
const locationRoutes = require("./routes/locationRoutes");
const crimeTypeRoutes = require("./routes/crimeTypeRoutes");
const investigationRoutes = require("./routes/investigationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const officerRoutes = require("./routes/officerRoutes");
const victimRoutes = require("./routes/victimRoutes");
const witnessRoutes = require("./routes/witnessRoutes");

const app = express();

// Middleware to enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Authentication routes (no auth required)
app.use("/api", authRoutes);

// All other routes (require authentication)
app.use("/api", crimeRoutes);
app.use("/api", crimeReportRoutes);
app.use("/api", suspectRoutes);
app.use("/api", evidenceRoutes);
app.use("/api", locationRoutes);
app.use("/api", crimeTypeRoutes);
app.use("/api", investigationRoutes);
app.use("/api", analyticsRoutes);
app.use("/api", predictionRoutes);
app.use("/api", officerRoutes);
app.use("/api", victimRoutes);
app.use("/api", witnessRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// Catch-all route to verify that the app is running
app.get("/", (req, res) => {
  res.json({ 
    message: "CPAS Backend API is running!",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      crimes: "/api/crimes",
      reports: "/api/crime-reports",
      suspects: "/api/suspects",
      evidence: "/api/evidence",
      locations: "/api/locations",
      crimeTypes: "/api/crime-types",
      investigations: "/api/investigations",
      analytics: "/api/analytics",
      predictions: "/api/predictions",
    }
  });
});

// Start Server and DB
const PORT = process.env.PORT || 5000;
db.initialize().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 CPAS Backend Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
  });
}).catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
