const oracledb = require("oracledb");

/**
 * Gets all victims
 * @returns {Promise<Array>} All victim records
 */
async function getAllVictims() {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `SELECT Victim_ID, Name, Age, Gender, Contact_Info, Address, Email FROM Victim ORDER BY Name`,
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
 * Finds a victim by email for authentication
 * @param {string} email - The victim's email
 * @returns {Promise<Object>} The victim record if found
 */
async function findVictimByEmail(email) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `SELECT Victim_ID, Name, Age, Gender, Contact_Info, Address, Email, Password FROM Victim WHERE Email = :email`,
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
 * Gets victim by ID
 * @param {number} victimId - The victim ID
 * @returns {Promise<Object>} The victim record
 */
async function getVictimById(victimId) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `SELECT Victim_ID, Name, Age, Gender, Contact_Info, Address, Email FROM Victim WHERE Victim_ID = :victimId`,
      { victimId },
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
 * Creates a new victim (registration)
 * @param {Object} victimData - The victim data
 */
async function createVictim(victimData) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    await conn.execute(
      `INSERT INTO Victim (Name, Age, Gender, Contact_Info, Address, Email, Password) 
       VALUES (:name, :age, :gender, :contactInfo, :address, :email, :password)`,
      {
        name: victimData.name,
        age: victimData.age || null,
        gender: victimData.gender || null,
        contactInfo: victimData.contactInfo || null,
        address: victimData.address || null,
        email: victimData.email,
        password: victimData.password,
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
 * Updates victim profile
 * @param {number} victimId - The victim ID
 * @param {Object} updateData - The update data
 */
async function updateVictim(victimId, updateData) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    let fieldsToUpdate = [];
    let values = { victimId };

    if (updateData.name) {
      fieldsToUpdate.push("Name = :name");
      values.name = updateData.name;
    }
    if (updateData.age) {
      fieldsToUpdate.push("Age = :age");
      values.age = updateData.age;
    }
    if (updateData.gender) {
      fieldsToUpdate.push("Gender = :gender");
      values.gender = updateData.gender;
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

    const sql = `UPDATE Victim SET ${fieldsToUpdate.join(", ")} WHERE Victim_ID = :victimId`;
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
 * Updates victim password
 * @param {number} victimId - The victim ID
 * @param {string} hashedPassword - The hashed password
 */
async function updateVictimPassword(victimId, hashedPassword) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    await conn.execute(
      `UPDATE Victim SET Password = :password WHERE Victim_ID = :victimId`,
      { password: hashedPassword, victimId },
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
  getAllVictims,
  findVictimByEmail,
  getVictimById,
  createVictim,
  updateVictim,
  updateVictimPassword,
};

