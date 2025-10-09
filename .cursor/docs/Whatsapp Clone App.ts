// FILE: src/app.ts
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import configurations
import pool from './config/database';
import redis from './config/redis';
import logger from './utils/logger';

// Import routes
import authRoutes from './routes/auth.routes';
import whatsappRoutes from './routes/whatsapp.routes';
import contactRoutes from './routes/contact.routes';
import messageRoutes from './routes/message.routes';

// Import middleware
import { errorHandler } from './middleware/errorHandler.middleware';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();
const httpServer = createServer(app);

// Create Socket.IO server for real-time updates
const io = new Server(httpServer, {
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

// Export io for use in services
export { io };

// Start server
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🌐 CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    logger.info('HTTP server closed');
  });
  
  await pool.end();
  await redis.quit();
  process.exit(0);
});

export default app;

// ============================================

// FILE: package.json
{
  "name": "whatsflow-backend",
  "version": "1.0.0",
  "description": "WhatsFlow Backend API - WhatsApp Business Platform",
  "main": "dist/app.js",
  "scripts": {
    "dev": "nodemon --exec ts-node src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "setup-db": "mysql -u root -p < scripts/setup-database.sql",
    "test": "echo \"No tests yet\" && exit 0"
  },
  "keywords": [
    "whatsapp",
    "api",
    "business",
    "messaging"
  ],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "mysql2": "^3.6.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "express-validator": "^7.0.1",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "winston": "^3.11.0",
    "whatsapp-web.js": "^1.23.0",
    "qrcode-terminal": "^0.12.0",
    "bull": "^4.12.0",
    "ioredis": "^5.3.2",
    "socket.io": "^4.6.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.10.6",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/morgan": "^1.9.9",
    "@types/uuid": "^9.0.7",
    "ts-node": "^10.9.2",
    "nodemon": "^3.0.2"
  }
}

// ============================================

// FILE: .env.example
# Copy this file to .env and update with your values

# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=whatsflow
DB_USER=root
DB_PASSWORD=your_mysql_password_here

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=change-this-to-a-random-secret-key-minimum-32-characters
JWT_EXPIRES_IN=7d

# WhatsApp Configuration
WHATSAPP_SESSION_PATH=./whatsapp-sessions

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# ============================================

// FILE: .gitignore
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Build output
dist/
build/

# Environment variables
.env
.env.local
.env.production

# Logs
logs/
*.log
npm-debug.log*

# WhatsApp sessions (contains sensitive data)
whatsapp-sessions/
.wwebjs_auth/
.wwebjs_cache/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Testing
coverage/

# Temporary files
tmp/
temp/

// ============================================

// FILE: README.md
# WhatsFlow Backend

WhatsApp Business Platform API

## Prerequisites

- Node.js v18+
- MySQL 8+
- Redis
- Git

## Quick Start

1. **Clone and setup:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Setup database:**
   ```bash
   # Create database and tables
   mysql -u root -p < scripts/setup-database.sql
   ```

4. **Start Redis:**
   ```bash
   # On Mac/Linux
   redis-server
   
   # On Windows (if installed via MSI)
   redis-server.exe
   ```

5. **Run development server:**
   ```bash
   npm run dev
   ```

Server will start on http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/profile` - Get user profile (requires auth)

### WhatsApp
- `POST /api/v1/whatsapp/connect` - Connect WhatsApp
- `GET /api/v1/whatsapp/status` - Get connection status
- `POST /api/v1/whatsapp/disconnect` - Disconnect
- `POST /api/v1/whatsapp/send` - Send message

### Contacts
- `GET /api/v1/contacts` - List contacts
- `GET /api/v1/contacts/:id` - Get contact details
- `POST /api/v1/contacts` - Create contact
- `PUT /api/v1/contacts/:id` - Update contact
- `DELETE /api/v1/contacts/:id` - Delete contact
- `GET /api/v1/contacts/search?q=term` - Search contacts
- `POST /api/v1/contacts/:id/tags` - Add tag to contact

### Tags
- `GET /api/v1/contacts/tags` - List all tags
- `POST /api/v1/contacts/tags` - Create tag

### Messages
- `GET /api/v1/messages` - List messages
- `GET /api/v1/messages/conversation/:contactId` - Get conversation
- `GET /api/v1/messages/stats` - Get message statistics

## Testing

### Test Registration:
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

### Test Login:
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the token from the response and use it for authenticated requests:

```bash
curl -X GET http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database, Redis configs
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── routes/          # API routes
│   ├── middleware/      # Auth, validation, error handling
│   ├── utils/           # Helper functions
│   ├── types/           # TypeScript types
│   └── app.ts           # Main application
├── scripts/
│   └── setup-database.sql
├── logs/                # Application logs
├── .env                 # Environment variables
└── package.json
```

## Deployment

### Build for production:
```bash
npm run build
```

### Start production server:
```bash
NODE_ENV=production npm start
```

## Troubleshooting

### MySQL Connection Error
- Check MySQL is running: `mysql --version`
- Verify credentials in `.env`
- Ensure database exists: `mysql -u root -p` then `SHOW DATABASES;`

### Redis Connection Error
- Check Redis is running: `redis-cli ping`
- Should return "PONG"

### WhatsApp Not Connecting
- Check `whatsapp-sessions` folder permissions
- Clear sessions: `rm -rf whatsapp-sessions/*`
- Restart server

## License

MIT