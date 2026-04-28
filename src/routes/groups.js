import express from 'express';
import * as groupController from '../controllers/groupsController.js';
import auth from '../middleware/auth.js';
import isGroupCreator from '../middleware/isGroupCreator.js';

const router = express.Router();

// Apply auth middleware to all group routes
router.use(auth);

router.post('/', groupController.create);
router.get('/', groupController.list);
router.get('/:id', groupController.details);
router.put('/:id', isGroupCreator, groupController.update);
router.delete('/:id', isGroupCreator, groupController.remove);

export default router;
