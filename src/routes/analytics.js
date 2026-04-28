import express from 'express';
import auth from '../middleware/auth.js';
import * as analyticsController from '../controllers/analyticsController.js';

const router = express.Router();

// Apply auth middleware to all analytics routes
router.use(auth);

router.get('/personal', analyticsController.getPersonalAnalytics);
router.get('/groups', analyticsController.getGroupAnalytics);
router.get('/personal/categories', analyticsController.getCategoryBasedAnalytics);

export default router;
