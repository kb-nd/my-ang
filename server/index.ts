import express from 'express';
import cors from 'cors';
import path from 'path';
import usersRouter from './routes/users';
import tasksRouter from './routes/tasks';

const app = express();
const PORT = process.env['PORT'] || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API útvonalak
app.use('/api/users', usersRouter);
app.use('/api/tasks', tasksRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Szerver indítása
app.listen(PORT, () => {
  console.log(`🚀 Szerver fut a http://localhost:${PORT} címen`);
  console.log(`📦 API végpontok: http://localhost:${PORT}/api/`);
});