#!/bin/bash
# FILE: setup-whatsflow.sh
# Complete automated setup script for WhatsFlow platform
# Run this in Cursor terminal: bash setup-whatsflow.sh

set -e  # Exit on any error

echo "🚀 WhatsFlow Automated Setup Starting..."
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}→ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check prerequisites
print_info "Checking prerequisites..."

command -v node >/dev/null 2>&1 || { print_error "Node.js is required but not installed. Install from https://nodejs.org"; exit 1; }
command -v mysql >/dev/null 2>&1 || { print_error "MySQL is required but not installed."; exit 1; }
command -v redis-cli >/dev/null 2>&1 || { print_error "Redis is required but not installed."; exit 1; }

print_success "All prerequisites found!"

# Create main project directory
print_info "Creating project structure..."
mkdir -p whatsflow
cd whatsflow

# ============================================
# BACKEND SETUP
# ============================================

print_info "Setting up backend..."
mkdir -p backend
cd backend

# Create backend directory structure
mkdir -p src/{config,controllers,services,middleware,routes,utils,types}
mkdir -p scripts logs whatsapp-sessions uploads/media

print_success "Backend directories created"

# Create package.json
print_info "Creating backend package.json..."
cat > package.json << 'EOF'
{
  "name": "whatsflow-backend",
  "version": "1.0.0",
  "description": "WhatsFlow Backend API",
  "main": "dist/app.js",
  "scripts": {
    "dev": "nodemon --exec ts-node src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js"
  },
  "keywords": ["whatsapp", "api", "business"],
  "author": "",
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
    "uuid": "^9.0.1",
    "multer": "^1.4.5-lts.1"
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
    "@types/multer": "^1.4.11",
    "ts-node": "^10.9.2",
    "nodemon": "^3.0.2"
  }
}
EOF

print_success "package.json created"

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
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
EOF

print_success "tsconfig.json created"

# Create .env template
cat > .env << 'EOF'
NODE_ENV=development
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=whatsflow
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-32-characters
JWT_EXPIRES_IN=7d

WHATSAPP_SESSION_PATH=./whatsapp-sessions

CORS_ORIGIN=http://localhost:3000
EOF

print_success ".env template created"

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
dist/
.env
logs/
*.log
whatsapp-sessions/
uploads/
.DS_Store
EOF

print_success ".gitignore created"

# Install backend dependencies
print_info "Installing backend dependencies (this may take 2-3 minutes)..."
npm install --silent

print_success "Backend dependencies installed!"

# ============================================
# FRONTEND SETUP
# ============================================

cd ..
print_info "Setting up frontend..."

# Create Next.js app
print_info "Creating Next.js application..."
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir --no-import-alias --use-npm

cd frontend

# Install additional frontend dependencies
print_info "Installing frontend dependencies..."
npm install axios zustand socket.io-client date-fns clsx lucide-react qrcode.react --silent

print_success "Frontend dependencies installed!"

# Create .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
EOF

print_success ".env.local created"

# Update next.config.js
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
EOF

# Update tailwind.config.ts
cat > tailwind.config.ts << 'EOF'
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
      },
    },
  },
  plugins: [],
}
export default config
EOF

print_success "Configuration files updated"

# Create frontend directory structure
mkdir -p src/components/{ui,auth,dashboard,contacts,messages,whatsapp}
mkdir -p src/lib
mkdir -p src/stores
mkdir -p src/types

print_success "Frontend directories created"

cd ..

# ============================================
# CREATE HELPER SCRIPTS
# ============================================

print_info "Creating helper scripts..."

# Create start script
cat > start-dev.sh << 'EOF'
#!/bin/bash
# Start both backend and frontend in development mode

echo "🚀 Starting WhatsFlow Development Servers..."

# Start backend in background
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend in background  
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo "✓ Backend running on http://localhost:5000 (PID: $BACKEND_PID)"
echo "✓ Frontend running on http://localhost:3000 (PID: $FRONTEND_PID)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
EOF

chmod +x start-dev.sh

# Create database setup script
cat > backend/scripts/create-db.sh << 'EOF'
#!/bin/bash
# Create database and user

echo "Creating WhatsFlow database..."

mysql -u root -p << MYSQL_SCRIPT
CREATE DATABASE IF NOT EXISTS whatsflow;
GRANT ALL PRIVILEGES ON whatsflow.* TO 'whatsflow_user'@'localhost' IDENTIFIED BY 'whatsflow_password';
FLUSH PRIVILEGES;
MYSQL_SCRIPT

echo "✓ Database created successfully!"
echo "You can now run: npm run setup-db"
EOF

chmod +x backend/scripts/create-db.sh

print_success "Helper scripts created"

# ============================================
# FINAL INSTRUCTIONS
# ============================================

cd ..

echo ""
echo "================================================"
print_success "WhatsFlow setup complete!"
echo "================================================"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Configure your MySQL password:"
echo "   ${BLUE}nano whatsflow/backend/.env${NC}"
echo "   Update DB_PASSWORD with your MySQL root password"
echo ""
echo "2. Create the database:"
echo "   ${BLUE}cd whatsflow/backend && mysql -u root -p < scripts/setup-database.sql${NC}"
echo ""
echo "3. Copy code files from artifacts to:"
echo "   ${BLUE}whatsflow/backend/src/${NC} (backend code)"
echo "   ${BLUE}whatsflow/frontend/src/${NC} (frontend code)"
echo ""
echo "4. Start development servers:"
echo "   ${BLUE}cd whatsflow && bash start-dev.sh${NC}"
echo ""
echo "5. Open browser:"
echo "   Frontend: ${BLUE}http://localhost:3000${NC}"
echo "   Backend API: ${BLUE}http://localhost:5000${NC}"
echo ""
echo "================================================"
echo ""
echo "💡 TIP: Use Cursor's AI to help copy the code files!"
echo "Just say: 'Copy all backend code files from the artifacts'"
echo ""

# ============================================
# FILE: create-all-files.sh
# ============================================
# This script creates ALL code files automatically
# Run after setup-whatsflow.sh completes

cat > whatsflow/create-all-files.sh << 'CREATEFILES'
#!/bin/bash
# Automated file creation for WhatsFlow
# This creates empty files with the correct structure
# You'll then paste code from artifacts

echo "📁 Creating all WhatsFlow code files..."

cd backend/src

# Types
cat > types/index.ts << 'EOF'
// Paste code from artifact: Backend Core Files - Part 1
// File: src/types/index.ts
export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

// Add all other types from the artifact...
EOF

# Config files
cat > config/database.ts << 'EOF'
// Paste code from artifact: Backend Core Files - Part 1
// File: src/config/database.ts
EOF

cat > config/redis.ts << 'EOF'
// Paste code from artifact: Backend Core Files - Part 1
// File: src/config/redis.ts
EOF

# Utils
cat > utils/jwt.ts << 'EOF'
// Paste code from artifact: Backend Core Files - Part 1
// File: src/utils/jwt.ts
EOF

cat > utils/logger.ts << 'EOF'
// Paste code from artifact: Backend Core Files - Part 1
// File: src/utils/logger.ts
EOF

# Middleware
cat > middleware/auth.middleware.ts << 'EOF'
// Paste code from artifact: Authentication & Middleware Files
// File: src/middleware/auth.middleware.ts
EOF

cat > middleware/errorHandler.middleware.ts << 'EOF'
// Paste code from artifact: Authentication & Middleware Files
// File: src/middleware/errorHandler.middleware.ts
EOF

# Services
cat > services/auth.service.ts << 'EOF'
// Paste code from artifact: Authentication & Middleware Files
// File: src/services/auth.service.ts
EOF

cat > services/whatsapp.service.ts << 'EOF'
// Paste code from artifact: Enhanced Real-time Messaging - Backend Updates
// File: src/services/whatsapp.service.ts (ENHANCED VERSION)
EOF

cat > services/contact.service.ts << 'EOF'
// Paste code from artifact: Contact & Message Services
// File: src/services/contact.service.ts
EOF

cat > services/message.service.ts << 'EOF'
// Paste code from artifact: Contact & Message Services
// File: src/services/message.service.ts
EOF

# Controllers
cat > controllers/auth.controller.ts << 'EOF'
// Paste code from artifact: Authentication & Middleware Files
// File: src/controllers/auth.controller.ts
EOF

cat > controllers/whatsapp.controller.ts << 'EOF'
// Paste code from artifact: WhatsApp Service & Controllers
// File: src/controllers/whatsapp.controller.ts
EOF

cat > controllers/contact.controller.ts << 'EOF'
// Paste code from artifact: Contact & Message Services
// File: src/controllers/contact.controller.ts
EOF

cat > controllers/message.controller.ts << 'EOF'
// Paste code from artifact: Contact & Message Services
// File: src/controllers/message.controller.ts
EOF

# Routes
cat > routes/auth.routes.ts << 'EOF'
// Paste code from artifact: Authentication & Middleware Files
// File: src/routes/auth.routes.ts
EOF

cat > routes/whatsapp.routes.ts << 'EOF'
// Paste code from artifact: WhatsApp Service & Controllers
// File: src/routes/whatsapp.routes.ts
EOF

cat > routes/contact.routes.ts << 'EOF'
// Paste code from artifact: Contact & Message Services
// File: src/routes/contact.routes.ts
EOF

cat > routes/message.routes.ts << 'EOF'
// Paste code from artifact: Contact & Message Services
// File: src/routes/message.routes.ts
EOF

# Main app
cat > app.ts << 'EOF'
// Paste code from artifact: Main Application File & Server Setup
// File: src/app.ts
EOF

# Database script
cd ../scripts
cat > setup-database.sql << 'EOF'
-- Paste code from artifact: Backend Setup Guide
-- File: scripts/setup-database.sql
EOF

echo "✓ All backend files created!"
echo ""
echo "Now create frontend files..."

cd ../../frontend/src

# Frontend types
cat > types/index.ts << 'EOF'
// Paste code from artifact: Frontend Core Files
// File: src/types/index.ts
EOF

# Lib files
cat > lib/api.ts << 'EOF'
// Paste code from artifact: Frontend Core Files
// File: src/lib/api.ts
EOF

cat > lib/utils.ts << 'EOF'
// Paste code from artifact: Frontend Core Files
// File: src/lib/utils.ts
EOF

cat > lib/socket.ts << 'EOF'
// Paste code from artifact: Enhanced Features
// File: src/lib/socket.ts (ENHANCED VERSION)
EOF

# Stores
cat > stores/authStore.ts << 'EOF'
// Paste code from artifact: Frontend Core Files
// File: src/stores/authStore.ts
EOF

cat > stores/whatsappStore.ts << 'EOF'
// Paste code from artifact: Frontend Core Files
// File: src/stores/whatsappStore.ts
EOF

echo "✓ All frontend core files created!"
echo ""
echo "📝 Now you need to:"
echo "1. Open each file in Cursor"
echo "2. Delete the comment placeholder"
echo "3. Paste the actual code from the corresponding artifact"
echo ""
echo "💡 TIP: Use Cursor Composer to automate this!"
echo "Say: 'Replace the content of all these files with code from the artifacts'"

CREATEFILES

chmod +x whatsflow/create-all-files.sh

print_success "File creation script ready!"

echo ""
echo "📦 Additional helper script created:"
echo "   ${BLUE}bash whatsflow/create-all-files.sh${NC}"
echo "   This creates all code file templates"
echo ""
