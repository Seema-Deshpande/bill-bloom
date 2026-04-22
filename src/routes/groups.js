import express from 'express';
import * as groupController from '../controllers/groupsController.js';

const router = express.Router();

router.post('/', groupController.create);
router.get('/', groupController.list);
router.get('/:id', groupController.details);
router.put('/:id', groupController.update);
router.delete('/:id', groupController.remove);

export default router;