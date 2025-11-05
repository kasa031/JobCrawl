import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jobRoutes from './routes/jobRoutes';
import aiRoutes from './routes/aiRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock middleware for development without database
app.use((_req, _res, next) => {
  console.log('📝 Mock mode - Database not connected');
  next();
});

// Routes
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'JobCrawl API is running (Mock Mode)',
    timestamp: new Date().toISOString(),
    mode: 'MOCK - No database connected'
  });
});

app.use('/api/jobs', jobRoutes);
app.use('/api/ai', aiRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 JobCrawl Backend running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API endpoint: http://localhost:${PORT}/api`);
  console.log(`⚠️  MOCK MODE - No database connected`);
  console.log(`📝 Frontend URL: ${FRONTEND_URL}`);
});

export default app;

