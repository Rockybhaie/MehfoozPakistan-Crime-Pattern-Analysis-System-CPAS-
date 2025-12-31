const {
  listAllCrimeTypes,
  getCrimeTypeById,
  createCrimeType,
  updateCrimeType,
  deleteCrimeType,
} = require("../models/CrimeTypeModel");

/**
 * Get all crime types
 */
async function getAllCrimeTypes(req, res) {
  try {
    const crimeTypes = await listAllCrimeTypes();
    res.json({ data: crimeTypes });
  } catch (err) {
    console.error("Error fetching crime types:", err);
    res.status(500).json({ message: "Error fetching crime types", error: err.message });
  }
}

/**
 * Get crime type by ID
 */
async function getCrimeType(req, res) {
  try {
    const crimeTypeId = parseInt(req.params.id);
    const crimeType = await getCrimeTypeById(crimeTypeId);
    if (!crimeType) {
      return res.status(404).json({ message: "Crime type not found" });
    }
    res.json({ data: crimeType });
  } catch (err) {
    console.error("Error fetching crime type:", err);
    res.status(500).json({ message: "Error fetching crime type", error: err.message });
  }
}

/**
 * Create a new crime type (Officer only)
 */
async function addCrimeType(req, res) {
  try {
    await createCrimeType(req.body);
    res.status(201).json({ message: "Crime type created successfully" });
  } catch (err) {
    console.error("Error creating crime type:", err);
    res.status(500).json({ message: "Error creating crime type", error: err.message });
  }
}

/**
 * Update a crime type (Officer only)
 */
async function updateCrimeTypeHandler(req, res) {
  try {
    const crimeTypeId = parseInt(req.params.id);
    await updateCrimeType(crimeTypeId, req.body);
    res.json({ message: "Crime type updated successfully" });
  } catch (err) {
    console.error("Error updating crime type:", err);
    res.status(500).json({ message: "Error updating crime type", error: err.message });
  }
}

/**
 * Delete a crime type (Officer only)
 */
async function deleteCrimeTypeHandler(req, res) {
  try {
    const crimeTypeId = parseInt(req.params.id);
    const result = await deleteCrimeType(crimeTypeId);
    if (result.rowsAffected > 0) {
      res.json({ message: "Crime type deleted successfully" });
    } else {
      res.status(404).json({ message: "Crime type not found" });
    }
  } catch (err) {
    console.error("Error deleting crime type:", err);
    res.status(500).json({ message: "Error deleting crime type", error: err.message });
  }
}

module.exports = {
  getAllCrimeTypes,
  getCrimeType,
  addCrimeType,
  updateCrimeTypeHandler,
  deleteCrimeTypeHandler,
};

