import express from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/usersController.js';
import { adminDeveloperOnly } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Admin Developer only
 */
router.get('/', adminDeveloperOnly, getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Admin Developer only
 */
router.get('/:id', adminDeveloperOnly, getUserById);

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Admin Developer only
 */
router.post('/', adminDeveloperOnly, createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Admin Developer only
 */
router.put('/:id', adminDeveloperOnly, updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Admin Developer only
 */
router.delete('/:id', adminDeveloperOnly, deleteUser);

export default router;
