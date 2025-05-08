import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '@components/Button/Button';
import UserModal from './UserModal';
import type { Dispatch } from '@store/index';
import type { User, Website as UserWebsite } from '@store/models/users';
import { WebsiteStatus } from '@store/models/websites';
import { selectUser } from '@store/selectors';

// Using User interface imported from store/models/users

interface UsersTableProps {
  users: User[];
}

const UsersTable: React.FC<UsersTableProps> = ({ users }) => {
  const dispatch = useDispatch<Dispatch>();
  const currentUser = useSelector(selectUser);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const websitesDropdownRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const websiteCountRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

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

  // Handle clicking outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hoveredUser) {
        const dropdownRef = websitesDropdownRef.current[hoveredUser];
        if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
          setHoveredUser(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [hoveredUser]);

  // Get status color based on website status
  const getStatusColor = (status: number | string) => {
    const statusNum = typeof status === 'string' ? parseInt(status) : status;
    return statusNum === WebsiteStatus.ACTIVE ? 'active' : 'inactive';
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
            <th>Websites</th>
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
                  {user.role}{user.id.toString() === currentUser?.userId ? '(Current User)' : ''}
                </span>
              </td>
              <td style={{ position: 'static' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <div
                    className="websites-count cursor-pointer bg-white hover:bg-blue-50 transition-colors duration-200 rounded-md px-3 py-1 inline-flex items-center gap-1 border border-gray-200 hover:border-blue-300 shadow-sm"
                    ref={(el: HTMLDivElement | null) => {
                      websiteCountRefs.current[user.id] = el;
                    }}
                    onMouseEnter={() => {
                      setHoveredUser(user.id);
                      // Calculate position for dropdown
                      if (websiteCountRefs.current[user.id]) {
                        const rect = websiteCountRefs.current[user.id]?.getBoundingClientRect();
                        if (rect) {
                          setDropdownPosition({
                            top: rect.bottom + window.scrollY,
                            left: rect.left + window.scrollX
                          });
                        }
                      }
                    }}
                    onMouseLeave={(e) => {
                      // Check if we're not moving to the dropdown
                      const relatedTarget = e.relatedTarget as Node;
                      if (websitesDropdownRef.current[user.id] && !websitesDropdownRef.current[user.id]?.contains(relatedTarget)) {
                        setHoveredUser(null);
                      }
                    }}
                  >
                    <span className="font-medium">{user.websites?.length || 0}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M6 9l6 6 6-6" /></svg>
                  </div>

                  {hoveredUser === user.id && user.websites && user.websites.length > 0 && (
                    <div
                      className="websites-dropdown shadow-lg rounded-md p-3 mt-1 w-72 border border-gray-200"
                      style={{
                        position: 'fixed',
                        left: `${dropdownPosition.left}px`,
                        top: `${dropdownPosition.top}px`,
                        zIndex: 1000,
                        backgroundColor: 'white',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        overflow: 'visible'
                      }}
                      ref={(el: HTMLDivElement | null) => {
                        websitesDropdownRef.current[user.id] = el;
                      }}
                      onMouseEnter={() => setHoveredUser(user.id)}
                      onMouseLeave={() => setHoveredUser(null)}
                    >
                      <div className="max-h-48 overflow-y-auto">
                        {user.websites.map((website: UserWebsite) => (
                          <div key={website.id} className="website-item flex items-center py-2 px-1 border-b border-gray-100 hover:bg-gray-50 rounded transition-colors duration-150">
                            <div className={`menu-item warehouse-item ${getStatusColor(website.status)}`}>
                              <div className="website-details flex-1 overflow-hidden">
                                {/* <div className="website-name text-sm font-medium">{website.name}</div> */}
                                <a href={website.url} target="_blank" rel="noopener noreferrer" className="website-url text-xs text-gray-500 truncate">{website.url}</a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
    </div >
  );
};

export default UsersTable;
