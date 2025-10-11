import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import configurations
import pool from './config/database.js';
import redis from './config/redis.js';
import logger from './utils/logger.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import whatsappRoutes from './routes/whatsapp.routes.js';
import contactRoutes from './routes/contact.routes.js';
import messageRoutes from './routes/message.routes.js';
import personaRoutes from './routes/persona.routes.js';
import deviceRoutes from './routes/device.routes.js';
import profileRoutes from './routes/profile.routes.js';
import productsRoutes from './routes/products.routes.js';
import contactListRoutes from './routes/contact-list.routes.js';
import broadcastRoutes from './routes/broadcast.routes.js';
import leadRoutes from './routes/lead.routes.js';
import planRoutes from './routes/plan.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import billingRoutes from './routes/billing.routes.js';
import adminRoutes from './routes/admin.routes.js';
import publicAPIRoutes from './routes/public-api.routes.js';
import apiKeysRoutes from './routes/api-keys.routes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.middleware.js';

// Import services
import { WhatsAppService } from './services/whatsapp.service.js';
import { broadcastWorker } from './workers/broadcast.worker.js';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();
const httpServer = createServer(app);

// Create Socket.IO server for real-time updates
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

// Serve uploads directory
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');

    // Check Redis connection
    await redis.ping();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: 'Service unavailable',
    });
  }
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/whatsapp', whatsappRoutes);
app.use('/api/v1/contacts', contactRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/personas', personaRoutes);
app.use('/api/v1/devices', deviceRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/contact-lists', contactListRoutes);
app.use('/api/v1/broadcasts', broadcastRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/plans', planRoutes);
app.use('/api/v1/subscription', subscriptionRoutes);
app.use('/api/v1/billing', billingRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/api-keys', apiKeysRoutes);
app.use('/api/public/v1', publicAPIRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'WhatsFlow API',
    version: '1.0.0',
    documentation: '/api/docs',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on('join-business', (businessProfileId: string) => {
    socket.join(`business-${businessProfileId}`);
    logger.info(`Socket ${socket.id} joined business ${businessProfileId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, async () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🌐 CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);

  // Initialize WhatsApp connections on startup
  setImmediate(async () => {
    try {
      logger.info('🔄 Restoring WhatsApp connections...');
      const whatsappService = new WhatsAppService();
      await whatsappService.initializeAllConnections();
      logger.info('✅ WhatsApp connections restored');
    } catch (error) {
      logger.error('❌ Failed to restore WhatsApp connections:', error);
    }
  });

  // Start broadcast worker
  setImmediate(() => {
    try {
      logger.info('🔄 Starting broadcast worker...');
      broadcastWorker.start();
      logger.info('✅ Broadcast worker started');
    } catch (error) {
      logger.error('❌ Failed to start broadcast worker:', error);
    }
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');

  // Stop broadcast worker
  broadcastWorker.stop();

  httpServer.close(() => {
    logger.info('HTTP server closed');
  });

  await pool.end();
  await redis.quit();
  process.exit(0);
});

export default app;
