const {
  getAllVictims,
  getVictimById,
  updateVictim,
  updateVictimPassword,
} = require("../models/VictimModel");

/**
 * Get all victims (for officers to link to crimes)
 */
async function getAllVictimsHandler(req, res) {
  try {
    const victims = await getAllVictims();
    res.json({ data: victims });
  } catch (err) {
    console.error("Error fetching all victims:", err);
    res.status(500).json({ message: "Error fetching victims", error: err.message });
  }
}

/**
 * Get victim profile
 */
async function getVictimProfile(req, res) {
  try {
    const victimId = req.user.userId;
    const victim = await getVictimById(victimId);
    if (!victim) {
      return res.status(404).json({ message: "Victim not found" });
    }
    res.json({ data: victim });
  } catch (err) {
    console.error("Error fetching victim profile:", err);
    res.status(500).json({ message: "Error fetching victim profile", error: err.message });
  }
}

/**
 * Update victim profile
 */
async function updateVictimProfile(req, res) {
  try {
    const victimId = req.user.userId;
    await updateVictim(victimId, req.body);
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating victim profile:", err);
    res.status(500).json({ message: "Error updating victim profile", error: err.message });
  }
}

module.exports = {
  getAllVictimsHandler,
  getVictimProfile,
  updateVictimProfile,
};

