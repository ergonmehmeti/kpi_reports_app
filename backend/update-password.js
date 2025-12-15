import bcrypt from 'bcryptjs';
import pool from './db/pool.js';

// Change these values as needed
const username = 'superadmin';
const password = '@Vala900';
const role = 'adminDeveloper';

const hash = bcrypt.hashSync(password, 10);

console.log('Creating user:', username);
console.log('Role:', role);

pool.query(
  'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) ON CONFLICT (username) DO UPDATE SET password_hash = $2, role = $3',
  [username, hash, role]
)
  .then((result) => {
    console.log('✅ User created/updated successfully!');
    pool.end();
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    pool.end();
    process.exit(1);
  });
