import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jobRoutes from './routes/jobRoutes';
import aiRoutes from './routes/aiRoutes';
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import applicationRoutes from './routes/applicationRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import schedulerRoutes from './routes/schedulerRoutes';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { logInfo, logError } from './config/logger';

// Load environment variables (ESM-safe __dirname)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../env') });

// Initialize PORT and FRONTEND_URL before logging
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Debug: Log SMTP configuration
console.log('📧 SMTP Configuration:');
console.log('  SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET');
console.log('  SMTP_PORT:', process.env.SMTP_PORT || 'NOT SET');
console.log('  SMTP_USER:', process.env.SMTP_USER || 'NOT SET');
console.log('  SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '***' : 'NOT SET');

// Log configuration to Winston
logInfo('Application configuration', {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: PORT,
  frontendUrl: FRONTEND_URL,
  smtpConfigured: !!process.env.SMTP_HOST,
  databaseConfigured: !!process.env.DATABASE_URL,
  jwtSecretConfigured: !!process.env.JWT_SECRET,
});

const app = express();

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter); // Rate limiting

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'JobCrawl API is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/scheduler', schedulerRoutes);

// Error handler middleware (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  const startupMessage = `🚀 JobCrawl Backend running on http://localhost:${PORT}`;
  const envMessage = `📋 Environment: ${process.env.NODE_ENV || 'development'}`;
  const apiMessage = `🔗 API endpoint: http://localhost:${PORT}/api`;
  
  console.log(startupMessage);
  console.log(envMessage);
  console.log(apiMessage);
  
  // Log to Winston
  logInfo('Server started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    apiEndpoint: `http://localhost:${PORT}/api`,
  });
});

// Initialize scheduled scraping (if enabled via environment variable)
const initializeScheduledScraping = async () => {
  const SCHEDULED_SCRAPING_ENABLED = process.env.SCHEDULED_SCRAPING_ENABLED === 'true';
  const SCHEDULED_SCRAPING_INTERVAL_HOURS = parseInt(process.env.SCHEDULED_SCRAPING_INTERVAL_HOURS || '6', 10);
  const SCHEDULED_SCRAPING_KEYWORDS = process.env.SCHEDULED_SCRAPING_KEYWORDS;
  const SCHEDULED_SCRAPING_LOCATION = process.env.SCHEDULED_SCRAPING_LOCATION;

  if (SCHEDULED_SCRAPING_ENABLED) {
    const { schedulerService } = await import('./services/scheduler/SchedulerService');
    const intervalMs = SCHEDULED_SCRAPING_INTERVAL_HOURS * 60 * 60 * 1000;
    schedulerService.startScheduledScraping(intervalMs, SCHEDULED_SCRAPING_KEYWORDS, SCHEDULED_SCRAPING_LOCATION);
    logInfo('Scheduled scraping enabled', {
      intervalHours: SCHEDULED_SCRAPING_INTERVAL_HOURS,
      keywords: SCHEDULED_SCRAPING_KEYWORDS,
      location: SCHEDULED_SCRAPING_LOCATION,
    });
  } else {
    logInfo('Scheduled scraping disabled', {});
  }
};

// Initialize scheduled scraping asynchronously
initializeScheduledScraping().catch((error) => {
  logError('Error initializing scheduled scraping', error as Error);
});

// Graceful shutdown - close browser when app shuts down
const gracefulShutdown = async (signal: string) => {
  logInfo(`${signal} received, shutting down gracefully`);
  try {
    // Import BrowserManager dynamically to avoid circular dependencies
    const { BrowserManager } = await import('./services/scraper/ScraperService');
    await BrowserManager.forceClose();
    
    // Stop scheduled scraping
    try {
      const { schedulerService } = await import('./services/scheduler/SchedulerService');
      schedulerService.stopScheduledScraping();
    } catch (error) {
      // Ignore if scheduler not initialized
    }
  } catch (error) {
    logError('Error during browser cleanup', error as Error);
  }
  
  server.close(() => {
    logInfo('Server closed');
    process.exit(0);
  });
  
  // Force exit after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    logError('Forced shutdown after timeout', new Error('Shutdown timeout'));
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logError('Uncaught Exception', error);
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logError('Unhandled Rejection', reason instanceof Error ? reason : new Error(String(reason)), {
    promise: String(promise),
  });
  console.error('Unhandled Rejection:', reason);
});

export default app;

