import React from 'react';
import Button from '@components/Button/Button';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  onLogout: () => void;
  userName?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, onLogout, userName }) => {
  return (
    <div className="page-header">
      <h1 className="page-title">{title}</h1>
      <div className="page-subtitle">
        <span>{subtitle}</span>
        <div className="ml-auto flex items-center gap-4">
          {userName && (
            <span className="text-sm font-medium text-gray-600">
              Welcome, {userName}
            </span>
          )}
          <Button 
            onClick={onLogout}
            variant="outline"
            className="bg-gray-200 hover:bg-gray-300"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
