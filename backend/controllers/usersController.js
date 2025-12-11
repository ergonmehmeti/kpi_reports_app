import bcrypt from 'bcryptjs';
import pool from '../db/pool.js';

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, role, created_at FROM users ORDER BY id ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get single user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, username, role, created_at FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create new user (admin only)
export const createUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Validate role
    const validRoles = ['admin', 'basic', 'adminDeveloper'];
    const userRole = role || 'basic';
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin, basic, or adminDeveloper' });
    }

    // Check if username already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Hash password
    const passwordHash = bcrypt.hashSync(password, 10);

    // Insert user
    const result = await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role, created_at',
      [username, passwordHash, userRole]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user (admin only)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role } = req.body;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );
    
    if (existingUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate role if provided
    if (role) {
      const validRoles = ['admin', 'basic', 'adminDeveloper'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Must be admin, basic, or adminDeveloper' });
      }
    }

    // Check if username is taken by another user
    if (username) {
      const usernameCheck = await pool.query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username, id]
      );
      if (usernameCheck.rows.length > 0) {
        return res.status(409).json({ error: 'Username already taken' });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (username) {
      updates.push(`username = $${paramCount}`);
      values.push(username);
      paramCount++;
    }

    if (password) {
      const passwordHash = bcrypt.hashSync(password, 10);
      updates.push(`password_hash = $${paramCount}`);
      values.push(passwordHash);
      paramCount++;
    }

    if (role) {
      updates.push(`role = $${paramCount}`);
      values.push(role);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, username, role, created_at`;
    
    const result = await pool.query(query, values);

    res.json({
      message: 'User updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting yourself
    if (req.user && req.user.id === parseInt(id)) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, username',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User deleted successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default { getAllUsers, getUserById, createUser, updateUser, deleteUser };
