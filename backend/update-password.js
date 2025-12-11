import bcrypt from 'bcryptjs';
import pool from './db/pool.js';

const newPassword = 'Raportet2233';
const hash = bcrypt.hashSync(newPassword, 10);

console.log('Generated hash:', hash);

pool.query(
  'UPDATE users SET password_hash = $1 WHERE username = $2',
  [hash, 'admin']
)
  .then((result) => {
    console.log('✅ Password updated successfully!');
    console.log('Rows affected:', result.rowCount);
    pool.end();
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error updating password:', error.message);
    pool.end();
    process.exit(1);
  });
