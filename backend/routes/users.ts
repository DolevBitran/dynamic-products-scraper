import { Router } from 'express';
import { getUsers, getCurrentUser, updateUser, deleteUser } from '../controllers/usersController';
import authenticateUser from '../middleware/auth';

const router = Router();

// All routes in this file are protected by authentication
router.use(authenticateUser);

// Routes for /api/users
router.route('/')
  .get(getUsers);

// Route for current user
router.route('/me')
  .get(getCurrentUser);

// Routes for specific user by ID
router.route('/:id')
  .put(updateUser)
  .delete(deleteUser);

export default router;
