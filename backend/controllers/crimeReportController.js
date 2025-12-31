const {
  listAllCrimeReports,
  getCrimeReportById,
  createCrimeReport,
  createCrimeReportWithAutoCrime,
  updateCrimeReport,
  deleteCrimeReport,
  linkReportToCrime,
} = require("../models/CrimeReportModel");

/**
 * Get all crime reports (filtered by role)
 */
async function getAllCrimeReports(req, res) {
  try {
    const filters = {
      status: req.query.status,
      victimId: req.user.role === "VICTIM" ? req.user.userId : req.query.victimId,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
    };
    const reports = await listAllCrimeReports(filters);
    res.json({ data: reports });
  } catch (err) {
    console.error("Error fetching crime reports:", err);
    res.status(500).json({ message: "Error fetching crime reports", error: err.message });
  }
}

/**
 * Get crime report by ID
 */
async function getCrimeReport(req, res) {
  try {
    const reportId = parseInt(req.params.id);
    console.log('🔍 Fetching report ID:', reportId, 'for user:', req.user);
    
    const reportData = await getCrimeReportById(reportId);
    console.log('📋 Report data retrieved:', reportData ? 'Yes' : 'No');
    
    if (!reportData) {
      return res.status(404).json({ message: "Crime report not found" });
    }
    
    // Check if victim is accessing their own report
    if (req.user.role === "VICTIM" && reportData.report.VICTIM_ID !== req.user.userId) {
      console.log('⛔ Access denied - Report victim_id:', reportData.report.VICTIM_ID, 'User ID:', req.user.userId);
      return res.status(403).json({ message: "Access denied" });
    }
    
    console.log('✅ Sending report data');
    res.json({ data: reportData });
  } catch (err) {
    console.error("❌ Error fetching crime report:", err);
    res.status(500).json({ message: "Error fetching crime report", error: err.message });
  }
}

/**
 * Create a new crime report (Victim only)
 * If autoCreateCrime is true and required fields are provided, uses stored procedure to auto-create crime
 */
async function addCrimeReport(req, res) {
  try {
    const reportData = {
      ...req.body,
      victimId: req.user.role === "VICTIM" ? req.user.userId : req.body.victimId,
    };
    
    // Check if auto-create crime is requested
    const autoCreateCrime = req.body.autoCreateCrime === true || req.query.autoCreateCrime === 'true';
    
    if (autoCreateCrime && reportData.crimeTypeId && reportData.dateOccurred && reportData.locationId) {
      // Use stored procedure to create report and auto-create crime
      const result = await createCrimeReportWithAutoCrime(reportData);
      res.status(201).json({ 
        message: "Crime report created successfully with auto-created crime",
        reportId: result.reportId,
        crimeId: result.crimeId
      });
    } else {
      // Regular report creation without auto-crime
      const result = await createCrimeReport(reportData);
      res.status(201).json({ 
        message: "Crime report created successfully",
        reportId: result.reportId
      });
    }
  } catch (err) {
    console.error("Error creating crime report:", err);
    res.status(500).json({ message: "Error creating crime report", error: err.message });
  }
}

/**
 * Update crime report status (Officer only)
 */
async function updateCrimeReportHandler(req, res) {
  try {
    const reportId = parseInt(req.params.id);
    console.log('📝 Updating report:', reportId, 'with data:', req.body);
    const result = await updateCrimeReport(reportId, req.body);
    console.log('✅ Update result:', result);
    if (result.rowsAffected > 0) {
      res.json({ message: "Crime report updated successfully" });
    } else {
      res.status(404).json({ message: "Crime report not found" });
    }
  } catch (err) {
    console.error("❌ Error updating crime report:", err);
    res.status(500).json({ message: "Error updating crime report", error: err.message });
  }
}

/**
 * Link report to crime (Officer only)
 */
async function linkReport(req, res) {
  try {
    const reportId = parseInt(req.params.id);
    const { crimeId, notes } = req.body;
    await linkReportToCrime(reportId, crimeId, notes);
    res.status(201).json({ message: "Report linked to crime successfully" });
  } catch (err) {
    console.error("Error linking report:", err);
    res.status(500).json({ message: "Error linking report", error: err.message });
  }
}

/**
 * Delete crime report (Officer only)
 */
async function deleteCrimeReportHandler(req, res) {
  try {
    const reportId = parseInt(req.params.id);
    const result = await deleteCrimeReport(reportId);
    if (result.rowsAffected > 0) {
      res.json({ message: "Crime report deleted successfully" });
    } else {
      res.status(404).json({ message: "Crime report not found" });
    }
  } catch (err) {
    console.error("Error deleting crime report:", err);
    res.status(500).json({ message: "Error deleting crime report", error: err.message });
  }
}

module.exports = {
  getAllCrimeReports,
  getCrimeReport,
  addCrimeReport,
  updateCrimeReportHandler,
  linkReport,
  deleteCrimeReportHandler,
};

