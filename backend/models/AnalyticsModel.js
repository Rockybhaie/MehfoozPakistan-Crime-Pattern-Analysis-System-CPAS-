const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

/**
 * Gets crime trends using window functions
 * @param {Object} filters - Optional filters (year, month, crimeTypeId)
 * @returns {Promise<Array>} Crime trends data
 */
async function getCrimeTrends(filters = {}) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    let sql = `
      SELECT 
        ct.Type_Name AS Crime_Type,
        EXTRACT(YEAR FROM c.Date_Occurred) AS Year,
        EXTRACT(MONTH FROM c.Date_Occurred) AS Month,
        COUNT(*) AS Total_Crimes,
        SUM(COUNT(*)) OVER (PARTITION BY ct.Type_Name ORDER BY EXTRACT(YEAR FROM c.Date_Occurred), EXTRACT(MONTH FROM c.Date_Occurred)) AS Cumulative_Crimes,
        LAG(COUNT(*)) OVER (PARTITION BY ct.Type_Name ORDER BY EXTRACT(YEAR FROM c.Date_Occurred), EXTRACT(MONTH FROM c.Date_Occurred)) AS Previous_Month_Crimes,
        ROUND(
          (COUNT(*) - LAG(COUNT(*)) OVER (PARTITION BY ct.Type_Name ORDER BY EXTRACT(YEAR FROM c.Date_Occurred), EXTRACT(MONTH FROM c.Date_Occurred))) * 100.0 / 
          NULLIF(LAG(COUNT(*)) OVER (PARTITION BY ct.Type_Name ORDER BY EXTRACT(YEAR FROM c.Date_Occurred), EXTRACT(MONTH FROM c.Date_Occurred)), 0),
          2
        ) AS Month_Over_Month_Change
      FROM Crime c
      JOIN Crime_Type ct ON c.Crime_Type_ID = ct.Crime_Type_ID
      WHERE 1=1
    `;
    const binds = {};

    if (filters.year) {
      sql += " AND EXTRACT(YEAR FROM c.Date_Occurred) = :year";
      binds.year = filters.year;
    }
    if (filters.month) {
      sql += " AND EXTRACT(MONTH FROM c.Date_Occurred) = :month";
      binds.month = filters.month;
    }
    if (filters.crimeTypeId) {
      sql += " AND c.Crime_Type_ID = :crimeTypeId";
      binds.crimeTypeId = filters.crimeTypeId;
    }

    sql += `
      GROUP BY ct.Type_Name, EXTRACT(YEAR FROM c.Date_Occurred), EXTRACT(MONTH FROM c.Date_Occurred)
      ORDER BY ct.Type_Name, EXTRACT(YEAR FROM c.Date_Occurred), EXTRACT(MONTH FROM c.Date_Occurred)
    `;

    const result = await conn.execute(sql, binds);
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
 * Gets crime hotspots with ranking
 * @param {number} limit - Number of top hotspots to return
 * @returns {Promise<Array>} Crime hotspots data
 */
async function getCrimeHotspots(limit = 20) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `SELECT 
        l.Location_ID,
        l.City,
        l.Area,
        l.Street,
        COUNT(c.Crime_ID) AS Total_Crimes,
        SUM(CASE WHEN c.Status = 'Closed' THEN 1 ELSE 0 END) AS Solved_Cases,
        ROUND(SUM(CASE WHEN c.Status = 'Closed' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(c.Crime_ID), 0), 2) AS Solve_Rate,
        RANK() OVER (ORDER BY COUNT(c.Crime_ID) DESC) AS Crime_Rank,
        DENSE_RANK() OVER (ORDER BY COUNT(c.Crime_ID) DESC) AS Dense_Crime_Rank
      FROM Location l
      LEFT JOIN Crime c ON l.Location_ID = c.Location_ID
      GROUP BY l.Location_ID, l.City, l.Area, l.Street
      HAVING COUNT(c.Crime_ID) > 0
      ORDER BY Total_Crimes DESC
      FETCH FIRST :limit ROWS ONLY`,
      { limit }
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
 * Gets crime patterns by day of week and time
 * @returns {Promise<Array>} Crime patterns data
 */
async function getCrimePatterns() {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `SELECT 
        ct.Type_Name AS Crime_Type,
        c.Day_Of_Week,
        COUNT(*) AS Total_Incidents,
        AVG(EXTRACT(HOUR FROM c.Time_Occurred)) AS Avg_Hour_Of_Day,
        RANK() OVER (PARTITION BY ct.Type_Name ORDER BY COUNT(*) DESC) AS Day_Rank
      FROM Crime c
      JOIN Crime_Type ct ON c.Crime_Type_ID = ct.Crime_Type_ID
      WHERE c.Day_Of_Week IS NOT NULL
      GROUP BY ct.Type_Name, c.Day_Of_Week
      ORDER BY ct.Type_Name, Total_Incidents DESC
    `);
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
 * Gets category distribution with percentages
 * @returns {Promise<Array>} Category distribution data
 */
async function getCategoryDistribution() {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `SELECT 
        ct.Category,
        COUNT(*) AS Total_Crimes,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Crime), 2) AS Percentage,
        SUM(COUNT(*)) OVER (ORDER BY COUNT(*) DESC) AS Cumulative_Count,
        RANK() OVER (ORDER BY COUNT(*) DESC) AS Category_Rank
      FROM Crime c
      JOIN Crime_Type ct ON c.Crime_Type_ID = ct.Crime_Type_ID
      GROUP BY ct.Category
      ORDER BY Total_Crimes DESC
    `);
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
 * Gets officer performance statistics
 * @returns {Promise<Array>} Officer performance data
 */
async function getOfficerPerformance() {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(
      `SELECT 
        o.Officer_ID,
        o.Name AS Officer_Name,
        COUNT(DISTINCT c.Crime_ID) AS Total_Crimes_Assigned,
        COUNT(DISTINCT CASE WHEN c.Status = 'Closed' THEN c.Crime_ID END) AS Solved_Crimes,
        ROUND(COUNT(DISTINCT CASE WHEN c.Status = 'Closed' THEN c.Crime_ID END) * 100.0 / 
              NULLIF(COUNT(DISTINCT c.Crime_ID), 0), 2) AS Solve_Rate,
        COUNT(DISTINCT i.Investigation_ID) AS Investigations_Lead,
        RANK() OVER (ORDER BY COUNT(DISTINCT CASE WHEN c.Status = 'Closed' THEN c.Crime_ID END) DESC) AS Performance_Rank
      FROM Officer o
      LEFT JOIN Crime c ON o.Officer_ID = c.Officer_ID
      LEFT JOIN Investigation i ON o.Officer_ID = i.Lead_Officer_ID
      GROUP BY o.Officer_ID, o.Name
      HAVING COUNT(DISTINCT c.Crime_ID) > 0
      ORDER BY Solved_Crimes DESC
    `);
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
 * Gets time series data for charts
 * @param {Object} filters - Optional filters (startDate, endDate, groupBy)
 * @returns {Promise<Array>} Time series data
 */
async function getTimeSeriesData(filters = {}) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const groupBy = filters.groupBy || "MONTH"; // DAY, WEEK, MONTH, YEAR
    
    let dateFormat;
    if (groupBy === "DAY") {
      dateFormat = "TRUNC(c.Date_Occurred)";
    } else if (groupBy === "WEEK") {
      dateFormat = "TRUNC(c.Date_Occurred, 'IW')";
    } else if (groupBy === "MONTH") {
      dateFormat = "TRUNC(c.Date_Occurred, 'MM')";
    } else {
      dateFormat = "TRUNC(c.Date_Occurred, 'YYYY')";
    }

    let sql = `
      SELECT 
        ${dateFormat} AS Period,
        COUNT(*) AS Total_Crimes,
        SUM(COUNT(*)) OVER (ORDER BY ${dateFormat}) AS Cumulative_Crimes,
        AVG(COUNT(*)) OVER (ORDER BY ${dateFormat} ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS Moving_Avg_7_Periods
      FROM Crime c
      WHERE 1=1
    `;
    const binds = {};

    if (filters.startDate) {
      sql += " AND c.Date_Occurred >= :startDate";
      binds.startDate = filters.startDate;
    }
    if (filters.endDate) {
      sql += " AND c.Date_Occurred <= :endDate";
      binds.endDate = filters.endDate;
    }

    sql += ` GROUP BY ${dateFormat} ORDER BY Period`;

    const result = await conn.execute(sql, binds);
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
 * Gets crime statistics by date range using stored procedure
 * @param {Date} startDate - Start date for statistics
 * @param {Date} endDate - End date for statistics
 * @returns {Promise<Array>} Crime statistics by category
 */
async function getCrimeStatisticsByDateRange(startDate, endDate) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    
    // Call stored procedure with ref cursor
    const result = await conn.execute(
      `BEGIN
        sp_calculate_crime_statistics(:startDate, :endDate, :stats);
      END;`,
      {
        startDate: startDate || new Date(new Date().setMonth(new Date().getMonth() - 6)),
        endDate: endDate || new Date(),
        stats: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
      }
    );
    
    // Fetch all rows from the cursor
    const statsCursor = result.outBinds.stats;
    const statsRows = [];
    let row;
    
    while ((row = await statsCursor.getRow())) {
      statsRows.push({
        Category: row[0],
        Total_Crimes: row[1],
        Solved_Crimes: row[2],
        Solve_Rate: row[3],
        Critical_Percentage: row[4]
      });
    }
    
    await statsCursor.close();
    return statsRows;
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

module.exports = {
  getCrimeTrends,
  getCrimeHotspots,
  getCrimePatterns,
  getCategoryDistribution,
  getOfficerPerformance,
  getTimeSeriesData,
  getCrimeStatisticsByDateRange,
};

