// FILE: src/config/database.ts
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'whatsflow',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const query = async (sql: string, params?: any[]) => {
  const [results] = await pool.execute(sql, params);
  return results;
};

export const getConnection = async () => {
  return await pool.getConnection();
};

export default pool;

// ============================================

// FILE: src/config/redis.ts
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

export default redis;

// ============================================

// FILE: src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const generateToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// ============================================

// FILE: src/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export default logger;

// ============================================

// FILE: src/types/index.ts
export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}

export interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  industry?: string;
  website?: string;
  description?: string;
  business_type?: string;
  created_at: Date;
  updated_at: Date;
}

export interface WhatsAppConnection {
  id: string;
  business_profile_id: string;
  phone_number: string;
  connection_mode: 'whatsapp-web' | 'baileys';
  status: 'connected' | 'disconnected' | 'qr_pending';
  session_data?: string;
  qr_code?: string;
  last_connected_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Contact {
  id: string;
  business_profile_id: string;
  phone_number: string;
  name?: string;
  profile_pic_url?: string;
  is_business: boolean;
  metadata?: any;
  first_message_at?: Date;
  last_message_at?: Date;
  total_messages: number;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: string;
  business_profile_id: string;
  contact_id: string;
  whatsapp_message_id?: string;
  direction: 'inbound' | 'outbound';
  message_type: string;
  content?: string;
  media_url?: string;
  status?: string;
  is_from_bot: boolean;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export interface Tag {
  id: string;
  business_profile_id: string;
  name: string;
  color: string;
  created_at: Date;
}

export interface Campaign {
  id: string;
  business_profile_id: string;
  name: string;
  message_content: string;
  media_url?: string;
  target_type: 'all' | 'tags' | 'custom';
  target_tags?: string[];
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  scheduled_at?: Date;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  created_at: Date;
  updated_at: Date;
}