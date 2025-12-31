const oracledb = require("oracledb");
const { findCrimeTypeByName } = require("./CrimeTypeModel");
const { findOrCreateLocation } = require("./LocationModel");

/**
 * Gets all crimes with joins to related tables
 * @param {Object} filters - Optional filters (status, crimeTypeId, locationId, dateFrom, dateTo)
 * @returns {Promise<Array>} Array of crime records
 */
// Ensure CLOBs come back as strings (avoid streaming LOB objects)
oracledb.fetchAsString = [oracledb.CLOB];

async function listAllCrimes(filters = {}) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    let sql = `
      SELECT 
        c.Crime_ID,
        c.Crime_Type_ID,
        ct.Type_Name,
        ct.Category,
        c.Date_Reported,
        c.Date_Occurred,
        c.Time_Occurred,
        c.Day_Of_Week,
        c.Description,
        c.Status,
        c.Severity_Level,
        c.Location_ID,
        l.City,
        l.Area,
        l.Street,
        c.Officer_ID,
        o.Name AS Officer_Name,
        c.Related_Crime_ID
      FROM Crime c
      LEFT JOIN Crime_Type ct ON c.Crime_Type_ID = ct.Crime_Type_ID
      LEFT JOIN Location l ON c.Location_ID = l.Location_ID
      LEFT JOIN Officer o ON c.Officer_ID = o.Officer_ID
      WHERE 1=1
    `;
    const binds = {};

    // CRITICAL: Filter by officer ID if provided (officers should only see their own crimes)
    if (filters.officerId) {
      sql += " AND c.Officer_ID = :officerId";
      binds.officerId = filters.officerId;
    }

    if (filters.status) {
      sql += " AND c.Status = :status";
      binds.status = filters.status;
    }
    if (filters.crimeTypeId) {
      sql += " AND c.Crime_Type_ID = :crimeTypeId";
      binds.crimeTypeId = filters.crimeTypeId;
    }
    if (filters.locationId) {
      sql += " AND c.Location_ID = :locationId";
      binds.locationId = filters.locationId;
    }
    if (filters.dateFrom) {
      sql += " AND c.Date_Occurred >= :dateFrom";
      binds.dateFrom = filters.dateFrom;
    }
    if (filters.dateTo) {
      sql += " AND c.Date_Occurred <= :dateTo";
      binds.dateTo = filters.dateTo;
    }

    sql += " ORDER BY c.Date_Occurred DESC";

    const result = await conn.execute(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    
    // Add display name for better readability
    return result.rows.map(crime => ({
      ...crime,
      CRIME_TITLE: `${crime.TYPE_NAME || 'Unknown Crime'}${crime.CITY ? ' in ' + crime.CITY : ''}${crime.AREA ? ' (' + crime.AREA + ')' : ''} - #${crime.CRIME_ID}`
    }));
    
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

/**
 * Gets crime by ID with full details
 * @param {number} crimeId - The crime ID
 * @returns {Promise<Object>} Crime record with all related data
 */
async function getCrimeById(crimeId) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    
    // Get crime details
    const crimeResult = await conn.execute(
      `SELECT 
        c.*,
        ct.Type_Name,
        ct.Category,
        l.City,
        l.Area,
        l.Street,
        o.Name AS Officer_Name
      FROM Crime c
      LEFT JOIN Crime_Type ct ON c.Crime_Type_ID = ct.Crime_Type_ID
      LEFT JOIN Location l ON c.Location_ID = l.Location_ID
      LEFT JOIN Officer o ON c.Officer_ID = o.Officer_ID
      WHERE c.Crime_ID = :crimeId`,
      { crimeId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (crimeResult.rows.length === 0) {
      return null;
    }

    const crime = crimeResult.rows[0];
    
    // Convert Oracle object keys to camelCase for consistency
    const crimeData = {
      Crime_ID: crime.CRIME_ID,
      Crime_Type_ID: crime.CRIME_TYPE_ID,
      Type_Name: crime.TYPE_NAME,
      Category: crime.CATEGORY,
      Date_Reported: crime.DATE_REPORTED,
      Date_Occurred: crime.DATE_OCCURRED,
      Time_Occurred: crime.TIME_OCCURRED,
      Day_Of_Week: crime.DAY_OF_WEEK,
      Description: crime.DESCRIPTION,
      Status: crime.STATUS,
      Severity_Level: crime.SEVERITY_LEVEL,
      Location_ID: crime.LOCATION_ID,
      City: crime.CITY,
      Area: crime.AREA,
      Street: crime.STREET,
      Officer_ID: crime.OFFICER_ID,
      Officer_Name: crime.OFFICER_NAME,
      Related_Crime_ID: crime.RELATED_CRIME_ID
    };

    // Get suspects
    const suspectsResult = await conn.execute(
      `SELECT 
        s.Suspect_ID,
        s.Name,
        s.Gender,
        s.Age,
        s.Status,
        cs.Role,
        cs.Arrest_Status
      FROM Crime_Suspect cs
      JOIN Suspect s ON cs.Suspect_ID = s.Suspect_ID
      WHERE cs.Crime_ID = :crimeId`,
      { crimeId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Get victims
    const victimsResult = await conn.execute(
      `SELECT 
        v.Victim_ID,
        v.Name,
        v.Age,
        v.Gender,
        cv.Injury_Severity
      FROM Crime_Victim cv
      JOIN Victim v ON cv.Victim_ID = v.Victim_ID
      WHERE cv.Crime_ID = :crimeId`,
      { crimeId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Get witnesses
    const witnessesResult = await conn.execute(
      `SELECT 
        w.Witness_ID,
        w.Name,
        cw.Statement_Date,
        cw.Statement_Text,
        cw.Is_Key_Witness
      FROM Crime_Witness cw
      JOIN Witness w ON cw.Witness_ID = w.Witness_ID
      WHERE cw.Crime_ID = :crimeId`,
      { crimeId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Get evidence
    const evidenceResult = await conn.execute(
      `SELECT 
        e.Evidence_ID,
        e.Type,
        e.Description,
        e.Date_Collected,
        o.Name AS Collected_By_Name
      FROM Evidence e
      LEFT JOIN Officer o ON e.Collected_By = o.Officer_ID
      WHERE e.Crime_ID = :crimeId`,
      { crimeId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return {
      crime: crimeData,
      suspects: suspectsResult.rows.map(s => ({
        Suspect_ID: s.SUSPECT_ID,
        Name: s.NAME,
        Gender: s.GENDER,
        Age: s.AGE,
        Status: s.STATUS,
        Role: s.ROLE,
        Arrest_Status: s.ARREST_STATUS
      })),
      victims: victimsResult.rows.map(v => ({
        Victim_ID: v.VICTIM_ID,
        Name: v.NAME,
        Age: v.AGE,
        Gender: v.GENDER,
        Injury_Severity: v.INJURY_SEVERITY
      })),
      witnesses: witnessesResult.rows.map(w => ({
        Witness_ID: w.WITNESS_ID,
        Name: w.NAME,
        Statement_Date: w.STATEMENT_DATE,
        Statement_Text: w.STATEMENT_TEXT,
        Is_Key_Witness: w.IS_KEY_WITNESS
      })),
      evidence: evidenceResult.rows.map(e => ({
        Evidence_ID: e.EVIDENCE_ID,
        Type: e.TYPE,
        Description: e.DESCRIPTION,
        Date_Collected: e.DATE_COLLECTED,
        Collected_By_Name: e.COLLECTED_BY_NAME
      })),
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
 * Creates a new crime
 * Accepts human-friendly inputs:
 * - crimeTypeName (string) OR crimeTypeId (number) - if name provided, looks up ID
 * - location details (city, area, street) OR locationId - if details provided, finds or creates location
 * - officerId is required (should be passed from controller based on logged-in user)
 * @param {Object} crimeData - The crime data
 */
async function createCrime(crimeData) {
  let conn;
  try {
    // Resolve Crime_Type_ID from name if provided
    let crimeTypeId = crimeData.crimeTypeId;
    if (!crimeTypeId && crimeData.crimeTypeName) {
      try {
        const crimeType = await findCrimeTypeByName(crimeData.crimeTypeName);
        if (crimeType) {
          crimeTypeId = crimeType.CRIME_TYPE_ID || crimeType.Crime_Type_ID;
        }
      } catch (err) {
        console.log(`Crime type lookup failed: ${err.message}`);
      }
      
      // If still no crimeTypeId, try to create or get existing
      if (!crimeTypeId) {
        const tempConn = await oracledb.getConnection();
        try {
          // First check if it exists
          const checkResult = await tempConn.execute(
            `SELECT Crime_Type_ID FROM Crime_Type WHERE UPPER(Type_Name) = UPPER(:typeName)`,
            { typeName: crimeData.crimeTypeName },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
          );
          
          if (checkResult.rows.length > 0) {
            crimeTypeId = checkResult.rows[0].CRIME_TYPE_ID;
            console.log(`Found existing crime type with ID: ${crimeTypeId}`);
          } else {
            // Create new crime type
            console.log(`Creating new crime type: ${crimeData.crimeTypeName}`);
            const insertResult = await tempConn.execute(
              `INSERT INTO Crime_Type (Type_Name, Category) 
               VALUES (:typeName, :category) 
               RETURNING Crime_Type_ID INTO :id`,
              {
                typeName: crimeData.crimeTypeName,
                category: crimeData.category || 'Other',
                id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
              },
              { autoCommit: true }
            );
            crimeTypeId = insertResult.outBinds.id[0];
            console.log(`Created new crime type with ID: ${crimeTypeId}`);
          }
        } finally {
          await tempConn.close();
        }
      }
    }
    if (!crimeTypeId) {
      throw new Error("Either crimeTypeId or crimeTypeName must be provided");
    }

    // Resolve Location_ID from details if provided
    let locationId = crimeData.locationId;
    if (!locationId && crimeData.city) {
      locationId = await findOrCreateLocation({
        city: crimeData.city,
        area: crimeData.area,
        street: crimeData.street
      });
    }

    // Officer_ID is required - should be passed from controller
    if (!crimeData.officerId) {
      throw new Error("Officer ID is required");
    }

    conn = await oracledb.getConnection();
    
    // Format date properly for Oracle
    let dateReported = crimeData.dateReported || new Date();
    if (typeof dateReported === 'string') {
      dateReported = new Date(dateReported);
    }
    
    let dateOccurred = crimeData.dateOccurred;
    if (dateOccurred && typeof dateOccurred === 'string') {
      dateOccurred = new Date(dateOccurred);
    }
    
    // Format time if provided (combine date and time)
    let timeOccurred = null;
    if (crimeData.timeOccurred && dateOccurred) {
      const [hours, minutes] = crimeData.timeOccurred.split(':');
      const timeDate = new Date(dateOccurred);
      timeDate.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);
      timeOccurred = timeDate;
    }
    
    // Get the next Crime_ID from sequence
    const seqResult = await conn.execute(
      `SELECT crime_seq.NEXTVAL AS NEXT_ID FROM DUAL`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const crimeId = seqResult.rows[0].NEXT_ID;

    // Calculate Day_Of_Week from dateOccurred to avoid trigger issues
    let dayOfWeek = crimeData.dayOfWeek;
    if (!dayOfWeek && dateOccurred) {
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      dayOfWeek = daysOfWeek[dateOccurred.getDay()];
    }

    const result = await conn.execute(
      `INSERT INTO Crime (
        Crime_ID, Crime_Type_ID, Date_Reported, Date_Occurred, Time_Occurred,
        Day_Of_Week, Description, Status, Severity_Level,
        Location_ID, Officer_ID, Related_Crime_ID
      ) VALUES (
        :crimeId, :crimeTypeId, :dateReported, :dateOccurred, :timeOccurred,
        :dayOfWeek, :description, :status, :severityLevel,
        :locationId, :officerId, :relatedCrimeId
      )`,
      {
        crimeId,
        crimeTypeId,
        dateReported: dateReported || new Date(),
        dateOccurred: dateOccurred || new Date(),
        timeOccurred: timeOccurred,
        dayOfWeek: dayOfWeek || null,
        description: crimeData.description,
        status: crimeData.status || "Open",
        severityLevel: crimeData.severityLevel || null,
        locationId: locationId || null,
        officerId: crimeData.officerId,
        relatedCrimeId: crimeData.relatedCrimeId || null,
      },
      { autoCommit: true }
    );
    return { ...result, crimeId };
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

/**
 * Updates a crime
 * @param {number} crimeId - The crime ID
 * @param {Object} updateData - The update data
 */
async function updateCrime(crimeId, updateData) {
  let conn;
  try {
    // Resolve Crime_Type_ID from name if provided
    let crimeTypeId = updateData.crimeTypeId;
    if (!crimeTypeId && updateData.crimeTypeName) {
      const { findCrimeTypeByName } = require("./CrimeTypeModel");
      const crimeType = await findCrimeTypeByName(updateData.crimeTypeName);
      if (!crimeType) {
        throw new Error(`Crime type "${updateData.crimeTypeName}" not found`);
      }
      crimeTypeId = crimeType.CRIME_TYPE_ID || crimeType.Crime_Type_ID;
    }

    // Resolve Location_ID from details if provided
    let locationId = updateData.locationId;
    if (!locationId && updateData.city) {
      const { findOrCreateLocation } = require("./LocationModel");
      locationId = await findOrCreateLocation({
        city: updateData.city,
        area: updateData.area,
        street: updateData.street
      });
    }

    conn = await oracledb.getConnection();
    let fieldsToUpdate = [];
    let values = { crimeId };

    if (crimeTypeId) {
      fieldsToUpdate.push("Crime_Type_ID = :crimeTypeId");
      values.crimeTypeId = crimeTypeId;
    }
    // Normalize dates/times to proper Date objects for Oracle
    if (updateData.dateOccurred) {
      let dateOccurred = updateData.dateOccurred;
      if (typeof dateOccurred === "string") {
        dateOccurred = new Date(dateOccurred);
      }
      fieldsToUpdate.push("Date_Occurred = :dateOccurred");
      values.dateOccurred = dateOccurred;
    }
    if (updateData.timeOccurred !== undefined) {
      let timeOccurred = updateData.timeOccurred;
      if (timeOccurred && typeof timeOccurred === "string") {
        // If time provided without date, use today; if date provided, use that date
        const baseDate =
          (values.dateOccurred && new Date(values.dateOccurred)) || new Date();
        const [hours, minutes] = timeOccurred.split(":");
        const timeDate = new Date(baseDate);
        timeDate.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);
        timeOccurred = timeDate;
      } else if (!timeOccurred) {
        timeOccurred = null;
      }
      fieldsToUpdate.push("Time_Occurred = :timeOccurred");
      values.timeOccurred = timeOccurred;
    }
    if (updateData.dayOfWeek) {
      fieldsToUpdate.push("Day_Of_Week = :dayOfWeek");
      values.dayOfWeek = updateData.dayOfWeek;
    }
    if (updateData.status) {
      fieldsToUpdate.push("Status = :status");
      values.status = updateData.status;
    }
    if (updateData.severityLevel !== undefined) {
      fieldsToUpdate.push("Severity_Level = :severityLevel");
      values.severityLevel = updateData.severityLevel || null;
    }
    if (updateData.description) {
      fieldsToUpdate.push("Description = :description");
      values.description = updateData.description;
    }
    if (updateData.officerId) {
      fieldsToUpdate.push("Officer_ID = :officerId");
      values.officerId = updateData.officerId;
    }
    if (locationId !== undefined) {
      fieldsToUpdate.push("Location_ID = :locationId");
      values.locationId = locationId || null;
    }

    if (fieldsToUpdate.length === 0) {
      throw new Error("No fields provided to update");
    }

    const sql = `UPDATE Crime SET ${fieldsToUpdate.join(", ")} WHERE Crime_ID = :crimeId`;
    const result = await conn.execute(sql, values, { autoCommit: true });
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
 * Deletes a crime (cascade will handle related records)
 * @param {number} crimeId - The crime ID
 */
async function deleteCrime(crimeId) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    
    // Manually delete child/bridge records to avoid FK errors
    // Crime_Suspect, Crime_Victim, Crime_Witness, Evidence (if FK), other bridges
    const deleteStatements = [
      { sql: `DELETE FROM Crime_Suspect WHERE Crime_ID = :crimeId`, binds: { crimeId } },
      { sql: `DELETE FROM Crime_Victim WHERE Crime_ID = :crimeId`, binds: { crimeId } },
      { sql: `DELETE FROM Crime_Witness WHERE Crime_ID = :crimeId`, binds: { crimeId } },
      { sql: `DELETE FROM Evidence WHERE Crime_ID = :crimeId`, binds: { crimeId } },
      { sql: `DELETE FROM Investigation_Crimes WHERE Crime_ID = :crimeId`, binds: { crimeId } }, // if exists
    ];

    for (const stmt of deleteStatements) {
      try {
        await conn.execute(stmt.sql, stmt.binds, { autoCommit: false });
      } catch (err) {
        // Ignore if table doesn't exist
        if (err && err.errorNum === 942) {
          continue;
        } else {
          throw err;
        }
      }
    }

    const result = await conn.execute(
      `DELETE FROM Crime WHERE Crime_ID = :crimeId`,
      { crimeId },
      { autoCommit: false }
    );

    await conn.commit();
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
 * Links suspect to crime
 * @param {number} crimeId - The crime ID
 * @param {number} suspectId - The suspect ID
 * @param {string} role - The role (Primary Suspect, Accomplice, Person of Interest)
 * @param {string} arrestStatus - The arrest status
 */
async function linkSuspectToCrime(crimeId, suspectId, role, arrestStatus) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    await conn.execute(
      `INSERT INTO Crime_Suspect (Crime_ID, Suspect_ID, Role, Arrest_Status)
       VALUES (:crimeId, :suspectId, :role, :arrestStatus)`,
      { crimeId, suspectId, role: role || "Person of Interest", arrestStatus: arrestStatus || "Pending" },
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
 * Links victim to crime
 * @param {number} crimeId - The crime ID
 * @param {number} victimId - The victim ID
 * @param {string} injurySeverity - The injury severity
 */
async function linkVictimToCrime(crimeId, victimId, injurySeverity) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    await conn.execute(
      `INSERT INTO Crime_Victim (Crime_ID, Victim_ID, Injury_Severity)
       VALUES (:crimeId, :victimId, :injurySeverity)`,
      { crimeId, victimId, injurySeverity: injurySeverity || "Unknown" },
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
 * Links witness to crime
 * @param {number} crimeId - The crime ID
 * @param {number} witnessId - The witness ID
 * @param {Date} statementDate - The statement date (optional)
 * @param {string} statementText - The statement text (optional)
 * @param {number} isKeyWitness - Whether this is a key witness (0 or 1, default 0)
 */
async function linkWitnessToCrime(crimeId, witnessId, statementDate, statementText, isKeyWitness) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    
    // Convert string date to JavaScript Date object for Oracle
    let dateValue = statementDate;
    if (statementDate && typeof statementDate === 'string') {
      dateValue = new Date(statementDate + 'T00:00:00');
    }
    
    const sql = `INSERT INTO Crime_Witness (Crime_ID, Witness_ID, Statement_Date, Statement_Text, Is_Key_Witness)
                 VALUES (:crimeId, :witnessId, :statementDate, :statementText, :isKeyWitness)`;
    const binds = { 
      crimeId, 
      witnessId, 
      statementDate: dateValue || null,
      statementText: statementText || null,
      isKeyWitness: isKeyWitness ? 1 : 0
    };
    
    await conn.execute(sql, binds, { autoCommit: true });
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

/**
 * Updates witness statement for a crime
 * @param {number} crimeId - The crime ID
 * @param {number} witnessId - The witness ID
 * @param {Date} statementDate - The statement date (optional)
 * @param {string} statementText - The statement text (optional)
 * @param {number} isKeyWitness - Whether this is a key witness (0 or 1, optional)
 */
async function updateWitnessStatement(crimeId, witnessId, statementDate, statementText, isKeyWitness) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    let fieldsToUpdate = [];
    let values = { crimeId, witnessId };

    if (statementDate !== undefined) {
      fieldsToUpdate.push("Statement_Date = :statementDate");
      // Convert string date to JavaScript Date object
      let dateValue = statementDate;
      if (statementDate && typeof statementDate === 'string') {
        dateValue = new Date(statementDate + 'T00:00:00');
      }
      values.statementDate = dateValue || null;
    }
    if (statementText !== undefined) {
      fieldsToUpdate.push("Statement_Text = :statementText");
      values.statementText = statementText || null;
    }
    if (isKeyWitness !== undefined) {
      fieldsToUpdate.push("Is_Key_Witness = :isKeyWitness");
      values.isKeyWitness = isKeyWitness ? 1 : 0;
    }

    if (fieldsToUpdate.length === 0) {
      throw new Error("No fields provided to update");
    }

    const sql = `UPDATE Crime_Witness SET ${fieldsToUpdate.join(", ")} 
                 WHERE Crime_ID = :crimeId AND Witness_ID = :witnessId`;
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
 * Unlinks witness from crime
 * @param {number} crimeId - The crime ID
 * @param {number} witnessId - The witness ID
 */
async function unlinkWitnessFromCrime(crimeId, witnessId) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `DELETE FROM Crime_Witness WHERE Crime_ID = :crimeId AND Witness_ID = :witnessId`,
      { crimeId, witnessId },
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
};