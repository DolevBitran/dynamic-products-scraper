import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import User from '../models/User';
import { IWebsiteDocument } from '../models/Website';
import mongoose from 'mongoose';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        name?: string;
        email: string;
        websites: IWebsiteDocument[];
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
      const payload = jwt.verify(token, config.JWT_SECRET) as Express.Request['user'];

      if (!payload) {
        res.status(401).json({ success: false, message: 'Authentication invalid or expired' });
        return;
      }

      // Get user with populated websites
      const user = await User.findById(payload.userId).populate('websites').select('-password');

      if (!user) {
        res.status(401).json({ success: false, message: 'User not found' });
        return;
      }

      // After population, user.websites contains full Website documents, not just ObjectIds
      // Two-step type assertion with 'unknown' as recommended by TypeScript
      const populatedWebsites = user.websites ?
        (user.websites as unknown as IWebsiteDocument[]) :
        [];

      // Attach user to request
      req.user = {
        userId: payload.userId,
        name: payload.name,
        email: payload.email,
        websites: populatedWebsites
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
