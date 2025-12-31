const {
  listAllCrimes,
  getCrimeById,
  createCrime,
  updateCrime,
  deleteCrime,
  linkSuspectToCrime,
  linkVictimToCrime,
  linkWitnessToCrime,
  updateWitnessStatement,
  unlinkWitnessFromCrime,
} = require("../models/CrimeModel");

// Helper to safely clone and drop circular refs
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
 * Get all crimes with optional filters
 * CRITICAL: Officers can only see crimes assigned to them (Officer_ID = logged-in officer)
 * Admin users (if role is ADMIN) can see all crimes
 */
async function getAllCrimes(req, res) {
  try {
    const filters = {
      status: req.query.status,
      crimeTypeId: req.query.crimeTypeId ? parseInt(req.query.crimeTypeId) : null,
      locationId: req.query.locationId ? parseInt(req.query.locationId) : null,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
    };

    // CRITICAL SECURITY: Filter by officer ID unless user is admin
    // req.user is set by authMiddleware from JWT token
    if (req.user && req.user.role === 'OFFICER') {
      filters.officerId = req.user.userId; // userId from JWT is the Officer_ID
    }
    // If role is ADMIN or not set, don't filter (show all crimes)
    // This allows for future admin functionality

    const crimes = await listAllCrimes(filters);
    res.json({ data: safeClone(crimes) });
  } catch (err) {
    console.error("Error fetching crimes:", err);
    res.status(500).json({ message: "Error fetching crimes", error: err.message });
  }
}

/**
 * Get crime by ID with full details
 */
async function getCrime(req, res) {
  try {
    const crimeId = parseInt(req.params.id);
    const crimeData = await getCrimeById(crimeId);
    if (!crimeData) {
      return res.status(404).json({ message: "Crime not found" });
    }
    res.json({ data: crimeData });
  } catch (err) {
    console.error("Error fetching crime:", err);
    res.status(500).json({ message: "Error fetching crime", error: err.message });
  }
}

/**
 * Create a new crime (Officer only)
 * Auto-assigns officerId from logged-in user
 * Accepts human-friendly inputs:
 * - crimeTypeName (e.g., "Street Theft") OR crimeTypeId
 * - location details (city, area, street) OR locationId
 */
async function addCrime(req, res) {
  try {
    console.log('🔍 addCrime called with body:', req.body);
    console.log('👮 User from JWT:', req.user);
    
    // Auto-assign officerId from logged-in user
    const crimeData = {
      ...req.body,
      officerId: req.user.userId, // From JWT token
    };
    
    console.log('📝 Creating crime with data:', crimeData);
    const result = await createCrime(crimeData);
    console.log('✅ Crime created, result:', result);
    
    res.status(201).json({ 
      message: "Crime created successfully",
      crimeId: result.crimeId
    });
  } catch (err) {
    console.error("❌ Error creating crime:", err);
    console.error("Stack trace:", err.stack);
    res.status(500).json({ message: "Error creating crime", error: err.message });
  }
}

/**
 * Update a crime (Officer only)
 */
async function updateCrimeHandler(req, res) {
  try {
    const crimeId = parseInt(req.params.id);
    const result = await updateCrime(crimeId, req.body);
    if (result.rowsAffected > 0) {
      res.json({ message: "Crime updated successfully" });
    } else {
      res.status(404).json({ message: "Crime not found" });
    }
  } catch (err) {
    console.error("Error updating crime:", err);
    res.status(500).json({ message: "Error updating crime", error: err.message });
  }
}

/**
 * Delete a crime (Officer only)
 */
async function deleteCrimeHandler(req, res) {
  try {
    const crimeId = parseInt(req.params.id);
    const result = await deleteCrime(crimeId);
    if (result.rowsAffected > 0) {
      res.json({ message: "Crime deleted successfully" });
    } else {
      res.status(404).json({ message: "Crime not found" });
    }
  } catch (err) {
    console.error("Error deleting crime:", err);
    res.status(500).json({ message: "Error deleting crime", error: err.message });
  }
}

/**
 * Link suspect to crime (Officer only)
 */
async function linkSuspect(req, res) {
  try {
    const crimeId = parseInt(req.params.id);
    const { suspectId, role, arrestStatus } = req.body;
    await linkSuspectToCrime(crimeId, suspectId, role, arrestStatus);
    res.status(201).json({ message: "Suspect linked to crime successfully" });
  } catch (err) {
    console.error("Error linking suspect:", err);
    res.status(500).json({ message: "Error linking suspect", error: err.message });
  }
}

/**
 * Link victim to crime (Officer only)
 */
async function linkVictim(req, res) {
  try {
    const crimeId = parseInt(req.params.id);
    const { victimId, injurySeverity } = req.body;
    await linkVictimToCrime(crimeId, victimId, injurySeverity);
    res.status(201).json({ message: "Victim linked to crime successfully" });
  } catch (err) {
    console.error("Error linking victim:", err);
    res.status(500).json({ message: "Error linking victim", error: err.message });
  }
}

/**
 * Link witness to crime (Officer only)
 */
async function linkWitness(req, res) {
  try {
    const crimeId = parseInt(req.params.id);
    const { witnessId, statementDate, statementText, isKeyWitness } = req.body;
    await linkWitnessToCrime(crimeId, witnessId, statementDate, statementText, isKeyWitness);
    res.status(201).json({ message: "Witness linked to crime successfully" });
  } catch (err) {
    console.error("Error linking witness:", err);
    res.status(500).json({ message: "Error linking witness", error: err.message });
  }
}

/**
 * Update witness statement (Officer only)
 */
async function updateWitness(req, res) {
  try {
    const crimeId = parseInt(req.params.id);
    const witnessId = parseInt(req.params.witnessId);
    const { statementDate, statementText, isKeyWitness } = req.body;
    await updateWitnessStatement(crimeId, witnessId, statementDate, statementText, isKeyWitness);
    res.json({ message: "Witness statement updated successfully" });
  } catch (err) {
    console.error("Error updating witness statement:", err);
    res.status(500).json({ message: "Error updating witness statement", error: err.message });
  }
}

/**
 * Unlink witness from crime (Officer only)
 */
async function unlinkWitness(req, res) {
  try {
    const crimeId = parseInt(req.params.id);
    const witnessId = parseInt(req.params.witnessId);
    const result = await unlinkWitnessFromCrime(crimeId, witnessId);
    if (result.rowsAffected > 0) {
      res.json({ message: "Witness unlinked from crime successfully" });
    } else {
      res.status(404).json({ message: "Witness not found linked to this crime" });
    }
  } catch (err) {
    console.error("Error unlinking witness:", err);
    res.status(500).json({ message: "Error unlinking witness", error: err.message });
  }
}

module.exports = {
  getAllCrimes,
  getCrime,
  addCrime,
  updateCrimeHandler,
  deleteCrimeHandler,
  linkSuspect,
  linkVictim,
  linkWitness,
  updateWitness,
  unlinkWitness,
};

