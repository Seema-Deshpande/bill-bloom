import express from 'express';
import auth from '../middleware/auth.js';
import * as userController from '../controllers/usersController.js';

const router = express.Router();

// Apply auth middleware to all user routes
router.use(auth);

router.get('/search', userController.searchUsers);

export default router;
