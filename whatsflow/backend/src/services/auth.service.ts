import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';
import { generateToken } from '../utils/jwt.js';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
  async register(email: string, password: string, fullName: string) {
    // Check if user exists
    const existingUsers: any = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Create user
    await query(
      'INSERT INTO users (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)',
      [userId, email, passwordHash, fullName]
    );

    // Auto-create business profile
    const businessProfileId = uuidv4();
    await query(
      'INSERT INTO business_profiles (id, user_id, business_name) VALUES (?, ?, ?)',
      [businessProfileId, userId, `${fullName}'s Business`]
    );

    // Generate token
    const token = generateToken({ userId, email });

    return {
      token,
      user: {
        id: userId,
        email,
        fullName,
        businessProfileId,
      },
    };
  }

  async login(email: string, password: string) {
    // Get user
    const users: any = await query(
      'SELECT id, email, password_hash, full_name, is_active FROM users WHERE email = ?',
      [email]
    );

    if (!Array.isArray(users) || users.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = users[0];

    if (!user.is_active) {
      throw new Error('Account is disabled');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Get business profile
    const profiles: any = await query(
      'SELECT id FROM business_profiles WHERE user_id = ? LIMIT 1',
      [user.id]
    );

    const businessProfileId = Array.isArray(profiles) && profiles.length > 0 ? profiles[0].id : undefined;

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        businessProfileId,
      },
    };
  }

  async getUserProfile(userId: string) {
    const users: any = await query(
      'SELECT id, email, full_name, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (!Array.isArray(users) || users.length === 0) {
      throw new Error('User not found');
    }

    return users[0];
  }
}
