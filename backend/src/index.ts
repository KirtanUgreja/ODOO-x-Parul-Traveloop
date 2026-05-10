import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';

import { validateEnv, env } from './config/env';
import { prisma } from './config/db';
import authRoutes from './routes/authRoutes';
import tripRoutes from './routes/tripRoutes';
import activityRoutes from './routes/activityRoutes';
import noteRoutes from './routes/noteRoutes';
import checklistRoutes from './routes/checklistRoutes';
import aiRoutes from './routes/aiRoutes';
import adminRoutes from './routes/adminRoutes';

// Validate environment variables on startup
validateEnv();

const app = express();
const PORT = env.PORT;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Traveloop API is running' });
});

app.get('/api/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      success: true,
      message: 'Database connected successfully',
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', activityRoutes);  // defines /trips/:tripId/activities
app.use('/api', noteRoutes);       // defines /trips/:tripId/notes
app.use('/api', checklistRoutes);  // defines /trips/:tripId/checklist

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});

// Keep alive for dev
setInterval(() => {}, 1000 * 60 * 60);
