import express from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/usersController.js';
import { adminOnly } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Admin only
 */
router.get('/', adminOnly, getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Admin only
 */
router.get('/:id', adminOnly, getUserById);

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Admin only
 */
router.post('/', adminOnly, createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Admin only
 */
router.put('/:id', adminOnly, updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Admin only
 */
router.delete('/:id', adminOnly, deleteUser);

export default router;
