import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUserDocument, ROLES } from '../models/User';
import config from '../config/config';

// Type for JWT payload
interface TokenPayload {
  userId: string;
  name?: string;
  email: string;
}

// Type for tokens response
interface TokensResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Create JWT tokens (access and refresh)
 */
const createTokens = (user: IUserDocument): TokensResponse => {
  // Create payload for tokens
  const payload: TokenPayload = {
    userId: user._id.toString(),
    name: user.name,
    email: user.email
  };

  // Create access token
  const accessToken = jwt.sign(
    payload,
    config.JWT_SECRET,
    { expiresIn: config.JWT_LIFETIME } as jwt.SignOptions
  );

  // Create refresh token
  const refreshToken = jwt.sign(
    payload,
    config.JWT_REFRESH_SECRET,
    { expiresIn: config.JWT_REFRESH_LIFETIME } as jwt.SignOptions
  );

  return { accessToken, refreshToken };
};

/**
 * Register a new user
 */
const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email already in use' });
      return;
    }

    // Create new user
    const user = await User.create({ email, password, name, role: role || ROLES.USER });

    // Create tokens
    const tokens = createTokens(user);

    // Return success with tokens
    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        websites: user.websites,
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : undefined
      },
      ...tokens
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Login a user
 */
const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }

    // Find user and populate websites
    const user = await User.findOne({ email }).populate('websites');
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Create tokens
    const tokens = createTokens(user);

    // Return success with tokens
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        websites: user.websites,
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : undefined
      },
      ...tokens
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Refresh access token using refresh token
 */
const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    // Check if refresh token is provided
    if (!refreshToken) {
      res.status(400).json({ success: false, message: 'Refresh token is required' });
      return;
    }

    // Verify refresh token
    let payload: TokenPayload;
    try {
      const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as TokenPayload;
      payload = decoded;
    } catch (error) {
      res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
      return;
    }

    // Find user and populate websites
    const user = await User.findById(payload.userId).populate('websites');
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    // Create new tokens
    const tokens = createTokens(user);

    // Return success with tokens
    res.status(200).json({
      success: true,
      ...tokens
    });
  } catch (error: any) {
    console.error('Refresh token error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

/**
 * Get current user information
 */
const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // User is already attached to request by auth middleware
    const user = req.user;

    res.status(200).json({
      success: true,
      user
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export {
  register,
  login,
  refreshToken,
  getCurrentUser
};
