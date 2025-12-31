const {
  getCrimeTrends,
  getCrimeHotspots,
  getCrimePatterns,
  getCategoryDistribution,
  getOfficerPerformance,
  getTimeSeriesData,
  getCrimeStatisticsByDateRange,
} = require("../models/AnalyticsModel");

/**
 * Get crime trends with window functions
 */
async function getCrimeTrendsHandler(req, res) {
  try {
    const filters = {
      year: req.query.year ? parseInt(req.query.year) : null,
      month: req.query.month ? parseInt(req.query.month) : null,
      crimeTypeId: req.query.crimeTypeId ? parseInt(req.query.crimeTypeId) : null,
    };
    const trends = await getCrimeTrends(filters);
    res.json({ data: trends });
  } catch (err) {
    console.error("Error fetching crime trends:", err);
    res.status(500).json({ message: "Error fetching crime trends", error: err.message });
  }
}

/**
 * Get crime hotspots
 */
async function getCrimeHotspotsHandler(req, res) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const hotspots = await getCrimeHotspots(limit);
    res.json({ data: hotspots });
  } catch (err) {
    console.error("Error fetching crime hotspots:", err);
    res.status(500).json({ message: "Error fetching crime hotspots", error: err.message });
  }
}

/**
 * Get crime patterns by day and time
 */
async function getCrimePatternsHandler(req, res) {
  try {
    const patterns = await getCrimePatterns();
    res.json({ data: patterns });
  } catch (err) {
    console.error("Error fetching crime patterns:", err);
    res.status(500).json({ message: "Error fetching crime patterns", error: err.message });
  }
}

/**
 * Get category distribution
 */
async function getCategoryDistributionHandler(req, res) {
  try {
    const distribution = await getCategoryDistribution();
    res.json({ data: distribution });
  } catch (err) {
    console.error("Error fetching category distribution:", err);
    res.status(500).json({ message: "Error fetching category distribution", error: err.message });
  }
}

/**
 * Get officer performance statistics
 */
async function getOfficerPerformanceHandler(req, res) {
  try {
    const performance = await getOfficerPerformance();
    res.json({ data: performance });
  } catch (err) {
    console.error("Error fetching officer performance:", err);
    res.status(500).json({ message: "Error fetching officer performance", error: err.message });
  }
}

/**
 * Get time series data for charts
 */
async function getTimeSeriesDataHandler(req, res) {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      groupBy: req.query.groupBy || "MONTH",
    };
    const timeSeries = await getTimeSeriesData(filters);
    res.json({ data: timeSeries });
  } catch (err) {
    console.error("Error fetching time series data:", err);
    res.status(500).json({ message: "Error fetching time series data", error: err.message });
  }
}

/**
 * Get crime statistics by date range using stored procedure
 */
async function getCrimeStatisticsHandler(req, res) {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(new Date().setMonth(new Date().getMonth() - 6));
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    
    const statistics = await getCrimeStatisticsByDateRange(startDate, endDate);
    res.json({ data: statistics });
  } catch (err) {
    console.error("Error fetching crime statistics:", err);
    res.status(500).json({ message: "Error fetching crime statistics", error: err.message });
  }
}

module.exports = {
  getCrimeTrendsHandler,
  getCrimeHotspotsHandler,
  getCrimePatternsHandler,
  getCategoryDistributionHandler,
  getOfficerPerformanceHandler,
  getTimeSeriesDataHandler,
  getCrimeStatisticsHandler,
};

