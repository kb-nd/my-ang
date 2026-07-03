import express from 'express';
import cors from 'cors';
import path from 'path';
import usersRouter from './routes/users';
import tasksRouter from './routes/tasks';
import authRouter from './routes/auth';
import { authMiddleware } from './middleware/auth';

const app = express();
const PORT = process.env['PORT'] || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Auth útvonalak (nyilvános)
app.use('/api/auth', authRouter);

// Védett API útvonalak
app.use('/api/users', authMiddleware, usersRouter);
app.use('/api/tasks', authMiddleware, tasksRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Szerver indítása
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Szerver fut a http://0.0.0.0:${PORT} címen`);
  console.log(`📦 API végpontok: http://localhost:${PORT}/api/`);
});