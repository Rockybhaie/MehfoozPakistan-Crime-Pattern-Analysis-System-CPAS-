const {
  listAllInvestigations,
  getInvestigationById,
  createInvestigation,
  updateInvestigation,
  linkCrimeToInvestigation,
  deleteInvestigation,
  assignInvestigationToOfficer,
} = require("../models/InvestigationModel");

/**
 * Get all investigations with optional filters
 */
async function getAllInvestigations(req, res) {
  try {
    console.log('🔍 GET /investigations - Fetching all investigations with filters:', req.query);
    const filters = {
      status: req.query.status,
      outcome: req.query.outcome,
      leadOfficerId: req.query.leadOfficerId ? parseInt(req.query.leadOfficerId) : null,
    };
    const investigations = await listAllInvestigations(filters);
    console.log('✅ Investigations fetched successfully. Count:', investigations.length);
    res.json({ data: investigations });
  } catch (err) {
    console.error("❌ Error fetching investigations:", err);
    res.status(500).json({ message: "Error fetching investigations", error: err.message });
  }
}

/**
 * Get investigation by ID with linked crimes
 */
async function getInvestigation(req, res) {
  try {
    const investigationId = parseInt(req.params.id);
    console.log('🔍 GET /investigations/:id - Fetching investigation:', investigationId);
    const investigationData = await getInvestigationById(investigationId);
    if (!investigationData) {
      console.log('⚠️ Investigation not found:', investigationId);
      return res.status(404).json({ message: "Investigation not found" });
    }
    console.log('✅ Investigation fetched successfully:', investigationId);
    res.json({ data: investigationData });
  } catch (err) {
    console.error("❌ Error fetching investigation:", err);
    res.status(500).json({ message: "Error fetching investigation", error: err.message });
  }
}

/**
 * Create a new investigation (Officer only)
 */
async function addInvestigation(req, res) {
  try {
    console.log('🔍 POST /investigations - Creating investigation:', req.body);
    const investigationData = {
      ...req.body,
      leadOfficerId: req.body.leadOfficerId || req.user.userId,
    };
    const result = await createInvestigation(investigationData);
    console.log('✅ Investigation created successfully:', result);
    res.status(201).json({ 
      message: "Investigation created successfully",
      investigationId: result.investigationId,
      caseNumber: result.caseNumber
    });
  } catch (err) {
    console.error("❌ Error creating investigation:", err);
    res.status(500).json({ message: "Error creating investigation", error: err.message });
  }
}

/**
 * Update an investigation (Officer only)
 */
async function updateInvestigationHandler(req, res) {
  try {
    const investigationId = parseInt(req.params.id);
    console.log('🔍 PUT /investigations/:id - Updating investigation:', investigationId, req.body);
    await updateInvestigation(investigationId, req.body);
    console.log('✅ Investigation updated successfully:', investigationId);
    res.json({ message: "Investigation updated successfully" });
  } catch (err) {
    console.error("❌ Error updating investigation:", err);
    res.status(500).json({ message: "Error updating investigation", error: err.message });
  }
}

/**
 * Link crime to investigation (Officer only)
 */
async function linkCrime(req, res) {
  try {
    const investigationId = parseInt(req.params.id);
    const { crimeId } = req.body;
    console.log('🔍 POST /investigations/:id/crimes - Linking crime:', crimeId, 'to investigation:', investigationId);
    await linkCrimeToInvestigation(investigationId, crimeId);
    console.log('✅ Crime linked successfully');
    res.status(201).json({ message: "Crime linked to investigation successfully" });
  } catch (err) {
    console.error("❌ Error linking crime:", err);
    res.status(500).json({ message: "Error linking crime", error: err.message });
  }
}

/**
 * Delete an investigation (Officer only)
 */
async function deleteInvestigationHandler(req, res) {
  try {
    const investigationId = parseInt(req.params.id);
    console.log('🔍 DELETE /investigations/:id - Deleting investigation:', investigationId);
    const result = await deleteInvestigation(investigationId);
    if (result.rowsAffected > 0) {
      console.log('✅ Investigation deleted successfully:', investigationId);
      res.json({ message: "Investigation deleted successfully" });
    } else {
      console.log('⚠️ Investigation not found:', investigationId);
      res.status(404).json({ message: "Investigation not found" });
    }
  } catch (err) {
    console.error("❌ Error deleting investigation:", err);
    res.status(500).json({ message: "Error deleting investigation", error: err.message });
  }
}

/**
 * Assign investigation to officer using stored procedure (Officer only)
 */
async function assignInvestigation(req, res) {
  try {
    const investigationId = parseInt(req.params.id);
    const { officerId } = req.body;
    
    console.log('🔍 POST /investigations/:id/assign - Assigning officer:', officerId, 'to investigation:', investigationId);
    
    if (!officerId) {
      return res.status(400).json({ message: "officerId is required" });
    }
    
    const status = await assignInvestigationToOfficer(investigationId, officerId);
    console.log('✅ Investigation assigned successfully. Status:', status);
    res.json({ 
      message: "Investigation assigned successfully",
      status: status
    });
  } catch (err) {
    console.error("❌ Error assigning investigation:", err);
    res.status(500).json({ message: "Error assigning investigation", error: err.message });
  }
}

module.exports = {
  getAllInvestigations,
  getInvestigation,
  addInvestigation,
  updateInvestigationHandler,
  linkCrime,
  deleteInvestigationHandler,
  assignInvestigation,
};

