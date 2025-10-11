# 🚀 WhatsFlow - Complete Installation & Testing Guide

## 📋 Table of Contents
1. [System Requirements](#system-requirements)
2. [Step-by-Step Installation](#step-by-step-installation)
3. [Running the Application](#running-the-application)
4. [Testing the API](#testing-the-api)
5. [Troubleshooting](#troubleshooting)
6. [Next Steps](#next-steps)

---

## 🖥️ System Requirements

### Required Software:
- **Node.js** (v18 or higher)
- **MySQL** (v8 or higher)
- **Redis** (latest stable)
- **Git**
- **VS Code** (recommended)

### Operating System:
- Windows 10/11
- macOS 10.15+
- Linux (Ubuntu 20.04+)

---

## 📥 Step-by-Step Installation

### Step 1: Install Node.js

**Windows/Mac:**
1. Go to https://nodejs.org/
2. Download LTS version (v18+)
3. Run installer, click "Next" through all steps
4. Verify installation:
   ```bash
   node --version
   # Should show v18.x.x or higher
   ```

**Linux (Ubuntu):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
```

### Step 2: Install MySQL

**Windows:**
1. Download MySQL Installer: https://dev.mysql.com/downloads/installer/
2. Run installer, choose "Developer Default"
3. Set root password (remember this!)
4. Complete installation

**Mac:**
```bash
brew install mysql
brew services start mysql
```

**Linux:**
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

**Verify MySQL:**
```bash
mysql --version
# Should show MySQL 8.x
```

### Step 3: Install Redis

**Windows:**
1. Download from: https://github.com/microsoftarchive/redis/releases
2. Download `Redis-x64-3.0.504.msi`
3. Install and start service

**Mac:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
```

**Verify Redis:**
```bash
redis-cli ping
# Should return: PONG
```

### Step 4: Install Git

**Windows:** https://git-scm.com/download/win
**Mac:** `brew install git`
**Linux:** `sudo apt install git`

### Step 5: Install VS Code (Optional but Recommended)

Download from: https://code.visualstudio.com/

**Recommended Extensions:**
- ESLint
- Prettier
- MySQL (by cweijan)
- Thunder Client (for API testing)

---

## 📁 Project Setup

### Step 1: Create Project Directory

Open Terminal/Command Prompt:

```bash
# Create main project folder
mkdir whatsflow
cd whatsflow

# Create backend folder
mkdir backend
cd backend
```

### Step 2: Initialize Node.js Project

```bash
npm init -y
```

### Step 3: Install Dependencies

```bash
# Main dependencies
npm install express cors dotenv mysql2 bcryptjs jsonwebtoken express-validator helmet morgan winston whatsapp-web.js qrcode-terminal bull ioredis socket.io uuid

# TypeScript and dev dependencies
npm install -D typescript @types/node @types/express @types/cors @types/bcryptjs @types/jsonwebtoken @types/morgan @types/uuid ts-node nodemon
```

This will take 2-5 minutes.

### Step 4: Create TypeScript Configuration

Create `tsconfig.json` file:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 5: Update package.json Scripts

Open `package.json` and replace the `"scripts"` section:

```json
"scripts": {
  "dev": "nodemon --exec ts-node src/app.ts",
  "build": "tsc",
  "start": "node dist/app.js",
  "setup-db": "mysql -u root -p < scripts/setup-database.sql"
}
```

### Step 6: Create Folder Structure

```bash
# Windows (PowerShell):
New-Item -ItemType Directory -Path src\config, src\controllers, src\services, src\routes, src\middleware, src\utils, src\types, scripts, logs

# Mac/Linux:
mkdir -p src/{config,controllers,services,routes,middleware,utils,types} scripts logs
```

### Step 7: Create Environment File

Create `.env` file in backend root:

```env
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=whatsflow
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=change-this-to-a-super-secret-random-key-minimum-32-chars
JWT_EXPIRES_IN=7d

WHATSAPP_SESSION_PATH=./whatsapp-sessions

CORS_ORIGIN=http://localhost:3000
```

**IMPORTANT:** Replace `YOUR_MYSQL_PASSWORD_HERE` with your actual MySQL root password!

### Step 8: Create Database Schema

Create `scripts/setup-database.sql` and paste the complete SQL schema from the "Backend Core Files - Part 1" artifact.

### Step 9: Setup Database

Run this command:

```bash
mysql -u root -p < scripts/setup-database.sql
```

You'll be prompted for your MySQL password. Enter it.

**OR** manually in MySQL:
1. Open MySQL Workbench or command line
2. Login with: `mysql -u root -p`
3. Copy/paste the SQL from `setup-database.sql`
4. Execute

**Verify database created:**
```bash
mysql -u root -p -e "SHOW DATABASES;"
# Should show 'whatsflow' in the list
```

### Step 10: Create All Code Files

Now copy all the code from the artifacts I created into the appropriate files:

**From "Backend Core Files - Part 1":**
- `src/config/database.ts`
- `src/config/redis.ts`
- `src/utils/jwt.ts`
- `src/utils/logger.ts`
- `src/types/index.ts`

**From "Authentication & Middleware Files":**
- `src/middleware/auth.middleware.ts`
- `src/middleware/errorHandler.middleware.ts`
- `src/services/auth.service.ts`
- `src/controllers/auth.controller.ts`
- `src/routes/auth.routes.ts`

**From "WhatsApp Service & Controllers":**
- `src/services/whatsapp.service.ts`
- `src/controllers/whatsapp.controller.ts`
- `src/routes/whatsapp.routes.ts`

**From "Contact & Message Services":**
- `src/services/contact.service.ts`
- `src/services/message.service.ts`
- `src/controllers/contact.controller.ts`
- `src/controllers/message.controller.ts`
- `src/routes/contact.routes.ts`
- `src/routes/message.routes.ts`

**From "Main Application File":**
- `src/app.ts`
- `.gitignore`
- `README.md`

---

## 🏃 Running the Application

### Step 1: Start Redis

**Windows:**
- Redis should auto-start if installed as service
- OR run: `redis-server.exe`

**Mac/Linux:**
```bash
redis-server
```

Keep this terminal open.

### Step 2: Start Development Server

Open a **new terminal** in the `backend` folder:

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 5000
📝 Environment: development
🌐 CORS origin: http://localhost:3000
✅ Redis connected
```

If you see errors, check the [Troubleshooting](#troubleshooting) section.

---

## 🧪 Testing the API

### Method 1: Using cURL (Command Line)

#### 1. Test Health Check
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-06T...",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

#### 2. Register a User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"fullName\":\"Test User\"}"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "email": "test@example.com",
      "fullName": "Test User"
    }
  }
}
```

**SAVE THE TOKEN!** You'll need it for the next requests.

#### 3. Test Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

#### 4. Get User Profile (requires token)
```bash
curl -X GET http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Replace `YOUR_TOKEN_HERE` with the actual token from step 2.

#### 5. Create a Business Profile

First, you need to manually create a business profile in the database:

```bash
mysql -u root -p whatsflow
```

Then run:
```sql
INSERT INTO business_profiles (id, user_id, business_name, industry) 
VALUES (UUID(), 'YOUR_USER_ID', 'My Test Business', 'E-commerce');
```

Replace `YOUR_USER_ID` with the user ID from the registration response.

#### 6. Test WhatsApp Connection
```bash
curl -X POST http://localhost:5000/api/v1/whatsapp/connect \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"+1234567890\"}"
```

#### 7. Get WhatsApp Status & QR Code
```bash
curl -X GET http://localhost:5000/api/v1/whatsapp/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

This will return a QR code string. You'll need to scan this with WhatsApp to connect.

### Method 2: Using Postman or Thunder Client

1. **Install Thunder Client** (VS Code extension) or **Postman**

2. **Create New Collection** named "WhatsFlow API"

3. **Add Requests:**

**Register:**
- Method: POST
- URL: `http://localhost:5000/api/v1/auth/register`
- Headers: `Content-Type: application/json`
- Body (JSON):
  ```json
  {
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }
  ```

**Login:**
- Method: POST
- URL: `http://localhost:5000/api/v1/auth/login`
- Headers: `Content-Type: application/json`
- Body (JSON):
  ```json
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```

**Get Profile:** (save token as environment variable)
- Method: GET
- URL: `http://localhost:5000/api/v1/auth/profile`
- Headers: `Authorization: Bearer {{token}}`

**Get Contacts:**
- Method: GET
- URL: `http://localhost:5000/api/v1/contacts`
- Headers: `Authorization: Bearer {{token}}`

### Method 3: Using the Browser

For GET requests only:

1. Open browser
2. Go to: `http://localhost:5000/health`
3. You should see JSON response

---

## 🔍 Troubleshooting

### Issue: "Cannot find module"

**Solution:**
```bash
npm install
```

### Issue: "Error: connect ECONNREFUSED 127.0.0.1:3306"

**Problem:** MySQL not running

**Solution:**
```bash
# Windows
services.msc → Start MySQL80

# Mac
brew services start mysql

# Linux
sudo systemctl start mysql
```

### Issue: "Access denied for user 'root'@'localhost'"

**Problem:** Wrong MySQL password in `.env`

**Solution:**
1. Open `.env`
2. Update `DB_PASSWORD` with correct password
3. Restart server

### Issue: "Redis connection refused"

**Problem:** Redis not running

**Solution:**
```bash
# Windows
redis-server.exe

# Mac/Linux
redis-server
```

### Issue: "Port 5000 already in use"

**Solution:**
1. Change PORT in `.env` to 5001
2. OR kill process using port 5000

### Issue: TypeScript errors

**Solution:**
```bash
npm install -D @types/node @types/express
```

### Issue: "Cannot create whatsapp-sessions folder"

**Solution:**
```bash
mkdir whatsapp-sessions
chmod 755 whatsapp-sessions
```

---

## ✅ Verification Checklist

After installation, verify everything works:

- [ ] Server starts without errors
- [ ] Health check returns `"status": "healthy"`
- [ ] Can register a new user
- [ ] Can login and get token
- [ ] Can access protected endpoint with token
- [ ] Database has tables (check MySQL Workbench)
- [ ] Redis is connected
- [ ] Logs are being written to `logs/` folder

---

## 📊 Database Verification

Check your database was created correctly:

```bash
mysql -u root -p whatsflow -e "SHOW TABLES;"
```

You should see:
```
+------------------------+
| Tables_in_whatsflow    |
+------------------------+
| api_keys               |
| business_profiles      |
| campaign_recipients    |
| campaigns              |
| contact_tags           |
| contacts               |
| daily_stats            |
| messages               |
| tags                   |
| users                  |
| whatsapp_connections   |
+------------------------+
```

Check user table:
```bash
mysql -u root -p whatsflow -e "SELECT id, email, full_name FROM users;"
```

After registering, you should see your test user.

---

## 🎯 Next Steps

### Immediate Next Steps:

1. **Create Business Profile Automatically**
   
   Currently, you need to manually create a business profile. Let's add auto-creation on registration.
   
   I can provide updated code for this if you want.

2. **Test WhatsApp Connection**
   
   Once you have a business profile:
   - Call the `/api/v1/whatsapp/connect` endpoint
   - Get the QR code from `/api/v1/whatsapp/status`
   - Scan with your WhatsApp mobile app
   - Test sending a message

3. **Build the Frontend Dashboard**
   
   I can create the Next.js frontend for you with:
   - Login/Register pages
   - Dashboard to view contacts
   - WhatsApp connection interface
   - Message sending interface
   
   Would you like me to build this next?

4. **Add More Features**
   
   From the MVP roadmap:
   - Business profile creation on registration
   - Broadcast campaigns
   - Analytics dashboard
   - File uploads for media messages

---

## 📚 Understanding the Code Structure

### Key Files Explained:

**`src/app.ts`** - Main application entry point
- Sets up Express server
- Configures middleware
- Registers routes
- Starts Socket.IO for real-time updates

**`src/config/database.ts`** - MySQL connection
- Creates connection pool
- Provides query functions

**`src/config/redis.ts`** - Redis connection
- Used for session management
- Message queuing

**`src/services/auth.service.ts`** - Authentication logic
- User registration
- Password hashing with bcrypt
- JWT token generation
- Login validation

**`src/services/whatsapp.service.ts`** - WhatsApp integration
- Initializes WhatsApp Web client
- Handles QR code generation
- Manages message sending/receiving
- Stores active connections

**`src/controllers/*.controller.ts`** - HTTP request handlers
- Validate input
- Call services
- Return responses

**`src/routes/*.routes.ts`** - API endpoint definitions
- Define HTTP methods and paths
- Apply middleware (authentication)
- Route to controllers

**`src/middleware/auth.middleware.ts`** - JWT verification
- Checks authorization header
- Verifies token
- Attaches user to request

---

## 🔐 Important Security Notes

### Before Production:

1. **Change JWT Secret**
   - Generate a strong random key:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   - Update `JWT_SECRET` in `.env`

2. **Never Commit `.env`**
   - Already in `.gitignore`
   - Contains sensitive credentials

3. **Use Environment-Specific Configs**
   - Development: `.env`
   - Production: Set environment variables on server

4. **Enable HTTPS in Production**
   - Use Let's Encrypt for free SSL
   - Update `CORS_ORIGIN` to your production domain

5. **Rate Limiting**
   - Add rate limiting middleware for production
   - Prevent API abuse

---

## 🐛 Common Development Issues

### Issue: "Module not found" after adding new file

**Solution:** Restart the dev server:
```bash
# Ctrl+C to stop
npm run dev
```

### Issue: Database changes not reflected

**Solution:** 
1. Make sure you ran the SQL migrations
2. Restart the server
3. Check the database directly:
   ```bash
   mysql -u root -p whatsflow
   DESCRIBE users;
   ```

### Issue: WhatsApp QR Code not generating

**Solution:**
1. Check `whatsapp-sessions` folder exists
2. Check folder permissions
3. Clear old sessions: `rm -rf whatsapp-sessions/*`
4. Restart server

### Issue: Can't connect to MySQL from code but command line works

**Solution:**
1. Check `.env` has correct credentials
2. Ensure MySQL allows TCP connections
3. Try `DB_HOST=127.0.0.1` instead of `localhost`

---

## 📈 Performance Tips

### For Development:

1. **Use Nodemon** (already configured)
   - Auto-restarts on file changes
   - Faster development

2. **Check Logs**
   - Look in `logs/combined.log`
   - Debug issues faster

3. **Use MySQL Workbench**
   - Visualize database
   - Run queries easily

### For Production:

1. **Use PM2 Process Manager**
   ```bash
   npm install -g pm2
   pm2 start dist/app.js --name whatsflow
   pm2 logs whatsflow
   ```

2. **Enable Production Mode**
   ```bash
   NODE_ENV=production npm start
   ```

3. **Database Indexing**
   - Already added in schema
   - Improves query performance

4. **Redis Caching**
   - Cache frequently accessed data
   - Reduce database load

---

## 📝 API Documentation Quick Reference

### Authentication Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/v1/auth/register` | No | Create new user |
| POST | `/api/v1/auth/login` | No | Login user |
| GET | `/api/v1/auth/profile` | Yes | Get user info |

### WhatsApp Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/v1/whatsapp/connect` | Yes | Initialize connection |
| GET | `/api/v1/whatsapp/status` | Yes | Get QR code & status |
| POST | `/api/v1/whatsapp/disconnect` | Yes | Disconnect WhatsApp |
| POST | `/api/v1/whatsapp/send` | Yes | Send message |

### Contact Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/v1/contacts` | Yes | List contacts |
| GET | `/api/v1/contacts/:id` | Yes | Get contact details |
| POST | `/api/v1/contacts` | Yes | Create contact |
| PUT | `/api/v1/contacts/:id` | Yes | Update contact |
| DELETE | `/api/v1/contacts/:id` | Yes | Delete contact |
| GET | `/api/v1/contacts/search?q=term` | Yes | Search contacts |

### Message Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/v1/messages` | Yes | List messages |
| GET | `/api/v1/messages/conversation/:contactId` | Yes | Get chat history |
| GET | `/api/v1/messages/stats` | Yes | Get statistics |

---

## 🎓 Learning Resources

### If you want to understand the code better:

**Node.js & Express:**
- Official Docs: https://expressjs.com/
- Tutorial: https://www.youtube.com/watch?v=Oe421EPjeBE

**TypeScript:**
- Official Docs: https://www.typescriptlang.org/
- Handbook: https://www.typescriptlang.org/docs/handbook/

**MySQL:**
- W3Schools: https://www.w3schools.com/mysql/
- Official Docs: https://dev.mysql.com/doc/

**WhatsApp Web.js:**
- GitHub: https://github.com/pedroslopez/whatsapp-web.js
- Guide: https://wwebjs.dev/

**JWT Authentication:**
- JWT.io: https://jwt.io/introduction
- Tutorial: https://www.youtube.com/watch?v=mbsmsi7l3r4

---

## 🚀 What's Next?

You now have a fully functional WhatsApp Business API backend! Here's what you can do:

### Option 1: Build the Frontend (Recommended)
I can create a complete Next.js frontend dashboard with:
- Beautiful UI with TailwindCSS
- Login/Register pages
- Contact management
- WhatsApp connection interface
- Message sending
- Real-time updates

**Say "Build the frontend" and I'll start!**

### Option 2: Add More Backend Features
- Business profile auto-creation on registration
- Broadcast campaigns
- Message scheduling
- Analytics dashboard
- File upload for media messages
- Webhook system

**Tell me which feature you want next!**

### Option 3: Deploy to Production
I can guide you through:
- Setting up a VPS (DigitalOcean, AWS, etc.)
- Deploying with Docker
- Setting up NGINX reverse proxy
- Configuring SSL certificates
- Domain setup

### Option 4: Test WhatsApp Integration
Let's test the WhatsApp connection:
1. I'll guide you through connecting
2. We'll send your first message
3. Test receiving messages
4. Verify everything works

---

## 💡 Quick Tips

1. **Always keep terminal open** - You need to see server logs
2. **Test in Postman** - Easier than cURL for development
3. **Check logs** - Most errors are logged in `logs/combined.log`
4. **Use MySQL Workbench** - Visualize your data
5. **Commit often** - Use Git to save your progress
6. **Read error messages** - They usually tell you exactly what's wrong

---

## ✅ Success! You're Ready

If you've completed all the steps above, you now have:

✅ A working Node.js + TypeScript backend
✅ MySQL database with proper schema
✅ Redis for caching and queues
✅ WhatsApp integration ready
✅ JWT authentication working
✅ RESTful API endpoints
✅ Real-time updates via Socket.IO
✅ Proper error handling and logging

**Congratulations! 🎉**

---

## 🤝 Need Help?

**Common Questions:**

**Q: Can I use PostgreSQL instead of MySQL?**
A: Yes! I can modify the code for PostgreSQL. Just ask.

**Q: How do I deploy this?**
A: I can create a deployment guide for DigitalOcean, AWS, or Heroku.

**Q: Can you add feature X?**
A: Yes! Tell me what you need and I'll add it.

**Q: How do I backup the database?**
A: Use `mysqldump`:
```bash
mysqldump -u root -p whatsflow > backup.sql
```

**Q: How do I test without a real WhatsApp number?**
A: You need a real number, but you can use a secondary number for testing.

---

## 📞 What Would You Like to Do Next?

1. **Build the frontend dashboard?**
2. **Deploy to production?**
3. **Add more features?**
4. **Test WhatsApp connection now?**
5. **Fix a specific issue?**

Just let me know! I'm here to help you build this completely. 🚀