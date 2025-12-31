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
    
    // Check constraint details
    const result = await conn.execute(
      `SELECT constraint_name, constraint_type, table_name 
       FROM user_constraints 
       WHERE constraint_name = 'SYS_C008768'`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log('Constraint Info:', JSON.stringify(result.rows, null, 2));
    
    // Check columns
    const cols = await conn.execute(
      `SELECT column_name 
       FROM user_cons_columns 
       WHERE constraint_name = 'SYS_C008768'`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log('Columns:', JSON.stringify(cols.rows, null, 2));
    
    // Check current investigations
    const invs = await conn.execute(
      `SELECT Investigation_ID, Case_Number FROM Investigation ORDER BY Investigation_ID DESC FETCH FIRST 5 ROWS ONLY`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log('Latest Investigations:', JSON.stringify(invs.rows, null, 2));
    
    // Check sequence current value
    const seq = await conn.execute(
      `SELECT last_number FROM user_sequences WHERE sequence_name = 'INVESTIGATION_SEQ'`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    console.log('Sequence last_number:', JSON.stringify(seq.rows, null, 2));
    
  } catch (err) {
    console.error(err);
  } finally {
    if (conn) await conn.close();
    process.exit(0);
  }
})();
