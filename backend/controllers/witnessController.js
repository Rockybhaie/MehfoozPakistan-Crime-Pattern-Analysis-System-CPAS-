const {
  getAllWitnesses,
  getWitnessById,
  updateWitness,
  updateWitnessPassword,
  getCrimesForWitness,
} = require("../models/WitnessModel");

/**
 * Get all witnesses (for officers to link to crimes)
 */
async function getAllWitnessesHandler(req, res) {
  try {
    const witnesses = await getAllWitnesses();
    res.json({ data: witnesses });
  } catch (err) {
    console.error("Error fetching all witnesses:", err);
    res.status(500).json({ message: "Error fetching witnesses", error: err.message });
  }
}

/**
 * Get witness profile
 */
async function getWitnessProfile(req, res) {
  try {
    const witnessId = req.user.userId;
    const witness = await getWitnessById(witnessId);
    if (!witness) {
      return res.status(404).json({ message: "Witness not found" });
    }
    res.json({ data: witness });
  } catch (err) {
    console.error("Error fetching witness profile:", err);
    res.status(500).json({ message: "Error fetching witness profile", error: err.message });
  }
}

/**
 * Update witness profile
 */
async function updateWitnessProfile(req, res) {
  try {
    const witnessId = req.user.userId;
    await updateWitness(witnessId, req.body);
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating witness profile:", err);
    res.status(500).json({ message: "Error updating witness profile", error: err.message });
  }
}

/**
 * Get crimes that witness is linked to
 */
async function getWitnessCrimes(req, res) {
  try {
    const witnessId = req.user.userId;
    const crimes = await getCrimesForWitness(witnessId);
    res.json({ data: crimes });
  } catch (err) {
    console.error("Error fetching witness crimes:", err);
    res.status(500).json({ message: "Error fetching witness crimes", error: err.message });
  }
}

/**
 * Update witness's own statement for a specific crime
 */
async function updateMyStatement(req, res) {
  try {
    const witnessId = req.user.userId;
    const crimeId = parseInt(req.params.crimeId);
    const { statementText } = req.body;
    
    // Import updateWitnessStatement from CrimeModel
    const { updateWitnessStatement } = require("../models/CrimeModel");
    
    // Update with current date, witness can only update statement text
    const statementDate = new Date().toISOString().split('T')[0];
    await updateWitnessStatement(crimeId, witnessId, statementDate, statementText);
    
    res.json({ message: "Statement updated successfully" });
  } catch (err) {
    console.error("Error updating statement:", err);
    res.status(500).json({ message: "Error updating statement", error: err.message });
  }
}

module.exports = {
  getAllWitnessesHandler,
  getWitnessProfile,
  updateWitnessProfile,
  getWitnessCrimes,
  updateMyStatement,
};

