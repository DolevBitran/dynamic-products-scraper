import { Request, Response } from 'express';
import User, { IUserDocument, ROLES } from '../models/User';

// Get all users
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Find all users but exclude password field
    const users = await User.find({}).select('-password');

    // Format the response data
    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name || 'Unnamed User',
      email: user.email,
      role: `${user.role}${user._id.toString() === req.user?.userId ? '(Current User)' : ''}`,
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : undefined
    }));

    res.status(200).json({
      success: true,
      count: users.length,
      users: formattedUsers
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching users',
      error
    });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name || 'Unnamed User',
        email: user.email,
        role: user.role,
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : undefined
      }
    });
  } catch (error: any) {
    console.error('Error fetching current user:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching current user',
      error
    });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Check if user is updating their own profile or is an admin
    if (id !== req.user?.userId) {
      res.status(403).json({ success: false, message: 'Not authorized to update this user' });
      return;
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ success: false, message: 'Invalid email format' });
        return;
      }

      // Check if email is already in use by another user
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        res.status(400).json({ success: false, message: 'Email is already in use by another user' });
        return;
      }
    }

    // Create update object with only the fields that are provided
    const updateData: { name?: string; email?: string; role?: string } = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name || 'Unnamed User',
        email: updatedUser.email,
        role: updatedUser.role || 'User',
        createdAt: updatedUser.createdAt ? new Date(updatedUser.createdAt).toISOString().split('T')[0] : undefined
      }
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating user',
      error
    });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400).json({ success: false, message: 'Invalid user ID format' });
      return;
    }

    // Get the current user to check their role
    const currentUser = await User.findById(req.user?.userId);
    const isAdmin = currentUser?.role === ROLES.ADMIN;

    // Only allow users to delete their own account or admin to delete any account
    if (id !== req.user?.userId && !isAdmin) {
      res.status(403).json({ success: false, message: 'Not authorized to delete this user' });
      return;
    }

    // Check if user exists before attempting to delete
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Don't allow deleting the last admin user
    if (userToDelete.role === ROLES.ADMIN) {
      const adminCount = await User.countDocuments({ role: ROLES.ADMIN });
      if (adminCount <= 1) {
        res.status(400).json({
          success: false,
          message: 'Cannot delete the last admin user'
        });
        return;
      }
    }

    // Delete the user
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      deletedUserId: id
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting user',
      error
    });
  }
};
