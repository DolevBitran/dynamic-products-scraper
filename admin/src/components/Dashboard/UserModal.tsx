import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Button from '@components/Button/Button';
import type { Dispatch } from '@store/index';
import type { CreateUserData, User } from '@store/models/users';
import { ROLES } from '@utils/constants';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User; // If provided, we're editing an existing user
  mode: 'create' | 'edit';
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user, mode = 'create' }) => {
  const dispatch = useDispatch<Dispatch>();
  const [formData, setFormData] = useState<CreateUserData & { confirmPassword: string }>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ROLES.USER // Using lowercase to match the backend enum
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when user prop changes or modal opens
  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
        role: user.role || ROLES.USER
      });
    } else if (mode === 'create') {
      // Reset form when creating a new user
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: ROLES.USER // Using lowercase to match the backend enum
      });
    }

    // Clear any previous errors
    setError(null);
  }, [user, mode, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.email) {
      setError('Email is required');
      return;
    }

    // For create mode, password is required
    if (mode === 'create' && !formData.password) {
      setError('Password is required');
      return;
    }

    // Password confirmation check (only if password is provided)
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);

      if (mode === 'create') {
        // Call the API to create a new user
        const userData: CreateUserData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        };

        const result = await dispatch.users.createUser(userData);

        if (result.success) {
          // Reset form and close modal on success
          setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: ROLES.USER
          });
          onClose();
        } else {
          setError(result.error || 'Failed to create user');
        }
      } else if (mode === 'edit' && user) {
        // Call the API to update an existing user
        const updateData: Partial<User> = {
          id: user.id,
          name: formData.name,
          email: formData.email,
          role: formData.role
        };

        // Only include password if it was provided
        if (formData.password) {
          (updateData as any).password = formData.password;
        }

        const result: any = await dispatch.users.updateUser(updateData as User);

        if (result && result.success) {
          onClose();
        } else {
          setError((result && result.error) || 'Failed to update user');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{mode === 'create' ? 'Add New User' : 'Edit User'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••••••"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-input"
              >
                <option value={ROLES.USER}>User</option>
                <option value={ROLES.ADMIN}>Admin</option>
              </select>
            </div>

            <div className="form-actions">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="cancel-button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                {isSubmitting
                  ? (mode === 'create' ? 'Creating...' : 'Updating...')
                  : (mode === 'create' ? 'Create User' : 'Update User')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
