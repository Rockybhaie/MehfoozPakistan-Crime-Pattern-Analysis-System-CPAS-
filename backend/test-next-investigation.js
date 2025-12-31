const oracledb = require('oracledb');
require('dotenv').config();

(async () => {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
    });
    
    // Get next sequence value
    const seqResult = await conn.execute(
      `SELECT investigation_seq.NEXTVAL AS NEXT_ID FROM DUAL`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const nextId = seqResult.rows[0].NEXT_ID;
    console.log('Next sequence value:', nextId);
    
    // Generate case number
    const year = new Date().getFullYear();
    const caseNumber = `INV-${year}-${String(nextId).padStart(6, '0')}`;
    console.log('Generated case number:', caseNumber);
    
    // Check if this Investigation_ID exists
    const checkId = await conn.execute(
      `SELECT COUNT(*) as CNT FROM Investigation WHERE Investigation_ID = :id`,
      { id: nextId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log('Investigation_ID exists?', checkId.rows[0].CNT > 0);
    
    // Check if this Case_Number exists
    const checkCase = await conn.execute(
      `SELECT COUNT(*) as CNT FROM Investigation WHERE Case_Number = :caseNum`,
      { caseNum: caseNumber },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log('Case_Number exists?', checkCase.rows[0].CNT > 0);
    
  } catch (err) {
    console.error(err);
  } finally {
    if (conn) await conn.close();
    process.exit(0);
  }
})();
