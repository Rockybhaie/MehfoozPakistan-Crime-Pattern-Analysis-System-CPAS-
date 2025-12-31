const {
  listAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} = require("../models/LocationModel");

/**
 * Get all locations
 */
async function getAllLocations(req, res) {
  try {
    const locations = await listAllLocations();
    res.json({ data: locations });
  } catch (err) {
    console.error("Error fetching locations:", err);
    res.status(500).json({ message: "Error fetching locations", error: err.message });
  }
}

/**
 * Get location by ID
 */
async function getLocation(req, res) {
  try {
    const locationId = parseInt(req.params.id);
    const location = await getLocationById(locationId);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }
    res.json({ data: location });
  } catch (err) {
    console.error("Error fetching location:", err);
    res.status(500).json({ message: "Error fetching location", error: err.message });
  }
}

/**
 * Create a new location (Officer only)
 */
async function addLocation(req, res) {
  try {
    const { city, area, street } = req.body;

    // Mandatory field check
    if (!city || !area || !street) {
      return res.status(400).json({
        message: "City, Area, and Street are required"
      });
    }

    // Optional fields default to null
    req.body.latitude = req.body.latitude || null;
    req.body.longitude = req.body.longitude || null;
    await createLocation(req.body);

    res.status(201).json({ message: "Location created successfully" });
  } catch (err) {
    console.error("Error creating location:", err);
    res.status(500).json({ message: "Error creating location", error: err.message });
  }
}

/**
 * Update a location (Officer only)
 */
async function updateLocationHandler(req, res) {
  try {
    const locationId = parseInt(req.params.id);
    await updateLocation(locationId, req.body);
    res.json({ message: "Location updated successfully" });
  } catch (err) {
    console.error("Error updating location:", err);
    res.status(500).json({ message: "Error updating location", error: err.message });
  }
}

/**
 * Delete a location (Officer only)
 */
async function deleteLocationHandler(req, res) {
  try {
    const locationId = parseInt(req.params.id);
    const result = await deleteLocation(locationId);
    if (result.rowsAffected > 0) {
      res.json({ message: "Location deleted successfully" });
    } else {
      res.status(404).json({ message: "Location not found" });
    }
  } catch (err) {
    console.error("Error deleting location:", err);
    res.status(500).json({ message: "Error deleting location", error: err.message });
  }
}

module.exports = {
  getAllLocations,
  getLocation,
  addLocation,
  updateLocationHandler,
  deleteLocationHandler,
};
