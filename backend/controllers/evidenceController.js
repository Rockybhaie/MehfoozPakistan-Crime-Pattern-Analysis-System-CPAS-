const {
  listAllEvidence,
  getEvidenceById,
  createEvidence,
  updateEvidence,
  deleteEvidence,
  updateEvidenceChain,
} = require("../models/EvidenceModel");

/**
 * Get all evidence with optional filters
 */
async function getAllEvidence(req, res) {
  try {
    const filters = {
      crimeId: req.query.crimeId ? parseInt(req.query.crimeId) : null,
      type: req.query.type,
      collectedBy: req.query.collectedBy ? parseInt(req.query.collectedBy) : null,
    };
    const evidence = await listAllEvidence(filters);
    res.json({ data: evidence });
  } catch (err) {
    console.error("Error fetching evidence:", err);
    res.status(500).json({ message: "Error fetching evidence", error: err.message });
  }
}

/**
 * Get evidence by ID
 */
async function getEvidence(req, res) {
  try {
    const evidenceId = parseInt(req.params.id);
    const evidence = await getEvidenceById(evidenceId);
    if (!evidence) {
      return res.status(404).json({ message: "Evidence not found" });
    }
    res.json({ data: evidence });
  } catch (err) {
    console.error("Error fetching evidence:", err);
    res.status(500).json({ message: "Error fetching evidence", error: err.message });
  }
}

/**
 * Create new evidence (Officer only)
 */
async function addEvidence(req, res) {
  try {
    console.log('📦 Creating evidence - Request body:', req.body);
    console.log('👤 User info:', req.user);
    const evidenceData = {
      ...req.body,
      collectedBy: req.user.role === "OFFICER" ? req.user.userId : req.body.collectedBy,
    };
    console.log('📝 Evidence data to create:', evidenceData);
    await createEvidence(evidenceData);
    res.status(201).json({ message: "Evidence created successfully" });
  } catch (err) {
    console.error("❌ Error creating evidence:", err);
    res.status(500).json({ message: "Error creating evidence", error: err.message });
  }
}

/**
 * Update evidence (Officer only)
 */
async function updateEvidenceHandler(req, res) {
  try {
    const evidenceId = parseInt(req.params.id);
    await updateEvidence(evidenceId, req.body);
    res.json({ message: "Evidence updated successfully" });
  } catch (err) {
    console.error("Error updating evidence:", err);
    res.status(500).json({ message: "Error updating evidence", error: err.message });
  }
}

/**
 * Delete evidence (Officer only)
 */
async function deleteEvidenceHandler(req, res) {
  try {
    const evidenceId = parseInt(req.params.id);
    const result = await deleteEvidence(evidenceId);
    if (result.rowsAffected > 0) {
      res.json({ message: "Evidence deleted successfully" });
    } else {
      res.status(404).json({ message: "Evidence not found" });
    }
  } catch (err) {
    console.error("Error deleting evidence:", err);
    res.status(500).json({ message: "Error deleting evidence", error: err.message });
  }
}

/**
 * Update evidence chain of custody (Officer only)
 * Uses stored procedure sp_update_evidence_chain
 */
async function updateEvidenceChainHandler(req, res) {
  try {
    const evidenceId = parseInt(req.params.id);
    const { action, notes } = req.body;
    const officerId = req.user.userId; // Auto-assign from logged-in officer
    
    if (!action) {
      return res.status(400).json({ message: "Action is required (COLLECTED, TRANSFERRED, or ANALYZED)" });
    }
    
    await updateEvidenceChain(evidenceId, officerId, action, notes);
    res.json({ message: "Evidence chain of custody updated successfully" });
  } catch (err) {
    console.error("Error updating evidence chain:", err);
    res.status(500).json({ message: "Error updating evidence chain", error: err.message });
  }
}

module.exports = {
  getAllEvidence,
  getEvidence,
  addEvidence,
  updateEvidenceHandler,
  deleteEvidenceHandler,
  updateEvidenceChainHandler,
};

