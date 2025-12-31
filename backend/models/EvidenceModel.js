const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

/**
 * Gets all evidence with optional filters
 * @param {Object} filters - Optional filters (crimeId, type, collectedBy)
 * @returns {Promise<Array>} Array of evidence records
 */
async function listAllEvidence(filters = {}) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    let sql = `
      SELECT 
        e.Evidence_ID,
        e.Crime_ID,
        e.Type,
        e.Description,
        e.Date_Collected,
        e.Collected_By,
        o.Name AS Collected_By_Name,
        c.Description AS Crime_Description,
        c.Date_Occurred,
        c.Status AS Crime_Status
      FROM Evidence e
      LEFT JOIN Officer o ON e.Collected_By = o.Officer_ID
      LEFT JOIN Crime c ON e.Crime_ID = c.Crime_ID
      WHERE 1=1
    `;
    const binds = {};

    if (filters.crimeId) {
      sql += " AND e.Crime_ID = :crimeId";
      binds.crimeId = filters.crimeId;
    }
    if (filters.type) {
      sql += " AND e.Type = :type";
      binds.type = filters.type;
    }
    if (filters.collectedBy) {
      sql += " AND e.Collected_By = :collectedBy";
      binds.collectedBy = filters.collectedBy;
    }

    sql += " ORDER BY e.Date_Collected DESC";

    const result = await conn.execute(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
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
 * Gets evidence by ID
 * @param {number} evidenceId - The evidence ID
 * @returns {Promise<Array>} Evidence record
 */
async function getEvidenceById(evidenceId) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `SELECT 
        e.*,
        o.Name AS Collected_By_Name,
        c.Description AS Crime_Description,
        c.Status AS Crime_Status
      FROM Evidence e
      LEFT JOIN Officer o ON e.Collected_By = o.Officer_ID
      LEFT JOIN Crime c ON e.Crime_ID = c.Crime_ID
      WHERE e.Evidence_ID = :evidenceId`,
      { evidenceId },
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
 * Creates new evidence
 * @param {Object} evidenceData - The evidence data
 */
async function createEvidence(evidenceData) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    
    // Convert date string to JavaScript Date object for Oracle compatibility
    let dateValue = evidenceData.dateCollected;
    if (dateValue && typeof dateValue === 'string') {
      dateValue = new Date(dateValue + 'T00:00:00');
    } else if (!dateValue) {
      dateValue = new Date();
    }
    
    console.log('📦 Evidence Model - Creating with data:', {
      crimeId: evidenceData.crimeId,
      type: evidenceData.type,
      description: evidenceData.description,
      collectedBy: evidenceData.collectedBy,
      dateCollected: dateValue,
    });
    
    await conn.execute(
      `INSERT INTO Evidence (Crime_ID, Type, Description, Collected_By, Date_Collected)
       VALUES (:crimeId, :type, :description, :collectedBy, :dateCollected)`,
      {
        crimeId: evidenceData.crimeId,
        type: evidenceData.type,
        description: evidenceData.description,
        collectedBy: evidenceData.collectedBy || null,
        dateCollected: dateValue,
      },
      { autoCommit: true }
    );
    console.log('✅ Evidence created successfully');
  } catch (err) {
    console.error('❌ Evidence Model Error:', err.message);
    throw err;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

/**
 * Updates evidence
 * @param {number} evidenceId - The evidence ID
 * @param {Object} updateData - The update data
 */
async function updateEvidence(evidenceId, updateData) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    let fieldsToUpdate = [];
    let values = { evidenceId };

    if (updateData.type) {
      fieldsToUpdate.push("Type = :type");
      values.type = updateData.type;
    }
    if (updateData.description) {
      fieldsToUpdate.push("Description = :description");
      values.description = updateData.description;
    }
    if (updateData.dateCollected) {
      fieldsToUpdate.push("Date_Collected = :dateCollected");
      // Convert date string to JavaScript Date object for Oracle compatibility
      if (typeof updateData.dateCollected === 'string') {
        values.dateCollected = new Date(updateData.dateCollected + 'T00:00:00');
      } else {
        values.dateCollected = updateData.dateCollected;
      }
    }

    if (fieldsToUpdate.length === 0) {
      throw new Error("No fields provided to update");
    }

    const sql = `UPDATE Evidence SET ${fieldsToUpdate.join(", ")} WHERE Evidence_ID = :evidenceId`;
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
 * Deletes evidence
 * @param {number} evidenceId - The evidence ID
 */
async function deleteEvidence(evidenceId) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `DELETE FROM Evidence WHERE Evidence_ID = :evidenceId`,
      { evidenceId },
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
 * Updates evidence chain of custody using stored procedure
 * @param {number} evidenceId - The evidence ID
 * @param {number} officerId - The officer ID performing the action
 * @param {string} action - The action type: 'COLLECTED', 'TRANSFERRED', 'ANALYZED'
 * @param {string} notes - Additional notes about the action
 */
async function updateEvidenceChain(evidenceId, officerId, action, notes) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    
    // Validate action type
    const validActions = ['COLLECTED', 'TRANSFERRED', 'ANALYZED'];
    if (!validActions.includes(action.toUpperCase())) {
      throw new Error(`Invalid action. Must be one of: ${validActions.join(', ')}`);
    }
    
    // Call stored procedure
    await conn.execute(
      `BEGIN
        sp_update_evidence_chain(:evidenceId, :officerId, :action, :notes);
      END;`,
      {
        evidenceId,
        officerId,
        action: action.toUpperCase(),
        notes: notes || ''
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

module.exports = {
  listAllEvidence,
  getEvidenceById,
  createEvidence,
  updateEvidence,
  deleteEvidence,
  updateEvidenceChain,
};

