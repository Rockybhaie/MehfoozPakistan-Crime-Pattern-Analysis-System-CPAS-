# Password Population Scripts

## Overview
These scripts help populate passwords for existing users in the database.

## Option 1: Node.js Script (RECOMMENDED) ✅

This script properly hashes passwords using bcrypt before storing them in the database.

### Usage:
```bash
# Make sure .env file is configured
cd backend
npm run populate-passwords
```

### What it does:
1. Connects to Oracle database
2. Hashes default password using bcrypt
3. Updates all Officers, Victims, and Witnesses with NULL passwords
4. Sets default password: `changeme123` (users should change on first login)

### Requirements:
- `.env` file must be configured with database credentials
- All dependencies installed (`npm install`)

## Option 2: Manual SQL (NOT RECOMMENDED)

The SQL script (`populate-passwords-sql.sql`) sets plain text passwords. 
**DO NOT USE IN PRODUCTION** - passwords must be hashed!

## After Running:

1. **For Officers**: They can login with their email and password `changeme123`
2. **For Victims**: They need to register first (signup) or you can set their emails and passwords
3. **For Witnesses**: They need to register first (signup) or you can set their emails and passwords

## Setting Individual Passwords:

You can also manually set passwords for specific users using the backend API:

```javascript
// Example: Set password for a specific officer
// Use the signup endpoint or create a custom script
```

## Important Notes:

- Default password is: `changeme123`
- Users should change password on first login
- For production, implement password reset functionality
- Consider sending password reset emails instead of default passwords

