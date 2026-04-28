import express from 'express';
import * as expenseController from '../controllers/expensesController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all expense routes
router.use(auth);

router.post('/', expenseController.create);
router.get('/group/:groupId', expenseController.listByGroup);
router.get('/personal/:userId', expenseController.listPersonal);
router.delete('/:expenseId', expenseController.remove);

export default router;
