import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Button from '@components/Button/Button';
import UserModal from './UserModal';
import type { Dispatch } from '@store/index';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
}

interface UsersTableProps {
  users: User[];
}

const UsersTable: React.FC<UsersTableProps> = ({ users }) => {
  const dispatch = useDispatch<Dispatch>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const result: any = await dispatch.users.deleteUser(userId);
        
        if (!result || !result.success) {
          alert(result?.error || 'Failed to delete user');
        }
      } catch (error: any) {
        alert(`Error deleting user: ${error.message || 'Unknown error'}`);
      }
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="table-section">
      {isModalOpen && (
        <UserModal
          isOpen={isModalOpen}
          onClose={closeModal}
          user={selectedUser || undefined}
          mode={modalMode}
        />
      )}
      
      <div className="table-header">
        <div className="table-title">
          <span className="menu-item-icon">👥</span>
          <span>Users</span>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td className="user-cell">
                <div className="user-info">
                  <div className="user-avatar">
                    {user.name.charAt(0)}
                  </div>
                  <div className="user-name">
                    {user.name}
                  </div>
                </div>
              </td>
              <td>{user.email}</td>
              <td>
                <span className={`status-cell status-${user.role?.toLowerCase()}`}>
                  {user.role}
                </span>
              </td>
              <td>{user.createdAt}</td>
              <td>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEditUser(user)}
                    variant="default"
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteUser(user.id)}
                    variant="destructive"
                    size="sm"
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
