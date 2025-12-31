# Postman Collection Fixes Applied

## Issues Fixed

### 1. **Port Configuration**
- ✅ Changed default `baseUrl` from `5000` to `3001`
- ✅ Updated all hardcoded port references
- ✅ Fixed pre-request script to set correct port

### 2. **Authentication Token Issues**

#### **Evidence Creation (401/500 errors)**
- ✅ Added pre-request script to verify `officerToken` and `crimeId` are set
- ✅ Added better error handling for 401 (unauthorized) and 500 (server error) responses
- ✅ Improved test assertions to show helpful error messages

#### **Crime Reports (401 errors)**
- ✅ Added pre-request script to verify `victimToken` is set before creating reports
- ✅ Fixed status code expectation (was expecting 200, should be 201 for creation)
- ✅ Added error handling for missing tokens with helpful messages
- ✅ Added pre-request check for `crimeTypeId` and `locationId` for auto-crime creation

### 3. **Token Saving Improvements**
- ✅ Enhanced login tests to safely save tokens with null checks
- ✅ Added console logging when tokens are saved successfully
- ✅ Improved error handling if token/user data is missing

## How to Use

### 1. Re-import Collection
- Delete old collection in Postman
- Import updated `CPAS_Complete_Test_Collection.json`

### 2. Verify Variables
- Collection → Variables tab
- Ensure `baseUrl` = `http://localhost:3001`
- All other variables should be empty (auto-populated)

### 3. Run Tests in Order
The collection is designed to run sequentially:
1. **Setup & Health Check** - Verifies server is running
2. **Authentication** - Logs in as Officer, Victim, Witness (saves tokens)
3. **Base Entities** - Creates crime types and locations (needed for later tests)
4. **Suspects** - Creates suspects
5. **Crimes** - Creates crimes (saves crimeId for evidence)
6. **Evidence** - Creates evidence (requires officerToken and crimeId)
7. **Crime Reports** - Creates reports (requires victimToken)
8. **Investigations** - Creates investigations
9. **Analytics** - Tests analytics endpoints
10. **Predictions** - Tests prediction endpoints

### 4. If Tests Still Fail

#### **401 Unauthorized Errors**
- Check that login tests ran successfully
- Verify tokens are saved: Collection → Variables → Check `officerToken`, `victimToken`, `witnessToken`
- Re-run authentication folder first

#### **500 Server Errors**
- Check backend console for error messages
- Verify database connection
- Check if required data exists (e.g., crimeId, locationId)

#### **Missing Variables**
- Run tests in order (don't skip folders)
- Each test saves variables needed by subsequent tests
- If a test fails, fix it before proceeding

## Test Flow Dependencies

```
Health Check
    ↓
Officer Login → saves officerToken
    ↓
Victim Login → saves victimToken
    ↓
Witness Login → saves witnessToken
    ↓
Create Crime Type → saves crimeTypeId
    ↓
Create Location → saves locationId
    ↓
Create Suspect → saves suspectId
    ↓
Create Crime → saves crimeId (needed for evidence)
    ↓
Create Evidence → requires officerToken + crimeId
    ↓
Create Crime Report → requires victimToken
    ↓
... rest of tests
```

## Common Issues

### Issue: "Token not set" error
**Solution:** Run the Authentication folder first to generate tokens

### Issue: "crimeId not set" error
**Solution:** Run the Crimes folder to create a crime first

### Issue: "crimeTypeId not set" error
**Solution:** Run the Base Entities Setup folder first

### Issue: All requests show 401
**Solution:** 
1. Check login credentials in Authentication requests
2. Verify backend is running
3. Check backend console for authentication errors

## Next Steps

1. Re-import the collection
2. Run the full collection
3. Check test results
4. If any test fails, check the error message and fix the underlying issue
5. Re-run from the failed test onwards


