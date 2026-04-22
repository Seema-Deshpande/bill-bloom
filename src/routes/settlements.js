import express from 'express';
import * as settlementController from '../controllers/settlementsController.js';

const router = express.Router();

router.post('/', settlementController.create);
router.get('/group/:groupId', settlementController.listByGroup);

export default router;