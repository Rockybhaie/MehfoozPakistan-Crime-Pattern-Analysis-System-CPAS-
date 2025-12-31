const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

/**
 * Gets all suspects with optional filters
 * @param {Object} filters - Optional filters (status, hasCriminalRecord, searchName)
 * @returns {Promise<Array>} Array of suspect records
 */
async function listAllSuspects(filters = {}) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    let sql = `
      SELECT 
        Suspect_ID,
        Name,
        Gender,
        Age,
        Address,
        Criminal_Record,
        Status
      FROM Suspect
      WHERE 1=1
    `;
    const binds = {};

    if (filters.status) {
      sql += " AND Status = :status";
      binds.status = filters.status;
    }
    if (filters.hasCriminalRecord !== undefined) {
      sql += " AND Criminal_Record = :hasCriminalRecord";
      binds.hasCriminalRecord = filters.hasCriminalRecord ? 1 : 0;
    }
    if (filters.searchName) {
      sql += " AND UPPER(Name) LIKE UPPER(:searchName)";
      binds.searchName = `%${filters.searchName}%`;
    }

    sql += " ORDER BY Name";

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
 * Gets suspect by ID with crime history
 * @param {number} suspectId - The suspect ID
 * @returns {Promise<Object>} Suspect record with crime history
 */
async function getSuspectById(suspectId) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    
    // Get suspect details
    const suspectResult = await conn.execute(
      `SELECT * FROM Suspect WHERE Suspect_ID = :suspectId`,
      { suspectId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (suspectResult.rows.length === 0) {
      return null;
    }

    // Get crime history using window function for ranking
    const crimesResult = await conn.execute(
      `SELECT 
        c.Crime_ID,
        c.Date_Occurred,
        c.Description,
        c.Status,
        ct.Type_Name AS Crime_Type,
        cs.Role,
        cs.Arrest_Status,
        ROW_NUMBER() OVER (ORDER BY c.Date_Occurred DESC) AS Crime_Number
      FROM Crime_Suspect cs
      JOIN Crime c ON cs.Crime_ID = c.Crime_ID
      LEFT JOIN Crime_Type ct ON c.Crime_Type_ID = ct.Crime_Type_ID
      WHERE cs.Suspect_ID = :suspectId
      ORDER BY c.Date_Occurred DESC`,
      { suspectId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return {
      suspect: suspectResult.rows[0],
      crimeHistory: crimesResult.rows,
    };
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

/**
 * Creates a new suspect
 * @param {Object} suspectData - The suspect data
 */
async function createSuspect(suspectData) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    await conn.execute(
      `INSERT INTO Suspect (Name, Gender, Age, Address, Criminal_Record, Status)
       VALUES (:name, :gender, :age, :address, :criminalRecord, :status)`,
      {
        name: suspectData.name,
        gender: suspectData.gender || null,
        age: suspectData.age || null,
        address: suspectData.address || null,
        criminalRecord: suspectData.criminalRecord ? 1 : 0,
        status: suspectData.status || "Unknown",
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
 * Updates a suspect
 * @param {number} suspectId - The suspect ID
 * @param {Object} updateData - The update data
 */
async function updateSuspect(suspectId, updateData) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    let fieldsToUpdate = [];
    let values = { suspectId };

    if (updateData.name) {
      fieldsToUpdate.push("Name = :name");
      values.name = updateData.name;
    }
    if (updateData.gender) {
      fieldsToUpdate.push("Gender = :gender");
      values.gender = updateData.gender;
    }
    if (updateData.age) {
      fieldsToUpdate.push("Age = :age");
      values.age = updateData.age;
    }
    if (updateData.address) {
      fieldsToUpdate.push("Address = :address");
      values.address = updateData.address;
    }
    if (updateData.status) {
      fieldsToUpdate.push("Status = :status");
      values.status = updateData.status;
    }
    if (updateData.criminalRecord !== undefined) {
      fieldsToUpdate.push("Criminal_Record = :criminalRecord");
      values.criminalRecord = updateData.criminalRecord ? 1 : 0;
    }

    if (fieldsToUpdate.length === 0) {
      throw new Error("No fields provided to update");
    }

    const sql = `UPDATE Suspect SET ${fieldsToUpdate.join(", ")} WHERE Suspect_ID = :suspectId`;
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
 * Deletes a suspect
 * @param {number} suspectId - The suspect ID
 */
async function deleteSuspect(suspectId) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `DELETE FROM Suspect WHERE Suspect_ID = :suspectId`,
      { suspectId },
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

module.exports = {
  listAllSuspects,
  getSuspectById,
  createSuspect,
  updateSuspect,
  deleteSuspect,
};

