import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '@components/Button/Button';
import { selectUsersState } from '@store/selectors/users';
import UsersTable from '@components/Dashboard/UsersTable';
import UserModal from '@components/Dashboard/UserModal';
import type { Dispatch } from '@store/index';
import Loading from '@components/Loading/Loading';

const Users: React.FC = () => {
  const dispatch = useDispatch<Dispatch>();
  const { users, isLoading, error } = useSelector(selectUsersState);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    !users?.length && dispatch.users.fetchUsers();
  }, [dispatch.users]);

  const handleAddUser = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (isLoading && users.length === 0) {
    return <Loading />
  }

  if (error && users.length === 0) {
    return <div className="error-container">{error}</div>;
  }


  return (
    <div className="users-view">

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
