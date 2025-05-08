import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Sidebar from '@components/Dashboard/Sidebar';
import PageHeader from '@components/Dashboard/PageHeader';
import { selectUser } from '@store/selectors';
import type { Dispatch } from '@store/index';
import '@styles/Dashboard.css';

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<Dispatch>();
  const user = useSelector(selectUser);
  const [activeSection, setActiveSection] = useState(getActiveSectionFromPath(location.pathname));
  
  // Update activeSection when the URL changes
  useEffect(() => {
    setActiveSection(getActiveSectionFromPath(location.pathname));
  }, [location.pathname]);
  
  // Extract the active section from the URL path
  function getActiveSectionFromPath(path: string) {
    if (path === '/') return 'dashboard';
    return path.split('/')[1]; // Gets the first part of the path after the leading slash
  }
  
  const getActiveSection = () => activeSection;

  // Get the title and subtitle based on the current route
  const getPageInfo = () => {
    const section = getActiveSection();
    switch (section) {
      case 'dashboard':
        return {
          title: 'Dashboard',
          subtitle: 'Welcome to your product management dashboard'
        };
      case 'products':
        return {
          title: 'Products',
          subtitle: 'Manage your product catalog'
        };
      case 'fields':
        return {
          title: 'Fields',
          subtitle: 'Manage your scraping fields'
        };
      case 'websites':
        return {
          title: 'Websites',
          subtitle: 'Manage your website configurations'
        };
      case 'categories':
        return {
          title: 'Categories',
          subtitle: 'Manage your product categories'
        };
      default:
        return {
          title: section.charAt(0).toUpperCase() + section.slice(1),
          subtitle: 'Manage your ' + section
        };
    }
  };

  const handleLogout = () => {
    dispatch.auth.logout();
    navigate('/login');
  };

  const pageInfo = getPageInfo();

  return (
    <div className="dashboard-container">
      {/* Sidebar Component */}
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
      />
      
      {/* Main Content */}
      <div className="main-content">
        <PageHeader
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onLogout={handleLogout}
          userName={user?.name}
        />
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
