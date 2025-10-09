import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { query } from '../config/database.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    businessProfileId?: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);

    // Get user from database
    const users: any = await query(
      'SELECT id, email FROM users WHERE id = ? AND is_active = TRUE',
      [decoded.userId]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Get business profile
    const profiles: any = await query(
      'SELECT id FROM business_profiles WHERE user_id = ? LIMIT 1',
      [decoded.userId]
    );

    req.user = {
      id: users[0].id,
      email: users[0].email,
      businessProfileId: Array.isArray(profiles) && profiles.length > 0 ? profiles[0].id : undefined,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
