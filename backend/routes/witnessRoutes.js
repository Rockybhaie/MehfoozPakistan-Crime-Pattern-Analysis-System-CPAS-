const express = require("express");
const {
  getAllWitnessesHandler,
  getWitnessProfile,
  updateWitnessProfile,
  getWitnessCrimes,
  updateMyStatement,
} = require("../controllers/witnessController");
const authMiddleware = require("../middlewares/authMiddleware");
const { requireWitness, requireOfficer } = require("../middlewares/roleMiddleware");

const router = express.Router();

// Officer only route - get all witnesses for linking to crimes
router.get("/witnesses", authMiddleware, requireOfficer, getAllWitnessesHandler);

// Witness only routes
router.get("/witness/profile", authMiddleware, requireWitness, getWitnessProfile);
router.put("/witness/profile", authMiddleware, requireWitness, updateWitnessProfile);
router.get("/witness/crimes", authMiddleware, requireWitness, getWitnessCrimes);
router.put("/witness/crimes/:crimeId/statement", authMiddleware, requireWitness, updateMyStatement);

module.exports = router;

