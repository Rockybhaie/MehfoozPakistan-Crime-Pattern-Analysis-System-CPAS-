const express = require("express");
const {
  getAllCrimeReports,
  getCrimeReport,
  addCrimeReport,
  updateCrimeReportHandler,
  linkReport,
  deleteCrimeReportHandler,
} = require("../controllers/crimeReportController");
const authMiddleware = require("../middlewares/authMiddleware");
const { requireOfficer, requireVictim, requireOfficerOrVictim } = require("../middlewares/roleMiddleware");

const router = express.Router();

// Victim can view their own reports, Officer can view all
router.get("/crime-reports", authMiddleware, requireOfficerOrVictim, getAllCrimeReports);
router.get("/crime-reports/:id", authMiddleware, requireOfficerOrVictim, getCrimeReport);

// Victim can create reports
router.post("/crime-reports", authMiddleware, requireOfficerOrVictim, addCrimeReport);

// Officer only routes
router.put("/crime-reports/:id", authMiddleware, requireOfficer, updateCrimeReportHandler);
router.post("/crime-reports/:id/link", authMiddleware, requireOfficer, linkReport);
router.delete("/crime-reports/:id", authMiddleware, requireOfficer, deleteCrimeReportHandler);

module.exports = router;

