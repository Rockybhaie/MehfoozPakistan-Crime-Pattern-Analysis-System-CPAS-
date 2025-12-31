const express = require("express");
const {
  getAllCrimes,
  getCrime,
  addCrime,
  updateCrimeHandler,
  deleteCrimeHandler,
  linkSuspect,
  linkVictim,
  linkWitness,
  updateWitness,
  unlinkWitness,
} = require("../controllers/crimeController");
const authMiddleware = require("../middlewares/authMiddleware");
const { requireOfficer } = require("../middlewares/roleMiddleware");

const router = express.Router();

// Public routes (authenticated users can view)
router.get("/crimes", authMiddleware, getAllCrimes);
router.get("/crimes/:id", authMiddleware, getCrime);

// Officer only routes
router.post("/crimes", authMiddleware, requireOfficer, addCrime);
router.put("/crimes/:id", authMiddleware, requireOfficer, updateCrimeHandler);
router.delete("/crimes/:id", authMiddleware, requireOfficer, deleteCrimeHandler);
router.post("/crimes/:id/suspects", authMiddleware, requireOfficer, linkSuspect);
router.post("/crimes/:id/victims", authMiddleware, requireOfficer, linkVictim);
router.post("/crimes/:id/witnesses", authMiddleware, requireOfficer, linkWitness);
router.put("/crimes/:id/witnesses/:witnessId", authMiddleware, requireOfficer, updateWitness);
router.delete("/crimes/:id/witnesses/:witnessId", authMiddleware, requireOfficer, unlinkWitness);

module.exports = router;

