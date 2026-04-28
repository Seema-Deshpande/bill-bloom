import express from 'express';
import cors from 'cors';
import authRoutes from './src/routes/auth.js';
import groupRoutes from './src/routes/groups.js';
import expenseRoutes from './src/routes/expenses.js';
import settlementRoutes from './src/routes/settlements.js';
import analyticsRoutes from './src/routes/analytics.js';
import userRoutes from './src/routes/user.js';

const app = express();

// enable JSON body parsing and CORS
app.use(express.json());
app.use(cors());

// mount routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);

// GET /ping → { message: "pong" }
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

export default app;
