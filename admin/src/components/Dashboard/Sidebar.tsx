import React from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  activeSection: string;
  setActiveSection: Dispatch<SetStateAction<string>>;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">DS</div>
          <span>DynamicScraper</span>
        </div>
      </div>

      {/* <div className="sidebar-search">
        <div className="search-input">
          <span className="menu-item-icon">🔍</span>
          <input type="text" placeholder="Search" />
        </div>
      </div> */}

      <div className="sidebar-menu">
        <div className="menu-section">
          <div className="menu-title">
            <span>MAIN MENU</span>
          </div>
          <ul className="menu-items">
            <Link to="/" style={{ textDecoration: 'none' }}>
              <li
                className={`menu-item ${activeSection === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveSection('dashboard')}
              >
                <span className="menu-item-icon">📊</span>
                <span>Dashboard</span>
              </li>
            </Link>
            <Link to="/fields" style={{ textDecoration: 'none' }}>
              <li
                className={`menu-item ${activeSection === 'fields' ? 'active' : ''}`}
                onClick={() => setActiveSection('fields')}
              >
                <span className="menu-item-icon">🔧</span>
                <span>Fields</span>
              </li>
            </Link>
            <Link to="/products" style={{ textDecoration: 'none' }}>
              <li
                className={`menu-item ${activeSection === 'products' ? 'active' : ''}`}
                onClick={() => setActiveSection('products')}
              >
                <span className="menu-item-icon">📦</span>
                <span>Products</span>
              </li>
            </Link>
            <Link to="/users" style={{ textDecoration: 'none' }}>
              <li
                className={`menu-item ${activeSection === 'users' ? 'active' : ''}`}
                onClick={() => setActiveSection('users')}
              >
                <span className="menu-item-icon">👥</span>
                <span>Users</span>
              </li>
            </Link>
            <Link to="/websites" style={{ textDecoration: 'none' }}>
              <li
                className={`menu-item ${activeSection === 'websites' ? 'active' : ''}`}
                onClick={() => setActiveSection('websites')}
              >
                <span className="menu-item-icon">🌐</span>
                <span>Websites</span>
              </li>
            </Link>
          </ul>
        </div>

        {/* <div className="menu-section">
          <div className="menu-title">
            <span>WEBSITES</span>
          </div>
          <ul className="menu-items">
            <li className="menu-item warehouse-item new-york">
              <span>amazon.com</span>
            </li>
            <li className="menu-item warehouse-item los-angeles">
              <span>ebay.com</span>
            </li>
            <li className="menu-item warehouse-item california">
              <span>walmart.com</span>
            </li>
          </ul>
        </div> */}
      </div>
    </div>
  );
};

export default Sidebar;
