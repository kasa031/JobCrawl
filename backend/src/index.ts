import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import prisma from './config/database';
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
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// Load environment variables (ESM-safe __dirname)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../env') });

// Initialize PORT and FRONTEND_URL before logging
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Log configuration to Winston
logInfo('Application configuration', {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: PORT,
  frontendUrl: FRONTEND_URL,
  smtpConfigured: !!process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT || 'NOT SET',
  databaseConfigured: !!process.env.DATABASE_URL,
  jwtSecretConfigured: !!process.env.JWT_SECRET,
});

const app = express();

// Security middleware - Helmet.js for HTTP security headers
// Note: CSP is disabled for API endpoints to allow all requests
// In production, you may want to configure CSP more strictly
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API (allows all requests)
  crossOriginEmbedderPolicy: false, // Allow CORS for development
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resources
}));

// CORS middleware - Allow all origins in development for mobile/tablet testing
const isDevelopment = process.env.NODE_ENV === 'development';
app.use(cors({
  origin: isDevelopment ? true : FRONTEND_URL, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request size limits for security (prevent DoS attacks)
// JSON body limit: 10MB (for cover letters and large payloads)
app.use(express.json({ limit: '10mb' }));
// URL encoded body limit: 1MB
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiting
app.use(rateLimiter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.get('/api/health', async (_req, res) => {
  const healthStatus: {
    status: string;
    message: string;
    timestamp: string;
    services?: {
      database?: { status: string; message?: string };
      ai?: { status: string; provider?: string; message?: string };
      email?: { status: string; message?: string };
      cache?: { status: string; message?: string };
    };
  } = {
    status: 'OK',
    message: 'JobCrawl API is running',
    timestamp: new Date().toISOString(),
    services: {},
  };

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    healthStatus.services!.database = { status: 'OK', message: 'Database connection successful' };
  } catch (error) {
    healthStatus.services!.database = { status: 'ERROR', message: 'Database connection failed' };
    healthStatus.status = 'DEGRADED';
  }

  // Check AI service
  try {
    const { getAIService } = await import('./services/ai/AIService');
    const aiService = getAIService();
    const provider = (aiService as any).aiProvider || 'unknown';
    const hasApiKey = provider === 'openrouter' 
      ? !!(aiService as any).openrouterApiKey
      : provider === 'gemini'
      ? !!(aiService as any).geminiApiKey
      : !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_key_here';
    
    healthStatus.services!.ai = {
      status: hasApiKey ? 'OK' : 'WARNING',
      provider,
      message: hasApiKey ? 'AI service configured' : 'AI API key not configured',
    };
  } catch (error) {
    healthStatus.services!.ai = { status: 'ERROR', message: 'AI service check failed' };
  }

  // Check email service (SMTP)
  try {
    const smtpConfigured = !!(process.env.SMTP_HOST || process.env.GMAIL_SMTP_HOST || process.env.ICLOUD_SMTP_HOST);
    healthStatus.services!.email = {
      status: smtpConfigured ? 'OK' : 'WARNING',
      message: smtpConfigured ? 'Email service configured' : 'Email service not configured',
    };
  } catch (error) {
    healthStatus.services!.email = { status: 'ERROR', message: 'Email service check failed' };
  }

  // Check cache service
  try {
    const { cacheService } = await import('./services/cache/CacheService');
    healthStatus.services!.cache = { status: 'OK', message: 'Cache service available' };
  } catch (error) {
    healthStatus.services!.cache = { status: 'WARNING', message: 'Cache service check failed' };
  }

  const statusCode = healthStatus.status === 'OK' ? 200 : healthStatus.status === 'DEGRADED' ? 503 : 200;
  res.status(statusCode).json(healthStatus);
});

// Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'JobCrawl API Documentation',
}));

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

// Helper function to get local IP address
function getLocalIP(): string | null {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        // Prefer 192.168.x.x addresses
        if (iface.address.startsWith('192.168.')) {
          return iface.address;
        }
      }
    }
  }
  // Fallback to first non-internal IPv4
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

// Start server - listen on all network interfaces (0.0.0.0) for mobile/tablet access
const server = app.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  // Log to Winston (console.log is handled by Winston in development)
  logInfo('Server started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    apiEndpoint: `http://localhost:${PORT}/api`,
    networkEndpoint: localIP ? `http://${localIP}:${PORT}/api` : 'N/A',
    message: `JobCrawl Backend running on http://localhost:${PORT}${localIP ? ` and http://${localIP}:${PORT}` : ''}`,
  });
  
  // Also log to console for visibility
  console.log('\n🚀 JobCrawl Backend Server Started!');
  console.log(`   Local:   http://localhost:${PORT}/api`);
  if (localIP) {
    console.log(`   Network: http://${localIP}:${PORT}/api`);
    console.log(`\n📱 For mobile/tablet testing, use: http://${localIP}:${PORT}/api`);
  }
  console.log('');
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
  // Winston logger will handle console output
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logError('Unhandled Rejection', reason instanceof Error ? reason : new Error(String(reason)), {
    promise: String(promise),
  });
  // Winston logger will handle console output
});

export default app;

