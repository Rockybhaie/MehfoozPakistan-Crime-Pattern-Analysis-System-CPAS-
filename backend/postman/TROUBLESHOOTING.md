# Postman Collection Troubleshooting Guide

## Issue: "No response" or Health Check Fails

### Quick Fixes

#### 1. Check Server is Running
```bash
cd backend
npm start
```

You should see:
```
🚀 CPAS Backend Server running on port 5000
📡 API available at http://localhost:5000/api
```

#### 2. Verify Port Number

**Check your backend port:**
- Look at the console output when you start the server
- Default is `5000` but might be `3001` if you have PORT in .env

**Update Postman Collection Variable:**
1. In Postman, click on collection name "CPAS - Complete Test Suite"
2. Click "Variables" tab
3. Find `baseUrl` variable
4. Change value to match your server port:
   - If port 5000: `http://localhost:5000`
   - If port 3001: `http://localhost:3001`

#### 3. Test Manually First

Before running the collection, test manually:

1. In Postman, create a new request
2. Method: GET
3. URL: `http://localhost:5000/` (or your port)
4. Click Send

**Expected Response:**
```json
{
  "message": "CPAS Backend API is running!",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

If this works, the collection will work. If not, check:
- Server is running
- Port is correct
- No firewall blocking

#### 4. Check Collection Variables

**Method 1: Collection Variables (Recommended)**
1. Right-click collection → "Edit"
2. Go to "Variables" tab
3. Ensure `baseUrl` is set correctly
4. Click "Save"

**Method 2: Environment Variables**
1. Create/Select environment in Postman
2. Add variable: `baseUrl` = `http://localhost:5000`
3. Select this environment when running tests

#### 5. Common Port Issues

**If your server runs on port 3001:**
- Update `baseUrl` to `http://localhost:3001`
- Or set environment variable `PORT=5000` in backend/.env

**Check .env file:**
```bash
# backend/.env
PORT=5000  # or 3001
```

#### 6. Connection Refused Error

If you see "Error: connect ECONNREFUSED":
- Server is not running → Start it with `npm start`
- Wrong port → Check and update baseUrl
- Firewall blocking → Check firewall settings

#### 7. Test Individual Requests

If collection fails, test requests individually:

1. **Health Check:**
   - GET `http://localhost:5000/`
   - Should return 200 with message

2. **Officer Login:**
   - POST `http://localhost:5000/api/auth/officer/login`
   - Body: `{"email": "ahmed.khan@police.gov.pk", "password": "changeme123"}`
   - Should return token

### Step-by-Step Setup

1. **Start Backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Verify Server:**
   - Open browser: `http://localhost:5000/`
   - Should see JSON response

3. **Import Collection:**
   - Postman → Import → Select JSON file

4. **Set baseUrl:**
   - Collection → Variables → Update `baseUrl`

5. **Run Health Check:**
   - Run only "0. Setup & Health Check" folder
   - Should pass

6. **Run Full Collection:**
   - Right-click collection → Run collection

### Still Not Working?

**Check Backend Logs:**
- Look at terminal where server is running
- Check for error messages
- Verify database connection

**Verify Database:**
- Ensure Oracle database is running
- Check connection in `backend/.env`
- Test connection manually

**Check Credentials:**
- Update login credentials in Authentication folder
- Use emails/passwords that exist in your database

### Quick Test Script

Run this in Postman Console (View → Show Postman Console):

```javascript
// Test connection
pm.sendRequest({
    url: 'http://localhost:5000/',
    method: 'GET'
}, function (err, res) {
    if (err) {
        console.log('ERROR:', err);
    } else {
        console.log('SUCCESS:', res.code, res.json());
    }
});
```

If this fails, the issue is with server/connection, not the collection.



