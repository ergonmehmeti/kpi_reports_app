import pool from './db/pool.js';

async function getAdmin() {
  try {
    const result = await pool.query('SELECT username, password FROM users WHERE username = $1', ['admin']);
    console.log('\n=== Admin User Info ===');
    console.log('Username:', result.rows[0]?.username);
    console.log('Password:', result.rows[0]?.password);
    console.log('=======================\n');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

getAdmin();
