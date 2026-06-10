import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/auth.js';
import groupRoutes from './src/routes/groups.js';
import expenseRoutes from './src/routes/expenses.js';
import settlementRoutes from './src/routes/settlements.js';
import analyticsRoutes from './src/routes/analytics.js';
import userRoutes from './src/routes/user.js';
import aiRoutes from './src/routes/ai.js';
import errorHandler from './src/middleware/errorHandler.js';

const app = express();

// Increase JSON limit to accommodate base64-encoded bill images (~10 MB)
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// mount routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

// GET /ping → { message: "pong" }
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// Centralised error handler — must be last
app.use(errorHandler);

export default app;
