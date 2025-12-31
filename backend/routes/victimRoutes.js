const express = require("express");
const {
  getAllVictimsHandler,
  getVictimProfile,
  updateVictimProfile,
} = require("../controllers/victimController");
const authMiddleware = require("../middlewares/authMiddleware");
const { requireVictim, requireOfficer } = require("../middlewares/roleMiddleware");

const router = express.Router();

// Officer only route - get all victims for linking to crimes
router.get("/victims", authMiddleware, requireOfficer, getAllVictimsHandler);

// Victim only routes
router.get("/victim/profile", authMiddleware, requireVictim, getVictimProfile);
router.put("/victim/profile", authMiddleware, requireVictim, updateVictimProfile);

module.exports = router;

