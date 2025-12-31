const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

/**
 * Gets all locations
 * @returns {Promise<Array>} Array of location records
 */
async function listAllLocations() {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `SELECT * FROM Location ORDER BY City, Area`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows;
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

/**
 * Gets location by ID
 * @param {number} locationId - The location ID
 * @returns {Promise<Array>} Location record
 */
async function getLocationById(locationId) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `SELECT * FROM Location WHERE Location_ID = :locationId`,
      { locationId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows[0];
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

/**
 * Creates a new location
 * @param {Object} locationData - The location data
 */
async function createLocation(locationData) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    await conn.execute(
      `INSERT INTO Location (City, Area, Street, Latitude, Longitude)
       VALUES (:city, :area, :street, :latitude, :longitude)`,
      {
        city: locationData.city,
        area: locationData.area || null,
        street: locationData.street || null,
        latitude: locationData.latitude || null,
        longitude: locationData.longitude || null,
      },
      { autoCommit: true }
    );
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

/**
 * Updates a location
 * @param {number} locationId - The location ID
 * @param {Object} updateData - The update data
 */
async function updateLocation(locationId, updateData) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    let fieldsToUpdate = [];
    let values = { locationId };

    if (updateData.city) {
      fieldsToUpdate.push("City = :city");
      values.city = updateData.city;
    }
    if (updateData.area) {
      fieldsToUpdate.push("Area = :area");
      values.area = updateData.area;
    }
    if (updateData.street) {
      fieldsToUpdate.push("Street = :street");
      values.street = updateData.street;
    }
    if (updateData.latitude !== undefined) {
      fieldsToUpdate.push("Latitude = :latitude");
      values.latitude = updateData.latitude;
    }
    if (updateData.longitude !== undefined) {
      fieldsToUpdate.push("Longitude = :longitude");
      values.longitude = updateData.longitude;
    }

    if (fieldsToUpdate.length === 0) {
      throw new Error("No fields provided to update");
    }

    const sql = `UPDATE Location SET ${fieldsToUpdate.join(", ")} WHERE Location_ID = :locationId`;
    await conn.execute(sql, values, { autoCommit: true });
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

/**
 * Deletes a location
 * @param {number} locationId - The location ID
 */
async function deleteLocation(locationId) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `DELETE FROM Location WHERE Location_ID = :locationId`,
      { locationId },
      { autoCommit: true }
    );
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

/**
 * Finds location by city, area, and street (for deduplication)
 * @param {string} city - The city name
 * @param {string} area - The area name (optional)
 * @param {string} street - The street name (optional)
 * @returns {Promise<Object|null>} Location record if found, null otherwise
 */
async function findLocationByDetails(city, area, street) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    let sql = `SELECT * FROM Location WHERE City = :city`;
    const params = { city };
    
    if (area) {
      sql += ` AND (Area = :area OR Area IS NULL)`;
      params.area = area;
    } else {
      sql += ` AND Area IS NULL`;
    }
    
    if (street) {
      sql += ` AND (Street = :street OR Street IS NULL)`;
      params.street = street;
    } else {
      sql += ` AND Street IS NULL`;
    }
    
    const result = await conn.execute(sql, params);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

/**
 * Finds or creates a location based on details
 * Returns the Location_ID
 * @param {Object} locationData - Location details (city, area, street, latitude, longitude)
 * @returns {Promise<number>} Location_ID
 */
async function findOrCreateLocation(locationData) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    
    // First, try to find existing location
    const existing = await findLocationByDetails(
      locationData.city,
      locationData.area,
      locationData.street
    );
    
    if (existing) {
      return existing.LOCATION_ID || existing.Location_ID;
    }
    
    // If not found, create new location and get the ID
    await conn.execute(
      `INSERT INTO Location (City, Area, Street, Latitude, Longitude)
       VALUES (:city, :area, :street, :latitude, :longitude)`,
      {
        city: locationData.city,
        area: locationData.area || null,
        street: locationData.street || null,
        latitude: locationData.latitude || null,
        longitude: locationData.longitude || null,
      },
      { autoCommit: true }
    );
    
    // Query back to get the generated Location_ID (using sequence)
    const result = await conn.execute(
      `SELECT Location_ID FROM Location 
       WHERE City = :city 
       AND (Area = :area OR (Area IS NULL AND :area IS NULL))
       AND (Street = :street OR (Street IS NULL AND :street IS NULL))
       ORDER BY Location_ID DESC
       FETCH FIRST 1 ROW ONLY`,
      {
        city: locationData.city,
        area: locationData.area || null,
        street: locationData.street || null,
      }
    );
    
    if (result.rows.length > 0) {
      return result.rows[0].LOCATION_ID || result.rows[0].Location_ID;
    }
    
    throw new Error("Failed to retrieve created location ID");
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

module.exports = {
  listAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  findLocationByDetails,
  findOrCreateLocation,
};
