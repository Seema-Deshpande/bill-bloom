import express from 'express';
import * as expenseController from '../controllers/expensesController.js';

const router = express.Router();

router.post('/', expenseController.create);
router.get('/group/:groupId', expenseController.listByGroup);
router.get('/personal/:userId', expenseController.listPersonal);
router.delete('/:expenseId', expenseController.remove);

export default router;