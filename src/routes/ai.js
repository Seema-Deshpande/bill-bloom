import express from 'express';
import auth from '../middleware/auth.js';
import {
    parseExpense, parseExpenseValidation,
    analysePersonal,
    scanBill, scanBillValidation,
} from '../controllers/aiController.js';

const router = express.Router();

router.use(auth);

router.post('/parse-expense', parseExpenseValidation, parseExpense);
router.post('/analyse-personal', analysePersonal);
router.post('/scan-bill', scanBillValidation, scanBill);

export default router;
