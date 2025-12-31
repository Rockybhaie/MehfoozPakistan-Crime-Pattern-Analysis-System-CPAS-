const oracledb = require("oracledb");

/**
 * Finds an officer by email for authentication
 * @param {string} email - The officer's email
 * @returns {Promise<Array>} The officer record if found
 */
async function findOfficerByEmail(email) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `SELECT Officer_ID, Name, Email, Contact_No, Password FROM Officer WHERE Email = :email`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_ARRAY }  // Ensure array format
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
 * Gets all officers
 * @returns {Promise<Array>} Array of officer records
 */
async function listAllOfficers() {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `SELECT Officer_ID, Name, Email, Contact_No FROM Officer ORDER BY Officer_ID`
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
 * Gets officer by ID
 * @param {number} officerId - The officer ID
 * @returns {Promise<Array>} The officer record
 */
async function getOfficerById(officerId) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `SELECT Officer_ID, Name, Email, Contact_No FROM Officer WHERE Officer_ID = :officerId`,
      { officerId }
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
 * Creates a new officer
 * @param {Object} officerData - The officer data
 */
async function createOfficer(officerData) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    await conn.execute(
      `INSERT INTO Officer (Name, Email, Contact_No, Password) VALUES (:name, :email, :contactNo, :password)`,
      {
        name: officerData.name,
        email: officerData.email,
        contactNo: officerData.contactNo || null,
        password: officerData.password,
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
 * Updates officer password
 * @param {number} officerId - The officer ID
 * @param {string} hashedPassword - The hashed password
 */
async function updateOfficerPassword(officerId, hashedPassword) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    await conn.execute(
      `UPDATE Officer SET Password = :password WHERE Officer_ID = :officerId`,
      { password: hashedPassword, officerId },
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
  findOfficerByEmail,
  listAllOfficers,
  getOfficerById,
  createOfficer,
  updateOfficerPassword,
};

