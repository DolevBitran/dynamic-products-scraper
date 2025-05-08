import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '@components/Button/Button';
import WebsiteModal from './WebsiteModal';
import type { Dispatch } from '@store/index';
import type { Website } from '@store/models/websites';
import type { User, Website as UserWebsite } from '@store/models/users';
import { selectUsers } from '@store/selectors/users';
import { WebsiteStatus } from '@store/models/websites';

interface WebsitesTableProps {
  websites: Website[];
}

const WebsitesTable: React.FC<WebsitesTableProps> = ({ websites }) => {
  const dispatch = useDispatch<Dispatch>();
  const users = useSelector(selectUsers);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (website: Website) => {
    setSelectedWebsite(website);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this website?')) {
      await dispatch.websites.deleteWebsite(id);
    }
  };

  const handleStatusToggle = async (website: Website) => {
    const newStatus = website.status === WebsiteStatus.ACTIVE
      ? WebsiteStatus.INACTIVE
      : WebsiteStatus.ACTIVE;

    await dispatch.websites.updateWebsiteStatus({
      id: website.id,
      status: newStatus
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWebsite(null);
  };

  const [searchTerms, setSearchTerms] = useState<{ [key: string]: string }>({});
  const [showUserDropdown, setShowUserDropdown] = useState<{ [key: string]: boolean }>({});
  const [isAddingUser, setIsAddingUser] = useState<{ [key: string]: boolean }>({});
  const dropdownRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Filter users based on search term
  const getFilteredUsers = (websiteId: string): User[] => {
    const searchTerm = searchTerms[websiteId] || '';
    if (!searchTerm) return [];

    // Filter users that don't already have this website
    return users.filter((user: User) =>
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!user.websites || !user.websites.map((w: UserWebsite) => w.id).includes(websiteId))
    );
  };

  // Handle adding website to user
  const handleAddWebsiteToUser = async (userId: string, websiteId: string) => {
    setIsAddingUser({ ...isAddingUser, [userId]: true });
    try {
      // Find the user
      const user = users.find((u: User) => u.id === userId);
      // Find the website
      const website = websites.find((w: Website) => w.id === websiteId);

      if (user && website) {
        // Convert website to the format expected by the User model
        // The key difference is that websites.ts has status as number, but users.ts expects it as string
        const websiteForUser: UserWebsite = {
          id: website.id,
          name: website.name,
          url: website.url,
          status: String(website.status), // Convert number to string
          createdAt: website.createdAt,
          updatedAt: website.updatedAt
        };

        // Create updated user data with the new website added
        const updatedUser = {
          ...user,
          websites: [...(user.websites || []), websiteForUser]
        };

        // Update the user
        console.log('Updating user with website:', updatedUser);
        await dispatch.users.updateUser(updatedUser);

        // Clear search and close dropdown
        setSearchTerms(prev => ({ ...prev, [websiteId]: '' }));
        setShowUserDropdown({ ...showUserDropdown, [websiteId]: false });
      }
    } catch (error) {
      console.error('Error adding website to user:', error);
    } finally {
      setIsAddingUser({ ...isAddingUser, [userId]: false });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(dropdownRef.current || {}).forEach(key => {
        if (dropdownRef.current[key] && !dropdownRef.current[key]?.contains(event.target as Node)) {
          setShowUserDropdown(prev => ({ ...prev, [key]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Find users who have this website in their websites array
  const getWebsiteHolders = (websiteId: string): User[] => {
    return users.filter((user: User) =>
      user.websites && user.websites.some((w: UserWebsite) => w.id === websiteId)
    );
  };

  return (
    <div className="table-section">
      {selectedWebsite && (
        <WebsiteModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          mode="edit"
          website={selectedWebsite}
        />
      )}

      <div className="table-header">
        <div className="table-title">
          <span className="menu-item-icon">🌐</span>
          <span>Websites</span>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>URL</th>
            <th>Status</th>
            <th>Holders</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {websites.map((website) => {
            const holders = getWebsiteHolders(website.id);
            return (
              <tr key={website.id}>
                <td className="website-cell">
                  <div className="website-info">
                    <div className="website-avatar">
                      {website.name.charAt(0)}
                    </div>
                    <div className="website-name">
                      {website.name}
                    </div>
                  </div>
                </td>
                <td>
                  <a
                    href={website.url.startsWith('http') ? website.url : `https://${website.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {website.url}
                  </a>
                </td>
                <td>
                  <span className={`status-cell status-${website.status === WebsiteStatus.ACTIVE ? 'active' : 'inactive'}`}>
                    {website.status === WebsiteStatus.ACTIVE ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="relative">
                    <div className="relative" ref={(el) => { dropdownRef.current[website.id] = el; return undefined; }}>
                      <div className="tag-input-container">
                        <div className="tag-input-wrapper">
                          {holders.length > 0 ? (
                            holders.map(user => (
                              <span
                                key={user.id}
                                className="user-badge"
                                title={user.email}
                              >
                                {user.name || user.email.split('@')[0]}
                                <span
                                  className="badge-remove"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Find the user and remove this website from their websites array
                                    const updatedUser = {
                                      ...user,
                                      websites: (user.websites || []).filter(w => w.id !== website.id)
                                    };
                                    dispatch.users.updateUser(updatedUser);
                                  }}
                                >
                                  ×
                                </span>
                              </span>
                            ))
                          ) : null}
                          <input
                            type="text"
                            placeholder={holders.length > 0 ? "" : "Search users..."}
                            value={searchTerms[website.id] || ''}
                            onChange={(e) => {
                              setSearchTerms(prev => ({ ...prev, [website.id]: e.target.value }));
                              // Show dropdown when user starts typing
                              if (e.target.value && !showUserDropdown[website.id]) {
                                setShowUserDropdown({ ...showUserDropdown, [website.id]: true });
                              }
                              // Hide dropdown when input is cleared and no results
                              if (!e.target.value && getFilteredUsers(website.id).length === 0) {
                                setShowUserDropdown({ ...showUserDropdown, [website.id]: false });
                              }
                            }}
                            onFocus={() => setShowUserDropdown({ ...showUserDropdown, [website.id]: true })}
                            className="tag-input"
                          />
                        </div>
                      </div>

                      {showUserDropdown[website.id] && (
                        <div className="user-dropdown">
                          <div className="dropdown-results">
                            {getFilteredUsers(website.id).length > 0 ? (
                              getFilteredUsers(website.id).map(user => (
                                <div
                                  key={user.id}
                                  className="dropdown-item"
                                  onClick={() => handleAddWebsiteToUser(user.id, website.id)}
                                >
                                  <div className="dropdown-avatar">
                                    {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="dropdown-user-info">
                                    <div className="dropdown-user-name">{user.name || user.email.split('@')[0]}</div>
                                    <div className="dropdown-user-email">{user.email}</div>
                                  </div>
                                  {isAddingUser[user.id] && (
                                    <div className="ml-2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                  )}
                                </div>
                              ))
                            ) : searchTerms[website.id] ? (
                              <div className="p-2 text-center text-gray-500">No matching users found</div>
                            ) : (
                              <div className="p-2 text-center text-gray-500">Type to search users</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td>{new Date(website.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStatusToggle(website)}
                      variant="default"
                      size="sm"
                      className={website.status === WebsiteStatus.ACTIVE
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'}
                    >
                      {website.status === WebsiteStatus.ACTIVE ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      onClick={() => handleEdit(website)}
                      variant="default"
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(website.id)}
                      variant="destructive"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default WebsitesTable;
