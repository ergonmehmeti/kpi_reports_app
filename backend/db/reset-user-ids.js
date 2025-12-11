import pool from './pool.js';

async function resetUserIds() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get all users ordered by created_at
    const { rows: users } = await client.query(
      'SELECT id FROM users ORDER BY created_at ASC'
    );
    
    // Temporarily disable the foreign key checks (if any)
    // Update each user with a new sequential ID starting from 1
    for (let i = 0; i < users.length; i++) {
      const newId = i + 1;
      const oldId = users[i].id;
      
      await client.query(
        'UPDATE users SET id = $1 WHERE id = $2',
        [newId + 1000, oldId] // Temporary offset to avoid conflicts
      );
    }
    
    // Now update back to final IDs
    for (let i = 0; i < users.length; i++) {
      const newId = i + 1;
      
      await client.query(
        'UPDATE users SET id = $1 WHERE id = $2',
        [newId, newId + 1000]
      );
    }
    
    // Reset the sequence to continue from the last ID
    await client.query(
      `SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))`
    );
    
    await client.query('COMMIT');
    console.log('✓ User IDs reset successfully!');
    console.log(`✓ ${users.length} users now have sequential IDs starting from 1`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error resetting user IDs:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

resetUserIds();
