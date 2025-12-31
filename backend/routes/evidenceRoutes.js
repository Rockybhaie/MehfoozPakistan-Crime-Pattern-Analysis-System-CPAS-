const express = require("express");
const {
  getAllEvidence,
  getEvidence,
  addEvidence,
  updateEvidenceHandler,
  deleteEvidenceHandler,
  updateEvidenceChainHandler,
} = require("../controllers/evidenceController");
const authMiddleware = require("../middlewares/authMiddleware");
const { requireOfficer } = require("../middlewares/roleMiddleware");

const router = express.Router();

// Officer only routes
router.get("/evidence", authMiddleware, requireOfficer, getAllEvidence);
router.get("/evidence/:id", authMiddleware, requireOfficer, getEvidence);
router.post("/evidence", authMiddleware, requireOfficer, addEvidence);
router.put("/evidence/:id", authMiddleware, requireOfficer, updateEvidenceHandler);
router.post("/evidence/:id/chain", authMiddleware, requireOfficer, updateEvidenceChainHandler);
router.delete("/evidence/:id", authMiddleware, requireOfficer, deleteEvidenceHandler);

module.exports = router;

