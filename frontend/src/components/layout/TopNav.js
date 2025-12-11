import React, { useState, useEffect } from 'react';
import LoginModal from '../auth/LoginModal';
import './TopNav.css';

const TopNav = ({ activeTab, onTabChange, onMenuClick }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Check for existing login on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Determine roles
  const isAdmin = user?.role === 'admin';
  const isAdminDeveloper = user?.role === 'adminDeveloper';
  const canImportData = isAdmin || isAdminDeveloper; // Can see hamburger menu
  const canManageUsers = isAdminDeveloper; // Only adminDeveloper

  return (
    <header className="top-nav">
      <div className="nav-left">
        {canImportData && (
          <button className="hamburger-btn" onClick={onMenuClick}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        )}
        <div className="logo">
          <h1>KPI Reports</h1>
          <span className="subtitle">Kosovo Telecom</span>
        </div>
      </div>

      <nav className="nav-tabs">
        <button 
          className={`nav-tab ${activeTab === 'gsm' ? 'active' : ''}`}
          onClick={() => onTabChange('gsm')}
        >
          <span className="tab-icon">📡</span>
          GSM Reports
        </button>
        <button 
          className={`nav-tab ${activeTab === 'lte' ? 'active' : ''}`}
          onClick={() => onTabChange('lte')}
        >
          <span className="tab-icon">📶</span>
          LTE Reports
        </button>
        <button 
          className={`nav-tab ${activeTab === 'nr' ? 'active' : ''}`}
          onClick={() => onTabChange('nr')}
        >
          <span className="tab-icon">🔮</span>
          NR Reports
        </button>
        {canManageUsers && (
          <button 
            className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => onTabChange('users')}
          >
            <span className="tab-icon">👥</span>
            Menaxhimi i shfrytëzuesëve
          </button>
        )}
      </nav>

      <div className="nav-right">
        {user ? (
          <div className="user-menu">
            <span className="user-name">{user.username}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <button className="login-btn" onClick={() => setIsLoginModalOpen(true)}>
            Login
          </button>
        )}
      </div>

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </header>
  );
};

export default TopNav;
