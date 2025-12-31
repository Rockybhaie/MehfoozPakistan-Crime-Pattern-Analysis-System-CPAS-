# Quick Fix for Postman Collection

## Port Confusion

Your console shows **port 5000**, but you mentioned port 3001. 

**Solution:** Set `baseUrl` in collection variables to match what your console shows:
- If console shows `localhost:5000` → Use `http://localhost:5000`
- If console shows `localhost:3001` → Use `http://localhost:3001`

## Endpoint Mismatch

Your console shows different endpoints than the collection:
- Console: `/api/auth/register/officer` and `/api/auth/login`
- Collection: `/api/auth/officer/signup` and `/api/auth/officer/login`

**This means you might be using a different collection or have different routes.**

## Quick Steps to Fix

1. **Check your actual server port:**
   - Look at backend console when you run `npm start`
   - It will show: `🚀 CPAS Backend Server running on port XXXX`

2. **Set baseUrl in collection:**
   - Collection → Variables tab
   - Set `baseUrl` to match your server port

3. **Test manually first:**
   - Create new request: GET `http://localhost:XXXX/`
   - Should return JSON with "CPAS Backend API is running!"

4. **Test login manually:**
   - POST `http://localhost:XXXX/api/auth/officer/login`
   - Body: `{"email": "ahmed.khan@police.gov.pk", "password": "changeme123"}`
   - Should return token

5. **If login fails:**
   - Check if officer exists in database
   - Check if password is correct
   - Check backend console for error messages

## Current Collection Endpoints

The collection uses these endpoints (from your codebase):
- `POST /api/auth/officer/login`
- `POST /api/auth/victim/login`
- `POST /api/auth/witness/login`

If your console shows different endpoints, you might need to update the collection requests to match your actual routes.



