const oracledb = require('oracledb');
const bcrypt = require('bcryptjs');

const dbConfig = {
  user: 'c##irfan',
  password: '123',
  connectString: 'localhost:1521/orcl'
};

const defaultPassword = 'changeme123';

async function setPasswordsForExistingEmails() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    connection = await oracledb.getConnection(dbConfig);
    console.log('✅ Connected!\n');

    // Hash the default password once
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    console.log('🔐 Hashed password generated\n');

    // Update all victims
    console.log('👥 Updating VICTIM passwords...');
    const victimResult = await connection.execute(
      `UPDATE Victim SET Password = :password WHERE Email IS NOT NULL`,
      { password: hashedPassword },
      { autoCommit: false }
    );
    console.log(`   ✅ Updated ${victimResult.rowsAffected} victim passwords`);

    // Update all witnesses
    console.log('\n👁️ Updating WITNESS passwords...');
    const witnessResult = await connection.execute(
      `UPDATE Witness SET Password = :password WHERE Email IS NOT NULL`,
      { password: hashedPassword },
      { autoCommit: false }
    );
    console.log(`   ✅ Updated ${witnessResult.rowsAffected} witness passwords`);

    // Commit the changes
    await connection.commit();
    console.log('\n💾 All changes committed!');

    // Verify the updates
    console.log('\n📋 Verification:');
    const victimsCheck = await connection.execute(
      `SELECT Victim_ID, Name, Email, 
       CASE WHEN Password IS NULL THEN 'NO PASSWORD' ELSE 'HAS PASSWORD' END as pwd_status 
       FROM Victim ORDER BY Victim_ID`
    );
    console.log('\nVictims:');
    victimsCheck.rows.forEach(row => {
      console.log(`   ${row[0]}: ${row[1]} (${row[2]}) - ${row[3]}`);
    });

    const witnessesCheck = await connection.execute(
      `SELECT Witness_ID, Name, Email, 
       CASE WHEN Password IS NULL THEN 'NO PASSWORD' ELSE 'HAS PASSWORD' END as pwd_status 
       FROM Witness ORDER BY Witness_ID`
    );
    console.log('\nWitnesses:');
    witnessesCheck.rows.forEach(row => {
      console.log(`   ${row[0]}: ${row[1]} (${row[2]}) - ${row[3]}`);
    });

    console.log('\n✨ Done! All accounts now use password: changeme123');

  } catch (err) {
    console.error('❌ Error:', err);
    if (connection) {
      await connection.rollback();
      console.log('🔄 Changes rolled back');
    }
  } finally {
    if (connection) {
      await connection.close();
      console.log('\n🔌 Database connection closed');
    }
  }
}

setPasswordsForExistingEmails();
