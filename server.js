import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/auth.js';
import groupRoutes from './src/routes/groups.js';
import expenseRoutes from './src/routes/expenses.js';
import settlementRoutes from './src/routes/settlements.js';

const app = express();

// enable JSON body parsing and CORS
app.use(express.json());
app.use(cors());

// mount routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settlements', settlementRoutes);

// GET /ping → { message: "pong" }
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to DB", err);
    process.exit(1);
  });