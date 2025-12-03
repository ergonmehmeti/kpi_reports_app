import React from 'react';
import './TopNav.css';

const TopNav = ({ activeTab, onTabChange, onMenuClick }) => {
  return (
    <header className="top-nav">
      <div className="nav-left">
        <button className="hamburger-btn" onClick={onMenuClick}>
          <span></span>
          <span></span>
          <span></span>
        </button>
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
      </nav>

      <div className="nav-right">
        {/* Placeholder for future user menu */}
      </div>
    </header>
  );
};

export default TopNav;
