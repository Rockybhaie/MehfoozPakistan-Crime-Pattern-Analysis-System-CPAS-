const {
  listAllSuspects,
  getSuspectById,
  createSuspect,
  updateSuspect,
  deleteSuspect,
} = require("../models/SuspectModel");

// Helper to safely JSON-clone and drop circular refs
const safeClone = (data) => {
  const seen = new WeakSet();
  return JSON.parse(
    JSON.stringify(data, (_k, v) => {
      if (typeof v === "object" && v !== null) {
        if (seen.has(v)) return undefined;
        seen.add(v);
      }
      return v;
    })
  );
};

/**
 * Get all suspects with optional filters
 */
async function getAllSuspects(req, res) {
  try {
    const filters = {
      status: req.query.status,
      hasCriminalRecord: req.query.hasCriminalRecord === "true" ? true : req.query.hasCriminalRecord === "false" ? false : undefined,
      searchName: req.query.searchName,
    };
    const suspects = await listAllSuspects(filters);
    res.json({ data: safeClone(suspects) });
  } catch (err) {
    console.error("Error fetching suspects:", err);
    res.status(500).json({ message: "Error fetching suspects", error: err.message });
  }
}

/**
 * Get suspect by ID with crime history
 */
async function getSuspect(req, res) {
  try {
    const suspectId = parseInt(req.params.id);
    const suspectData = await getSuspectById(suspectId);
    if (!suspectData) {
      return res.status(404).json({ message: "Suspect not found" });
    }
    res.json({ data: suspectData });
  } catch (err) {
    console.error("Error fetching suspect:", err);
    res.status(500).json({ message: "Error fetching suspect", error: err.message });
  }
}

/**
 * Create a new suspect (Officer only)
 */
async function addSuspect(req, res) {
  try {
    await createSuspect(req.body);
    res.status(201).json({ message: "Suspect created successfully" });
  } catch (err) {
    console.error("Error creating suspect:", err);
    res.status(500).json({ message: "Error creating suspect", error: err.message });
  }
}

/**
 * Update a suspect (Officer only)
 */
async function updateSuspectHandler(req, res) {
  try {
    const suspectId = parseInt(req.params.id);
    await updateSuspect(suspectId, req.body);
    res.json({ message: "Suspect updated successfully" });
  } catch (err) {
    console.error("Error updating suspect:", err);
    res.status(500).json({ message: "Error updating suspect", error: err.message });
  }
}

/**
 * Delete a suspect (Officer only)
 */
async function deleteSuspectHandler(req, res) {
  try {
    const suspectId = parseInt(req.params.id);
    const result = await deleteSuspect(suspectId);
    if (result.rowsAffected > 0) {
      res.json({ message: "Suspect deleted successfully" });
    } else {
      res.status(404).json({ message: "Suspect not found" });
    }
  } catch (err) {
    console.error("Error deleting suspect:", err);
    res.status(500).json({ message: "Error deleting suspect", error: err.message });
  }
}

module.exports = {
  getAllSuspects,
  getSuspect,
  addSuspect,
  updateSuspectHandler,
  deleteSuspectHandler,
};

