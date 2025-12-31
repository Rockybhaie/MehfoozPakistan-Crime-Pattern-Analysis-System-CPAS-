const express = require("express");
const {
  getCrimeTrendsHandler,
  getCrimeHotspotsHandler,
  getCrimePatternsHandler,
  getCategoryDistributionHandler,
  getOfficerPerformanceHandler,
  getTimeSeriesDataHandler,
  getCrimeStatisticsHandler,
} = require("../controllers/analyticsController");
const authMiddleware = require("../middlewares/authMiddleware");
const { requireOfficer } = require("../middlewares/roleMiddleware");

const router = express.Router();

// All analytics routes are Officer only
router.get("/analytics/crime-trends", authMiddleware, requireOfficer, getCrimeTrendsHandler);
router.get("/analytics/hotspots", authMiddleware, requireOfficer, getCrimeHotspotsHandler);
router.get("/analytics/patterns", authMiddleware, requireOfficer, getCrimePatternsHandler);
router.get("/analytics/category-distribution", authMiddleware, requireOfficer, getCategoryDistributionHandler);
router.get("/analytics/officer-performance", authMiddleware, requireOfficer, getOfficerPerformanceHandler);
router.get("/analytics/time-series", authMiddleware, requireOfficer, getTimeSeriesDataHandler);
router.get("/analytics/statistics", authMiddleware, requireOfficer, getCrimeStatisticsHandler);

module.exports = router;

