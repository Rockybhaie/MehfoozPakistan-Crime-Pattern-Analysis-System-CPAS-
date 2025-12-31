const express = require("express");
const {
  predictRisk,
  findPatterns,
  forecastTrends,
} = require("../controllers/predictionController");
const authMiddleware = require("../middlewares/authMiddleware");
const { requireOfficer } = require("../middlewares/roleMiddleware");

const router = express.Router();

// All prediction routes are Officer only
router.post("/predictions/risk-assessment", authMiddleware, requireOfficer, predictRisk);
router.post("/predictions/pattern-matching", authMiddleware, requireOfficer, findPatterns);
router.get("/predictions/forecast", authMiddleware, requireOfficer, forecastTrends);

module.exports = router;

