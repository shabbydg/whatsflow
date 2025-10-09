# WhatsFlow Backend - Complete Setup & Installation Guide

## 📋 Prerequisites

Before starting, install these on your computer:

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version` should show v18+

2. **MySQL** (v8 or higher)
   - Download: https://dev.mysql.com/downloads/mysql/
   - OR use XAMPP/WAMP for easy setup
   - Verify: `mysql --version`

3. **Redis** (for queue management)
   - Windows: https://github.com/microsoftarchive/redis/releases
   - Mac: `brew install redis`
   - Linux: `sudo apt-get install redis`
   - Verify: `redis-cli ping` should return "PONG"

4. **Git** (for version control)
   - Download: https://git-scm.com/

5. **VS Code** (recommended IDE)
   - Download: https://code.visualstudio.com/
   - Install extensions: ESLint, Prettier, MySQL

---

## 🗂️ Complete Project Structure

```
whatsflow/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts          # MySQL connection
│   │   │   ├── redis.ts             # Redis connection
│   │   │   └── env.ts               # Environment variables
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── BusinessProfile.ts
│   │   │   ├── WhatsAppConnection.ts
│   │   │   ├── Contact.ts
│   │   │   ├── Message.ts
│   │   │   ├── Tag.ts
│   │   │   └── Campaign.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── whatsapp.controller.ts
│   │   │   ├── contact.controller.ts
│   │   │   ├── message.controller.ts
│   │   │   └── campaign.controller.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── whatsapp.service.ts
│   │   │   ├── contact.service.ts
│   │   │   ├── message.service.ts
│   │   │   └── campaign.service.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── validate.middleware.ts
│   │   │   └── errorHandler.middleware.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── whatsapp.routes.ts
│   │   │   ├── contact.routes.ts
│   │   │   ├── message.routes.ts
│   │   │   └── campaign.routes.ts
│   │   ├── utils/
│   │   │   ├── logger.ts
│   │   │   ├── jwt.ts
│   │   │   └── encryption.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── app.ts                   # Main application file
│   ├── scripts/
│   │   └── setup-database.sql       # Database schema
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── contacts/
│   │   │   │   ├── messages/
│   │   │   │   ├── campaigns/
│   │   │   │   └── settings/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   ├── public/
│   ├── package.json
│   └── next.config.js
│
├── docker-compose.yml               # Optional: Docker setup
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start (Step-by-Step)

### Step 1: Create Project Directory

Open your terminal/command prompt:

```bash
# Create main folder
mkdir whatsflow
cd whatsflow

# Create backend folder
mkdir backend
cd backend
```

### Step 2: Initialize Backend

```bash
# Initialize Node.js project
npm init -y

# Install dependencies
npm install express cors dotenv mysql2 bcryptjs jsonwebtoken
npm install express-validator helmet morgan winston
npm install whatsapp-web.js qrcode-terminal
npm install bull ioredis
npm install socket.io

# Install TypeScript and dev dependencies
npm install -D typescript @types/node @types/express
npm install -D @types/cors @types/bcryptjs @types/jsonwebtoken
npm install -D ts-node nodemon
npm install -D @types/morgan
```

### Step 3: Create TypeScript Configuration

Create `tsconfig.json` in the backend folder:

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

### Step 4: Update package.json Scripts

Open `package.json` and add these scripts:

```json
{
  "name": "whatsflow-backend",
  "version": "1.0.0",
  "description": "WhatsFlow Backend API",
  "main": "dist/app.js",
  "scripts": {
    "dev": "nodemon src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "setup-db": "mysql -u root -p < scripts/setup-database.sql"
  },
  "keywords": ["whatsapp", "api", "business"],
  "author": "Your Name",
  "license": "MIT"
}
```

### Step 5: Create Environment Variables

Create `.env` file in backend root:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=whatsflow
DB_USER=root
DB_PASSWORD=your_mysql_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# WhatsApp Configuration
WHATSAPP_SESSION_PATH=./whatsapp-sessions

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

**IMPORTANT:** Replace `your_mysql_password` with your actual MySQL password!

### Step 6: Create Database Schema

Create `scripts/setup-database.sql`:

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS whatsflow;
USE whatsflow;

-- Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email)
);

-- Business profiles table
CREATE TABLE business_profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    website VARCHAR(500),
    description TEXT,
    business_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- WhatsApp connections table
CREATE TABLE whatsapp_connections (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    business_profile_id VARCHAR(36) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    connection_mode VARCHAR(20) DEFAULT 'whatsapp-web',
    status VARCHAR(20) DEFAULT 'disconnected',
    session_data TEXT,
    qr_code TEXT,
    last_connected_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE,
    INDEX idx_business_profile (business_profile_id),
    INDEX idx_status (status)
);

-- Contacts table
CREATE TABLE contacts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    business_profile_id VARCHAR(36) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    name VARCHAR(255),
    profile_pic_url VARCHAR(500),
    is_business BOOLEAN DEFAULT FALSE,
    metadata JSON,
    first_message_at TIMESTAMP NULL,
    last_message_at TIMESTAMP NULL,
    total_messages INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_contact (business_profile_id, phone_number),
    INDEX idx_business_profile (business_profile_id),
    INDEX idx_phone (phone_number),
    INDEX idx_last_message (last_message_at)
);

-- Tags table
CREATE TABLE tags (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    business_profile_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_tag (business_profile_id, name),
    INDEX idx_business_profile (business_profile_id)
);

-- Contact tags (many-to-many)
CREATE TABLE contact_tags (
    contact_id VARCHAR(36) NOT NULL,
    tag_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (contact_id, tag_id),
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Messages table
CREATE TABLE messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    business_profile_id VARCHAR(36) NOT NULL,
    contact_id VARCHAR(36) NOT NULL,
    whatsapp_message_id VARCHAR(255),
    direction ENUM('inbound', 'outbound') NOT NULL,
    message_type VARCHAR(20) NOT NULL,
    content TEXT,
    media_url VARCHAR(500),
    status VARCHAR(20),
    is_from_bot BOOLEAN DEFAULT FALSE,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
    INDEX idx_business_profile (business_profile_id),
    INDEX idx_contact (contact_id),
    INDEX idx_created_at (created_at),
    INDEX idx_direction (direction)
);

-- Campaigns table
CREATE TABLE campaigns (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    business_profile_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    message_content TEXT NOT NULL,
    media_url VARCHAR(500),
    target_type VARCHAR(20) NOT NULL,
    target_tags JSON,
    status VARCHAR(20) DEFAULT 'draft',
    scheduled_at TIMESTAMP NULL,
    total_recipients INT DEFAULT 0,
    sent_count INT DEFAULT 0,
    delivered_count INT DEFAULT 0,
    read_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE,
    INDEX idx_business_profile (business_profile_id),
    INDEX idx_status (status)
);

-- Campaign recipients table
CREATE TABLE campaign_recipients (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    campaign_id VARCHAR(36) NOT NULL,
    contact_id VARCHAR(36) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    sent_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    read_at TIMESTAMP NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
    INDEX idx_campaign (campaign_id),
    INDEX idx_status (status)
);

-- API keys table
CREATE TABLE api_keys (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    business_profile_id VARCHAR(36) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    last_used_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE,
    INDEX idx_business_profile (business_profile_id)
);

-- Daily stats table
CREATE TABLE daily_stats (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    business_profile_id VARCHAR(36) NOT NULL,
    date DATE NOT NULL,
    messages_sent INT DEFAULT 0,
    messages_received INT DEFAULT 0,
    new_contacts INT DEFAULT 0,
    active_contacts INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_stat (business_profile_id, date),
    INDEX idx_business_profile (business_profile_id),
    INDEX idx_date (date)
);
```

### Step 7: Setup Database

Run this command (you'll be prompted for MySQL password):

```bash
mysql -u root -p < scripts/setup-database.sql
```

Or manually:
1. Open MySQL Workbench or command line
2. Copy and paste the SQL from `setup-database.sql`
3. Execute it

---

## 📝 Next Steps

Now that setup is complete, I'll provide you with:

1. **All the TypeScript code files** (controllers, services, models, etc.)
2. **Frontend setup** (Next.js dashboard)
3. **Testing guide**
4. **Deployment guide**

The backend structure is ready. You should now have:
- ✅ Node.js project initialized
- ✅ All dependencies installed
- ✅ TypeScript configured
- ✅ MySQL database created with all tables
- ✅ Environment variables set up

**Ready for the actual code files?** Let me know and I'll create all the backend code next!