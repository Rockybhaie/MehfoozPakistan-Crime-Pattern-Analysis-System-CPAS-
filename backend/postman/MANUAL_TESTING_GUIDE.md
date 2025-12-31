# Manual Testing Guide for Postman Collection

## Quick Start

This collection is configured for **manual testing** with pre-filled credentials from your database scripts.

## Default Credentials

All credentials use the default password set by the populate scripts: **`changeme123`**

### 👮 Officer Login
- **Email:** `ahmed.khan@police.gov.pk` (or any officer email from your database)
- **Password:** `changeme123`
- **Token Variable:** `officerToken` (auto-saved after login)

### 👥 Victim Login
- **Email Format:** `victim{ID}@cpas.local`
- **Examples:** 
  - `victim1@cpas.local`
  - `victim2@cpas.local`
  - `victim3@cpas.local`
- **Password:** `changeme123`
- **Token Variable:** `victimToken` (auto-saved after login)

### 👁️ Witness Login
- **Email Format:** `witness{ID}@cpas.local`
- **Examples:**
  - `witness1@cpas.local`
  - `witness2@cpas.local`
  - `witness3@cpas.local`
- **Password:** `changeme123`
- **Token Variable:** `witnessToken` (auto-saved after login)

## How to Use for Manual Testing

### Step 1: Login First
1. **Officer Login** - Run this first to get `officerToken`
2. **Victim Login** - Run this to get `victimToken` (if needed for crime reports)
3. **Witness Login** - Run this to get `witnessToken` (if needed)

### Step 2: Use Saved Tokens
After login, tokens are automatically saved to collection variables:
- `{{officerToken}}` - Used in all officer-only endpoints
- `{{victimToken}}` - Used in victim endpoints (crime reports)
- `{{witnessToken}}` - Used in witness endpoints

### Step 3: Test Any Endpoint
All authenticated requests automatically use the saved tokens. Just:
1. Click on any request
2. Click "Send"
3. The token is automatically included in the Authorization header

## Updating Credentials

If you need to use different credentials:

### Change Officer Email
1. Open "Officer Login" request
2. Edit the body JSON:
   ```json
   {
     "email": "your.officer@email.com",
     "password": "changeme123"
   }
   ```

### Change Victim Email
1. Open "Victim Login" request
2. Edit the body JSON:
   ```json
   {
     "email": "victim5@cpas.local",  // Change ID as needed
     "password": "changeme123"
   }
   ```

### Change Witness Email
1. Open "Witness Login" request
2. Edit the body JSON:
   ```json
   {
     "email": "witness5@cpas.local",  // Change ID as needed
     "password": "changeme123"
   }
   ```

## Finding Available Users

If you're not sure which IDs exist:

### Check Officers
Run this SQL query:
```sql
SELECT Officer_ID, Name, Email FROM Officer WHERE Email IS NOT NULL;
```

### Check Victims
Run this SQL query:
```sql
SELECT Victim_ID, Name, Email FROM Victim WHERE Email IS NOT NULL ORDER BY Victim_ID;
```

### Check Witnesses
Run this SQL query:
```sql
SELECT Witness_ID, Name, Email FROM Witness WHERE Email IS NOT NULL ORDER BY Witness_ID;
```

## Token Management

### View Saved Tokens
1. Collection → Variables tab
2. Look for:
   - `officerToken`
   - `victimToken`
   - `witnessToken`

### Clear Tokens
1. Collection → Variables tab
2. Clear the token values
3. Re-run login requests to get new tokens

### Token Expiration
- Tokens expire after 24 hours
- If you get 401 errors, re-run the login request
- New token will automatically replace the old one

## Testing Workflow

### Recommended Order:
1. ✅ **Health Check** - Verify server is running
2. ✅ **Officer Login** - Get officer token
3. ✅ **Victim Login** - Get victim token (optional, for crime reports)
4. ✅ **Witness Login** - Get witness token (optional)
5. ✅ **Test any endpoint** - Tokens are automatically included

### Example: Testing Crimes
1. Run "Officer Login" → Token saved
2. Run "Get All Crimes" → Uses `{{officerToken}}` automatically
3. Run "Create Crime" → Uses `{{officerToken}}` automatically
4. No need to manually copy/paste tokens!

## Troubleshooting

### "Token not set" Error
- **Solution:** Run the login request first
- Check Collection → Variables to see if token exists

### "Invalid credentials" Error
- **Solution:** 
  - Verify email exists in database
  - Verify password is `changeme123`
  - Check if user has password set (run populate-passwords.js)

### "401 Unauthorized" Error
- **Solution:**
  - Token expired (24 hours) → Re-run login
  - Token not saved → Check Collection Variables
  - Wrong token type → Use correct login (officer/victim/witness)

### "Victim/Witness not found"
- **Solution:**
  - Try different ID (victim2, victim3, etc.)
  - Check if user exists in database
  - Run setup-victim-witness-credentials.js to generate emails

## Notes

- All passwords are: **`changeme123`** (from populate scripts)
- Tokens are automatically saved after login
- Tokens are automatically used in all authenticated requests
- No need to manually copy/paste tokens!
- Just login once, then test any endpoint


