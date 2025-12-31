const {
  listAllOfficers,
  getOfficerById,
  createOfficer,
  updateOfficerPassword,
} = require("../models/OfficerModel");

/**
 * Get all officers (Officer only)
 */
async function getAllOfficers(req, res) {
  try {
    const officers = await listAllOfficers();
    res.json({ data: officers });
  } catch (err) {
    console.error("Error fetching officers:", err);
    res.status(500).json({ message: "Error fetching officers", error: err.message });
  }
}

/**
 * Get officer by ID
 */
async function getOfficer(req, res) {
  try {
    const officerId = parseInt(req.params.id);
    const officer = await getOfficerById(officerId);
    if (!officer) {
      return res.status(404).json({ message: "Officer not found" });
    }
    res.json({ data: officer });
  } catch (err) {
    console.error("Error fetching officer:", err);
    res.status(500).json({ message: "Error fetching officer", error: err.message });
  }
}

/**
 * Create a new officer (for admin use - can be called by any officer for now)
 */
async function addOfficer(req, res) {
  try {
    await createOfficer(req.body);
    res.status(201).json({ message: "Officer created successfully" });
  } catch (err) {
    console.error("Error creating officer:", err);
    res.status(500).json({ message: "Error creating officer", error: err.message });
  }
}

module.exports = {
  getAllOfficers,
  getOfficer,
  addOfficer,
};

