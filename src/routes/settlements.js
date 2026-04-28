import express from 'express';
import * as settlementController from '../controllers/settlementsController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all settlement routes
router.use(auth);

router.get('/settleGroup/:groupId', settlementController.settleGroupExpenses);
router.post('/', settlementController.create);
router.get('/group/:groupId', settlementController.listByGroup);

export default router;
