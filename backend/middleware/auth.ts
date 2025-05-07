import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import User from '../models/User';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        name?: string;
        email: string;
      };
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header and attaches user to request
 */
const authenticateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication invalid' });
      return;
    }

    // Get token from header
    const token = authHeader.split(' ')[1];

    try {
      // Verify token
      const payload = jwt.verify(token, config.JWT_SECRET) as {
        userId: string;
        name?: string;
        email: string;
      };

      // Attach user to request
      req.user = {
        userId: payload.userId,
        name: payload.name,
        email: payload.email
      };

      next();
    } catch (error) {
      res.status(401).json({ success: false, message: 'Authentication invalid or expired' });
      return;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
    return;
  }
};

export default authenticateUser;
