import React from 'react';
import Button from '@components/Button/Button';
import { useSelector } from 'react-redux';
import type { RootState } from '@store/index';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  onLogout: () => void;
  userName?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, onLogout, userName }) => {
  // Get the current user from the auth state if userName is not provided
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const displayName = userName || (currentUser ? currentUser.name : '');
  
  // Function to get the appropriate emoji icon based on the page title
  const getIconForTitle = (pageTitle: string) => {
    // Return the same emoji icons used in the sidebar menu
    switch (pageTitle.toLowerCase()) {
      case 'dashboard':
        return '📊';
      case 'products':
        return '📦';
      case 'fields':
        return '🔧';
      case 'websites':
        return '🌐';
      case 'users':
        return '👥';
      default:
        return '📄'; // Default icon for any other page
    }
  };
  // Use the existing page-header class from Dashboard.css but override specific styles
  return (
    <div className="page-header" style={{
      backgroundColor: '#3b82f6',
      padding: '0.75rem 1.5rem',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: 'white',
      margin: 0,
      borderBottom: 'none'
    }}>
      {/* Left side: Title and subtitle */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <div style={{ 
            width: '2rem', 
            height: '2rem', 
            backgroundColor: 'white', 
            borderRadius: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {getIconForTitle(title)}
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{title}</h1>
        </div>
        <p style={{ fontSize: '0.875rem', opacity: 0.9, marginLeft: '2.75rem' }}>{subtitle}</p>
      </div>
      
      {/* Right side: User info and logout button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {displayName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2rem',
              height: '2rem',
              borderRadius: '9999px',
              backgroundColor: 'white',
              color: '#3b82f6'
            }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span style={{ fontSize: '0.875rem', color: 'white' }}>{displayName}</span>
          </div>
        )}
        <Button 
          onClick={onLogout}
          variant="outline"
          className="logout-btn"
          style={{
            backgroundColor: 'transparent',
            border: '1px solid white',
            color: 'white',
            fontSize: '0.875rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '0.25rem'
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default PageHeader;
