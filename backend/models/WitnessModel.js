const oracledb = require("oracledb");

/**
 * Gets all witnesses
 * @returns {Promise<Array>} All witness records
 */
async function getAllWitnesses() {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `SELECT Witness_ID, Name, Contact_Info, Address, Email FROM Witness ORDER BY Name`,
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
 * Finds a witness by email for authentication
 * @param {string} email - The witness's email
 * @returns {Promise<Array>} The witness record if found
 */
async function findWitnessByEmail(email) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `SELECT Witness_ID, Name, Contact_Info, Address, Email, Password FROM Witness WHERE Email = :email`,
      { email },
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
 * Gets witness by ID
 * @param {number} witnessId - The witness ID
 * @returns {Promise<Array>} The witness record
 */
async function getWitnessById(witnessId) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `SELECT Witness_ID, Name, Contact_Info, Address, Email FROM Witness WHERE Witness_ID = :witnessId`,
      { witnessId },
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
 * Creates a new witness (registration)
 * @param {Object} witnessData - The witness data
 */
async function createWitness(witnessData) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    await conn.execute(
      `INSERT INTO Witness (Name, Contact_Info, Address, Email, Password) 
       VALUES (:name, :contactInfo, :address, :email, :password)`,
      {
        name: witnessData.name,
        contactInfo: witnessData.contactInfo || null,
        address: witnessData.address || null,
        email: witnessData.email,
        password: witnessData.password,
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
 * Updates witness profile
 * @param {number} witnessId - The witness ID
 * @param {Object} updateData - The update data
 */
async function updateWitness(witnessId, updateData) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    let fieldsToUpdate = [];
    let values = { witnessId };

    if (updateData.name) {
      fieldsToUpdate.push("Name = :name");
      values.name = updateData.name;
    }
    if (updateData.contactInfo) {
      fieldsToUpdate.push("Contact_Info = :contactInfo");
      values.contactInfo = updateData.contactInfo;
    }
    if (updateData.address) {
      fieldsToUpdate.push("Address = :address");
      values.address = updateData.address;
    }

    if (fieldsToUpdate.length === 0) {
      throw new Error("No fields provided to update");
    }

    const sql = `UPDATE Witness SET ${fieldsToUpdate.join(", ")} WHERE Witness_ID = :witnessId`;
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
 * Updates witness password
 * @param {number} witnessId - The witness ID
 * @param {string} hashedPassword - The hashed password
 */
async function updateWitnessPassword(witnessId, hashedPassword) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    await conn.execute(
      `UPDATE Witness SET Password = :password WHERE Witness_ID = :witnessId`,
      { password: hashedPassword, witnessId },
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
 * Gets crimes that a witness is linked to
 * @param {number} witnessId - The witness ID
 * @returns {Promise<Array>} Array of crimes with witness statements
 */
async function getCrimesForWitness(witnessId) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `SELECT 
        c.Crime_ID,
        c.Crime_Type_ID,
        ct.Type_Name,
        ct.Category,
        TO_CHAR(c.Date_Occurred, 'YYYY-MM-DD') AS Date_Occurred,
        c.Time_Occurred,
        c.Description,
        c.Status,
        c.Severity_Level,
        l.City,
        l.Area,
        l.Street,
        o.Name AS Officer_Name,
        cw.Statement_Date,
        cw.Statement_Text,
        cw.Is_Key_Witness
      FROM Crime_Witness cw
      JOIN Crime c ON cw.Crime_ID = c.Crime_ID
      LEFT JOIN Crime_Type ct ON c.Crime_Type_ID = ct.Crime_Type_ID
      LEFT JOIN Location l ON c.Location_ID = l.Location_ID
      LEFT JOIN Officer o ON c.Officer_ID = o.Officer_ID
      WHERE cw.Witness_ID = :witnessId
      ORDER BY c.Date_Occurred DESC`,
      { witnessId },
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

module.exports = {
  getAllWitnesses,
  findWitnessByEmail,
  getWitnessById,
  createWitness,
  updateWitness,
  updateWitnessPassword,
  getCrimesForWitness,
};

