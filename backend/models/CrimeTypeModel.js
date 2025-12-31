const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

/**
 * Gets all crime types
 * @returns {Promise<Array>} Array of crime type records
 */
async function listAllCrimeTypes() {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `SELECT * FROM Crime_Type ORDER BY Type_Name`,
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
 * Gets crime type by ID
 * @param {number} crimeTypeId - The crime type ID
 * @returns {Promise<Array>} Crime type record
 */
async function getCrimeTypeById(crimeTypeId) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `SELECT * FROM Crime_Type WHERE Crime_Type_ID = :crimeTypeId`,
      { crimeTypeId },
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
 * Creates a new crime type
 * @param {Object} crimeTypeData - The crime type data
 */
async function createCrimeType(crimeTypeData) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    await conn.execute(
      `INSERT INTO Crime_Type (Type_Name, Category, Description)
       VALUES (:typeName, :category, :description)`,
      {
        typeName: crimeTypeData.typeName,
        category: crimeTypeData.category,
        description: crimeTypeData.description || null,
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
 * Updates a crime type
 * @param {number} crimeTypeId - The crime type ID
 * @param {Object} updateData - The update data
 */
async function updateCrimeType(crimeTypeId, updateData) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    let fieldsToUpdate = [];
    let values = { crimeTypeId };

    if (updateData.typeName) {
      fieldsToUpdate.push("Type_Name = :typeName");
      values.typeName = updateData.typeName;
    }
    if (updateData.category) {
      fieldsToUpdate.push("Category = :category");
      values.category = updateData.category;
    }
    if (updateData.description) {
      fieldsToUpdate.push("Description = :description");
      values.description = updateData.description;
    }

    if (fieldsToUpdate.length === 0) {
      throw new Error("No fields provided to update");
    }

    const sql = `UPDATE Crime_Type SET ${fieldsToUpdate.join(", ")} WHERE Crime_Type_ID = :crimeTypeId`;
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
 * Deletes a crime type
 * @param {number} crimeTypeId - The crime type ID
 */
async function deleteCrimeType(crimeTypeId) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `DELETE FROM Crime_Type WHERE Crime_Type_ID = :crimeTypeId`,
      { crimeTypeId },
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
 * Finds crime type by name (case-insensitive)
 * @param {string} typeName - The crime type name
 * @returns {Promise<Object|null>} Crime type record if found, null otherwise
 */
async function findCrimeTypeByName(typeName) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `SELECT * FROM Crime_Type WHERE UPPER(Type_Name) = UPPER(:typeName)`,
      { typeName }
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

module.exports = {
  listAllCrimeTypes,
  getCrimeTypeById,
  createCrimeType,
  updateCrimeType,
  deleteCrimeType,
  findCrimeTypeByName,
};

