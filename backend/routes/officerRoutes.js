const express = require("express");
const {
  getAllOfficers,
  getOfficer,
  addOfficer,
} = require("../controllers/officerController");
const authMiddleware = require("../middlewares/authMiddleware");
const { requireOfficer } = require("../middlewares/roleMiddleware");

const router = express.Router();

// Officer only routes
router.get("/officers", authMiddleware, requireOfficer, getAllOfficers);
router.get("/officers/:id", authMiddleware, requireOfficer, getOfficer);
router.post("/officers", authMiddleware, requireOfficer, addOfficer);

module.exports = router;

