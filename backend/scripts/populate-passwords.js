/**
 * Script to populate passwords for existing users
 * This will hash passwords using bcrypt and update the database
 * 
 * Usage: node scripts/populate-passwords.js
 */

const oracledb = require("oracledb");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Default password for all users (they should change it on first login)
const DEFAULT_PASSWORD = "changeme123";

async function populatePasswords() {
  let conn;
  try {
    // Connect to database
    conn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
    });

    console.log("✅ Connected to database");
    console.log("🔐 Starting password population...\n");

    // Hash the default password once
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    console.log(`📝 Using default password: ${DEFAULT_PASSWORD}`);
    console.log(`🔒 Hashed password ready\n`);

    // Update Officers
    console.log("👮 Updating Officer passwords...");
    const officerResult = await conn.execute(
      `UPDATE Officer 
       SET Password = :password 
       WHERE Password IS NULL OR Email IS NOT NULL`,
      { password: hashedPassword }
    );
    console.log(`   ✅ Updated ${officerResult.rowsAffected} officers`);

    // Get officers with emails to show
    const officersWithEmail = await conn.execute(
      `SELECT Officer_ID, Name, Email FROM Officer WHERE Email IS NOT NULL AND ROWNUM <= 5`
    );
    if (officersWithEmail.rows.length > 0) {
      console.log("   Sample officers:");
      officersWithEmail.rows.forEach((officer) => {
        console.log(`      - ${officer[1]} (${officer[2]})`);
      });
    }

    // Update Victims
    console.log("\n👥 Updating Victim passwords...");
    const victimResult = await conn.execute(
      `UPDATE Victim 
       SET Password = :password 
       WHERE Password IS NULL`,
      { password: hashedPassword }
    );
    console.log(`   ✅ Updated ${victimResult.rowsAffected} victims`);

    // Update Witnesses
    console.log("\n👁️  Updating Witness passwords...");
    const witnessResult = await conn.execute(
      `UPDATE Witness 
       SET Password = :password 
       WHERE Password IS NULL`,
      { password: hashedPassword }
    );
    console.log(`   ✅ Updated ${witnessResult.rowsAffected} witnesses`);

    // Commit changes
    await conn.commit();
    console.log("\n✅ All passwords updated successfully!");
    console.log(`\n⚠️  IMPORTANT: Default password for all users is: ${DEFAULT_PASSWORD}`);
    console.log("   Users should change their password on first login!\n");

    // Show summary
    const stats = await conn.execute(`
      SELECT 
        (SELECT COUNT(*) FROM Officer WHERE Password IS NOT NULL) AS Officers_With_Password,
        (SELECT COUNT(*) FROM Victim WHERE Password IS NOT NULL) AS Victims_With_Password,
        (SELECT COUNT(*) FROM Witness WHERE Password IS NOT NULL) AS Witnesses_With_Password
      FROM DUAL
    `);
    
    const statsRow = stats.rows[0];
    console.log("📊 Summary:");
    console.log(`   Officers with password: ${statsRow[0]}`);
    console.log(`   Victims with password: ${statsRow[1]}`);
    console.log(`   Witnesses with password: ${statsRow[2]}\n`);

  } catch (err) {
    console.error("❌ Error:", err);
    if (conn) {
      await conn.rollback();
    }
    process.exit(1);
  } finally {
    if (conn) {
      await conn.close();
      console.log("🔒 Database connection closed");
    }
  }
}

// Run the script
if (require.main === module) {
  populatePasswords()
    .then(() => {
      console.log("✅ Script completed successfully");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Script failed:", err);
      process.exit(1);
    });
}

module.exports = { populatePasswords };

