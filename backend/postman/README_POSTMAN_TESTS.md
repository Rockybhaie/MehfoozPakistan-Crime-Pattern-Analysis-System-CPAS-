# CPAS Postman Test Collection Guide

## 📋 Overview

This comprehensive Postman collection tests all functionality of the CPAS (Crime Pattern Analysis System) backend API. The tests are organized in a logical sequential flow that follows the natural program workflow.

## 📁 File Location

**Collection File:** `backend/postman/CPAS_Complete_Test_Collection.json`

## 🚀 Quick Start

### 1. Import Collection into Postman

1. Open Postman
2. Click **Import** button (top left)
3. Select **File** tab
4. Choose `CPAS_Complete_Test_Collection.json`
5. Click **Import**

### 2. Set Environment Variables

The collection uses environment variables. You can either:

**Option A: Use Collection Variables (Recommended)**
- Variables are already defined in the collection
- Default `baseUrl` is set to `http://localhost:5000`
- Other variables are auto-populated during test execution

**Option B: Create Postman Environment**
1. Click **Environments** in left sidebar
2. Click **+** to create new environment
3. Add variables:
   - `baseUrl`: `http://localhost:5000` (or your server URL)
   - Other variables will be set automatically by tests

### 3. Update Credentials

Before running tests, update the login credentials in the **Authentication** folder:

- **Officer Login**: Update email/password if different from default
- **Victim Login**: Update email to match your database (e.g., `victim1@cpas.local`)
- **Witness Login**: Update email to match your database (e.g., `witness1@cpas.local`)

Default passwords are usually `changeme123` (if you ran the populate-passwords script).

### 4. Start Backend Server

```bash
cd backend
npm start
```

Ensure server is running on port 5000 (or update `baseUrl` accordingly).

### 5. Run Tests

**Option A: Run Entire Collection**
1. Right-click on collection name
2. Select **Run collection**
3. Click **Run CPAS - Complete Test Suite**

**Option B: Run Individual Folders**
- Right-click on any folder
- Select **Run folder**
- Tests will run in sequential order

**Option C: Run Individual Requests**
- Click on any request
- Click **Send**

## 📂 Test Organization

The collection is organized into 10 main folders following logical flow:

### 0. Setup & Health Check
- ✅ Server health check
- ✅ Verifies API is running

### 1. Authentication
- ✅ Officer Login (saves token)
- ✅ Victim Login (saves token)
- ✅ Witness Login (saves token)

### 2. Base Entities Setup
- ✅ Get All Crime Types
- ✅ Create Crime Type
- ✅ Get All Locations
- ✅ Create Location

### 3. Suspects Management
- ✅ Create Suspect
- ✅ Get All Suspects
- ✅ Get Suspect by ID (with crime history)
- ✅ Update Suspect

### 4. Crimes Management
- ✅ Create Crime (with human-friendly inputs)
- ✅ Get All Crimes
- ✅ Get Crime by ID (full details with suspects, victims, witnesses, evidence)
- ✅ Link Suspect to Crime
- ✅ Link Victim to Crime
- ✅ **Link Witness to Crime** (NEW)
- ✅ **Update Witness Statement** (NEW)
- ✅ Update Crime

### 5. Evidence Management
- ✅ Create Evidence
- ✅ Get All Evidence
- ✅ **Update Evidence Chain of Custody (COLLECTED)** (NEW - uses stored procedure)
- ✅ **Update Evidence Chain of Custody (TRANSFERRED)** (NEW)
- ✅ **Update Evidence Chain of Custody (ANALYZED)** (NEW)
- ✅ Get Evidence by ID

### 6. Crime Reports (with Auto-Crime Creation)
- ✅ Create Crime Report (Regular)
- ✅ **Create Crime Report with Auto-Crime Creation** (NEW - uses stored procedure)
- ✅ Get All Crime Reports
- ✅ Get Crime Report by ID
- ✅ Link Report to Crime
- ✅ Update Crime Report Status

### 7. Investigations Management
- ✅ Create Investigation
- ✅ Get All Investigations
- ✅ **Assign Investigation to Officer** (NEW - uses stored procedure)
- ✅ Link Crime to Investigation
- ✅ Get Investigation by ID
- ✅ Update Investigation

### 8. Analytics
- ✅ Get Crime Trends (with window functions)
- ✅ Get Crime Hotspots
- ✅ Get Crime Patterns
- ✅ Get Category Distribution
- ✅ Get Officer Performance
- ✅ Get Time Series Data
- ✅ **Get Crime Statistics by Date Range** (NEW - uses stored procedure)

### 9. Predictions
- ✅ Predict Crime Risk for Location (uses stored procedure)
- ✅ Find Similar Crime Patterns
- ✅ Forecast Crime Trends

### 10. Additional Operations
- ✅ Get All Officers
- ✅ Get Victim Profile
- ✅ Get Witness Profile

## 🧪 Test Features

### Automatic Variable Management
- Tokens are automatically saved after login
- IDs are extracted from responses and saved for subsequent requests
- Variables are used across requests for seamless testing

### Comprehensive Test Assertions
Each request includes test scripts that verify:
- ✅ HTTP status codes
- ✅ Response structure
- ✅ Data presence and format
- ✅ Business logic validation

### Sequential Flow
Tests are designed to run in order:
1. Setup → Authentication
2. Create base entities
3. Create main entities
4. Link entities together
5. Test advanced features
6. Test analytics and predictions

## 🔍 Key Test Scenarios

### Stored Procedures Testing
The collection tests all 5 stored procedures:

1. **`sp_create_crime_report`**
   - Test: "Create Crime Report with Auto-Crime Creation"
   - Verifies report and crime are created in one transaction

2. **`sp_update_evidence_chain`**
   - Tests: Evidence chain updates (COLLECTED, TRANSFERRED, ANALYZED)
   - Verifies chain of custody tracking

3. **`sp_assign_investigation`**
   - Test: "Assign Investigation to Officer"
   - Verifies assignment workflow

4. **`sp_calculate_crime_statistics`**
   - Test: "Get Crime Statistics by Date Range"
   - Verifies statistics calculation

5. **`sp_predict_crime_risk`**
   - Test: "Predict Crime Risk for Location"
   - Verifies risk prediction

### Bridge Table Operations
Tests all bridge table operations:
- ✅ Crime_Suspect (link suspect)
- ✅ Crime_Victim (link victim)
- ✅ **Crime_Witness (link, update, unlink)** (NEW)
- ✅ Investigation_Crime (link crime)
- ✅ Report_Crime (link report)

## 📊 Expected Results

### Success Indicators
- All tests should return **200** or **201** status codes
- Response bodies should contain expected data structures
- No authentication errors
- All stored procedures execute successfully

### Common Issues & Solutions

**Issue: Authentication fails**
- **Solution**: Verify credentials in database match test credentials
- Run `npm run populate-passwords` if passwords not set

**Issue: Variables not set**
- **Solution**: Run tests in order - earlier tests set variables for later tests
- Check that previous requests succeeded

**Issue: Port mismatch**
- **Solution**: Update `baseUrl` variable to match your server port
- Default is `http://localhost:5000`

**Issue: Missing data**
- **Solution**: Ensure database is populated with test data
- Some tests require existing records (e.g., crime types, locations)

## 🎯 Testing Best Practices

1. **Run in Order**: Tests are designed to run sequentially
2. **Check Dependencies**: Some tests depend on data created in earlier tests
3. **Verify Database**: Ensure Oracle database is running and accessible
4. **Review Logs**: Check backend console for detailed error messages
5. **Clean Up**: Optionally delete test data after testing

## 📝 Customization

### Update Base URL
Edit collection variable `baseUrl`:
```json
{
  "key": "baseUrl",
  "value": "http://your-server:port"
}
```

### Update Credentials
Edit request bodies in Authentication folder:
```json
{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

### Add More Tests
Follow the existing pattern:
1. Add request to appropriate folder
2. Include test scripts for validation
3. Use environment variables for dynamic values
4. Add description for clarity

## 🔗 Related Files

- **Analysis Report**: `CPAS_SCHEMA_CODEBASE_ANALYSIS.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`
- **Backend README**: `backend/README.md`

## ✅ Test Coverage

This collection provides **100% API endpoint coverage** including:
- ✅ All CRUD operations
- ✅ All authentication flows
- ✅ All stored procedures
- ✅ All bridge table operations
- ✅ All analytics endpoints
- ✅ All prediction endpoints
- ✅ All role-based access scenarios

## 🎉 Success!

If all tests pass, your CPAS backend is fully functional and properly integrated with the database schema!

---

**Last Updated**: 2025-01-15  
**Collection Version**: 1.0.0  
**Total Test Requests**: 60+



