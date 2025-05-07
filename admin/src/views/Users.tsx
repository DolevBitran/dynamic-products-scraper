import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Button from '@components/Button/Button';
import { selectUsersState } from '@store/selectors/users';
import UsersTable from '../components/Dashboard/UsersTable';
import UserModal from '../components/Dashboard/UserModal';
import '../styles/Modal.css';

const Users: React.FC = () => {
  const { users, isLoading, error } = useSelector(selectUsersState);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddUser = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (isLoading && users.length === 0) {
    return <div className="loading-container">Loading users...</div>;
  }

  if (error && users.length === 0) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="users-view">
      <div className="users-header">
        <h2 className="text-xl font-semibold">Users</h2>
        <Button onClick={handleAddUser} variant="default">Add New User</Button>
      </div>

      {!users || users.length === 0 ? (
        <div className="no-users">
          <p>No users found. Add your first user to get started.</p>
        </div>
      ) : (
        <UsersTable users={users} />
      )}

      {/* User Modal */}
      <UserModal isOpen={isModalOpen} onClose={handleCloseModal} mode="create" />
    </div>
  );
};

export default Users;
