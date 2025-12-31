const express = require("express");
const {
  getAllCrimeTypes,
  getCrimeType,
  addCrimeType,
  updateCrimeTypeHandler,
  deleteCrimeTypeHandler,
} = require("../controllers/crimeTypeController");
const authMiddleware = require("../middlewares/authMiddleware");
const { requireOfficer } = require("../middlewares/roleMiddleware");

const router = express.Router();

// Public routes (all authenticated users can view)
router.get("/crime-types", authMiddleware, getAllCrimeTypes);
router.get("/crime-types/:id", authMiddleware, getCrimeType);

// Officer only routes
router.post("/crime-types", authMiddleware, requireOfficer, addCrimeType);
router.put("/crime-types/:id", authMiddleware, requireOfficer, updateCrimeTypeHandler);
router.delete("/crime-types/:id", authMiddleware, requireOfficer, deleteCrimeTypeHandler);

module.exports = router;

