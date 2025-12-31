const oracledb = require("oracledb");
 /* Predicts crime risk for a location using city and area
 * @param {string} city - The city name
 * @param {string} area - The area name (optional)
 * @returns {Promise<Object>} Risk prediction data
 */
async function predictCrimeRisk(city, area = null) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    
    // First, get the location ID from city and area
    let locationQuery = `SELECT Location_ID, City, Area FROM Location WHERE UPPER(City) = UPPER(:city)`;
    const locationBinds = { city };
    
    if (area) {
      locationQuery += ` AND UPPER(Area) = UPPER(:area)`;
      locationBinds.area = area;
    }
    
    const locationResult = await conn.execute(locationQuery, locationBinds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });
    
    if (!locationResult.rows || locationResult.rows.length === 0) {
      throw new Error(`Location not found for city: ${city}${area ? ', area: ' + area : ''}`);
    }
    
    const locationId = locationResult.rows[0].LOCATION_ID;
    const actualCity = locationResult.rows[0].CITY;
    const actualArea = locationResult.rows[0].AREA;
    
    // Calculate risk score based on actual crime data for this location
    const riskQuery = `
      SELECT 
        COUNT(*) AS total_crimes,
        SUM(CASE WHEN Date_Occurred >= SYSDATE - 30 THEN 1 ELSE 0 END) AS recent_crimes,
        ROUND(SUM(CASE WHEN Status = 'Closed' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 2) AS solve_rate,
        SUM(CASE WHEN Severity_Level = 'Critical' THEN 1 ELSE 0 END) AS critical_crimes,
        SUM(CASE WHEN Severity_Level = 'Major' THEN 1 ELSE 0 END) AS major_crimes
      FROM Crime
      WHERE Location_ID = :locationId
    `;
    
    const riskResult = await conn.execute(riskQuery, { locationId }, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });
    
    const stats = riskResult.rows[0];
    const totalCrimes = stats.TOTAL_CRIMES || 0;
    const recentCrimes = stats.RECENT_CRIMES || 0;
    const solveRate = stats.SOLVE_RATE || 0;
    const criticalCrimes = stats.CRITICAL_CRIMES || 0;
    const majorCrimes = stats.MAJOR_CRIMES || 0;
    
    // Calculate risk score (0-100 scale, then convert to 0-10)
    // Factors: total crimes (weight: 2), recent crimes (weight: 10), low solve rate (weight: 1), severe crimes (weight: 3)
    let riskScore = 
      Math.min(totalCrimes * 2, 20) +           // Max 20 points
      Math.min(recentCrimes * 10, 40) +         // Max 40 points  
      Math.min((100 - solveRate), 20) +         // Max 20 points
      Math.min((criticalCrimes * 5 + majorCrimes * 2), 20);  // Max 20 points
    
    // Convert to 0-10 scale
    riskScore = Math.min(Math.round(riskScore / 10), 10);
    
    // Determine risk level
    let riskLevel;
    if (riskScore >= 8) {
      riskLevel = 'HIGH';
    } else if (riskScore >= 5) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }

    return {
      location: {
        city: actualCity,
        area: actualArea || 'All areas',
        location_id: locationId
      },
      risk_assessment: {
        risk_score: riskScore,
        risk_level: riskLevel,
        risk_percentage: Math.min(riskScore * 10, 100),
        severity: riskScore >= 8 ? 'Critical' : riskScore >= 6 ? 'High' : riskScore >= 4 ? 'Moderate' : 'Low'
      },
      statistics: {
        total_crimes: totalCrimes,
        recent_crimes_30_days: recentCrimes,
        solve_rate: solveRate,
        critical_crimes: criticalCrimes,
        major_crimes: majorCrimes
      },
      recommendation: getRiskRecommendation(riskLevel, riskScore),
      timestamp: new Date().toISOString()
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
 * Get recommendation based on risk level
 * @param {string} riskLevel 
 * @param {number} riskScore 
 * @returns {string}
 */
function getRiskRecommendation(riskLevel, riskScore) {
  if (!riskLevel) return 'Insufficient data for recommendation';
  
  const level = riskLevel.toUpperCase();
  
  if (level.includes('HIGH') || riskScore >= 7) {
    return 'Increase patrol frequency, deploy additional officers, and implement preventive measures immediately';
  } else if (level.includes('MEDIUM') || level.includes('MODERATE') || riskScore >= 4) {
    return 'Maintain regular patrol schedule with periodic monitoring and community awareness programs';
  } else {
    return 'Standard patrol protocols sufficient, continue routine monitoring';
  }
}

/**
 * Finds similar crime patterns using window functions and joins
 * @param {Object} patternData - Pattern data to match (crimeType, city, area, dayOfWeek)
 * @returns {Promise<Array>} Similar crime patterns
 */
async function findSimilarPatterns(patternData) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    let sql = `
      WITH PatternAnalysis AS (
        SELECT 
          c.Crime_ID,
          c.Crime_Type_ID,
          c.Location_ID,
          c.Day_Of_Week,
          EXTRACT(HOUR FROM c.Time_Occurred) AS Hour_Of_Day,
          c.Date_Occurred,
          c.Status,
          ROW_NUMBER() OVER (PARTITION BY c.Crime_Type_ID, c.Location_ID, c.Day_Of_Week ORDER BY c.Date_Occurred DESC) AS Pattern_Rank
        FROM Crime c
        WHERE 1=1
    `;
    const binds = {};

    if (patternData.crimeType) {
      sql += ` AND c.Crime_Type_ID = (SELECT Crime_Type_ID FROM Crime_Type WHERE UPPER(Type_Name) = UPPER(:crimeType))`;
      binds.crimeType = patternData.crimeType;
    }
    
    if (patternData.city) {
      sql += ` AND c.Location_ID IN (SELECT Location_ID FROM Location WHERE UPPER(City) = UPPER(:city)`;
      binds.city = patternData.city;
      
      if (patternData.area) {
        sql += ` AND UPPER(Area) = UPPER(:area)`;
        binds.area = patternData.area;
      }
      sql += `)`;
    }
    
    if (patternData.dayOfWeek) {
      sql += " AND c.Day_Of_Week = :dayOfWeek";
      binds.dayOfWeek = patternData.dayOfWeek;
    }

    sql += `
      )
      SELECT 
        pa.Crime_ID AS crime_id,
        ct.Type_Name AS crime_type,
        l.City AS city,
        l.Area AS area,
        pa.Day_Of_Week AS day_of_week,
        pa.Hour_Of_Day AS hour_of_day,
        TO_CHAR(pa.Date_Occurred, 'YYYY-MM-DD') AS date_occurred,
        pa.Status AS status,
        COUNT(*) OVER (PARTITION BY pa.Crime_Type_ID, pa.Location_ID, pa.Day_Of_Week) AS pattern_frequency,
        RANK() OVER (ORDER BY pa.Date_Occurred DESC) AS recency_rank
      FROM PatternAnalysis pa
      JOIN Crime_Type ct ON pa.Crime_Type_ID = ct.Crime_Type_ID
      LEFT JOIN Location l ON pa.Location_ID = l.Location_ID
      WHERE pa.Pattern_Rank <= 10
      ORDER BY pattern_frequency DESC, pa.Date_Occurred DESC
      FETCH FIRST 20 ROWS ONLY
    `;

    const result = await conn.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });
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
 * Forecasts future crime trends using historical data
 * @param {Object} forecastParams - Forecast parameters (months, crimeType, city, area)
 * @returns {Promise<Array>} Forecasted crime data
 */
async function forecastCrimeTrends(forecastParams = {}) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const months = forecastParams.months || 6;
    
    let sql = `
      WITH HistoricalData AS (
        SELECT 
          EXTRACT(YEAR FROM Date_Occurred) AS Year,
          EXTRACT(MONTH FROM Date_Occurred) AS Month,
          COUNT(*) AS Crime_Count,
          AVG(COUNT(*)) OVER (ORDER BY EXTRACT(YEAR FROM Date_Occurred), EXTRACT(MONTH FROM Date_Occurred) 
                              ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS Moving_Avg_3_Months,
          LAG(COUNT(*), 12) OVER (ORDER BY EXTRACT(YEAR FROM Date_Occurred), EXTRACT(MONTH FROM Date_Occurred)) AS Same_Month_Last_Year
        FROM Crime c
        WHERE 1=1
    `;
    const binds = {};

    if (forecastParams.crimeType) {
      sql += ` AND c.Crime_Type_ID = (SELECT Crime_Type_ID FROM Crime_Type WHERE UPPER(Type_Name) = UPPER(:crimeType))`;
      binds.crimeType = forecastParams.crimeType;
    }
    
    if (forecastParams.city) {
      sql += ` AND c.Location_ID IN (SELECT Location_ID FROM Location WHERE UPPER(City) = UPPER(:city)`;
      binds.city = forecastParams.city;
      
      if (forecastParams.area) {
        sql += ` AND UPPER(Area) = UPPER(:area)`;
        binds.area = forecastParams.area;
      }
      sql += `)`;
    }

    sql += `
        GROUP BY EXTRACT(YEAR FROM Date_Occurred), EXTRACT(MONTH FROM Date_Occurred)
      )
      SELECT 
        Year AS year,
        Month AS month,
        TO_CHAR(TO_DATE(Month, 'MM'), 'Month') AS month_name,
        Crime_Count AS actual_crime_count,
        ROUND(Moving_Avg_3_Months, 2) AS three_month_average,
        Same_Month_Last_Year AS same_month_previous_year,
        ROUND(Moving_Avg_3_Months * 1.1, 0) AS forecasted_crime_count,
        CASE 
          WHEN Same_Month_Last_Year IS NOT NULL THEN
            ROUND(((Crime_Count - Same_Month_Last_Year) / Same_Month_Last_Year) * 100, 2)
          ELSE NULL
        END AS year_over_year_change_percent,
        CASE
          WHEN Crime_Count > Moving_Avg_3_Months * 1.2 THEN 'High'
          WHEN Crime_Count > Moving_Avg_3_Months * 0.8 THEN 'Normal'
          ELSE 'Low'
        END AS trend_indicator,
        RANK() OVER (ORDER BY Crime_Count DESC) AS severity_rank
      FROM HistoricalData
      ORDER BY Year DESC, Month DESC
      FETCH FIRST :months ROWS ONLY
    `;
    binds.months = months;

    const result = await conn.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });
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
  predictCrimeRisk,
  findSimilarPatterns,
  forecastCrimeTrends,
};