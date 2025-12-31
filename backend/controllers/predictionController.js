const {
  predictCrimeRisk,
  findSimilarPatterns,
  forecastCrimeTrends,
} = require("../models/PredictionModel");

/**
 * Predict crime risk for a location
 */
async function predictRisk(req, res) {
  try {
    const { city, area } = req.body;
    
    if (!city) {
      return res.status(400).json({ message: "City is required" });
    }
    
    const prediction = await predictCrimeRisk(city, area);
    res.json({ data: prediction });
  } catch (err) {
    console.error("Error predicting crime risk:", err);
    res.status(500).json({ message: "Error predicting crime risk", error: err.message });
  }
}

/**
 * Find similar crime patterns
 */
async function findPatterns(req, res) {
  try {
    const patternData = {
      crimeType: req.body.crimeType || null,
      city: req.body.city || null,
      area: req.body.area || null,
      dayOfWeek: req.body.dayOfWeek || null,
    };
    const patterns = await findSimilarPatterns(patternData);
    res.json({ data: patterns });
  } catch (err) {
    console.error("Error finding patterns:", err);
    res.status(500).json({ message: "Error finding patterns", error: err.message });
  }
}

/**
 * Forecast crime trends
 */
async function forecastTrends(req, res) {
  try {
    const forecastParams = {
      months: req.query.months ? parseInt(req.query.months) : 6,
      crimeType: req.query.crimeType || null,
      city: req.query.city || null,
      area: req.query.area || null,
    };
    const forecast = await forecastCrimeTrends(forecastParams);
    res.json({ data: forecast });
  } catch (err) {
    console.error("Error forecasting trends:", err);
    res.status(500).json({ message: "Error forecasting trends", error: err.message });
  }
}

module.exports = {
  predictRisk,
  findPatterns,
  forecastTrends,
};