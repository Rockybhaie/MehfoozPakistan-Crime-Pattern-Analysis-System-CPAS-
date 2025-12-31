const express = require("express");
const {
  getAllLocations,
  getLocation,
  addLocation,
  updateLocationHandler,
  deleteLocationHandler,
} = require("../controllers/locationController");
const authMiddleware = require("../middlewares/authMiddleware");
const { requireOfficer } = require("../middlewares/roleMiddleware");

const router = express.Router();

// Public routes (all authenticated users can view)
router.get("/locations", authMiddleware, getAllLocations);
router.get("/locations/:id", authMiddleware, getLocation);

// Officer only routes
router.post("/locations", authMiddleware, requireOfficer, addLocation);
router.put("/locations/:id", authMiddleware, requireOfficer, updateLocationHandler);
router.delete("/locations/:id", authMiddleware, requireOfficer, deleteLocationHandler);

module.exports = router;
