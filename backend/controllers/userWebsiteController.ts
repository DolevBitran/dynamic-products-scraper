import { Request, Response } from 'express';
import User, { ROLES } from '../models/User';
import Website from '../models/Website';
import mongoose from 'mongoose';

/**
 * Get all websites for a user
 * @route GET /api/users/:userId/websites
 * @access Private
 */
export const getUserWebsites = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        // Validate user ID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid user ID format'
            });
            return;
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }

        // Check authorization - user can only access their own websites
        if (userId !== req.user?.userId) {
            res.status(403).json({
                success: false,
                error: 'Not authorized to access these websites'
            });
            return;
        }

        // Get user with populated websites
        const userWithWebsites = await User.findById(userId).populate('websites');

        res.status(200).json({
            success: true,
            websites: userWithWebsites?.websites || []
        });
    } catch (error: any) {
        console.error('Error fetching user websites:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

/**
 * Add a website to a user's list
 * @route POST /api/users/:userId/websites
 * @access Private
 */
export const addWebsiteToUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const { websiteId } = req.body;

        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(websiteId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
            return;
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }

        // Check authorization - user can only modify their own websites
        if (userId !== req.user?.userId) {
            res.status(403).json({
                success: false,
                error: 'Not authorized to modify this user'
            });
            return;
        }

        // Check if website exists
        const website = await Website.findById(websiteId);
        if (!website) {
            res.status(404).json({
                success: false,
                error: 'Website not found'
            });
            return;
        }

        // Check if website is already in user's list
        if (user.websites && user.websites.includes(new mongoose.Types.ObjectId(websiteId))) {
            res.status(400).json({
                success: false,
                error: 'Website already added to user'
            });
            return;
        }

        // Add website to user's list
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { websites: websiteId } },
            { new: true }
        ).populate('websites');

        res.status(200).json({
            success: true,
            message: 'Website added to user successfully',
            user: updatedUser
        });
    } catch (error: any) {
        console.error('Error adding website to user:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

/**
 * Remove a website from a user's list
 * @route DELETE /api/users/:userId/websites/:websiteId
 * @access Private
 */
export const removeWebsiteFromUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, websiteId } = req.params;

        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(websiteId)) {
            res.status(400).json({
                success: false,
                error: 'Invalid ID format'
            });
            return;
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }

        // Check authorization - user can only modify their own websites
        if (userId !== req.user?.userId) {
            res.status(403).json({
                success: false,
                error: 'Not authorized to modify this user'
            });
            return;
        }

        // Remove website from user's list
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $pull: { websites: websiteId } },
            { new: true }
        ).populate('websites');

        res.status(200).json({
            success: true,
            message: 'Website removed from user successfully',
            user: updatedUser
        });
    } catch (error: any) {
        console.error('Error removing website from user:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};
