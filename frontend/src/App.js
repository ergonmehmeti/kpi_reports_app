import React, { useState } from 'react';
import TopNav from './components/layout/TopNav';
import SideNav from './components/layout/SideNav';
import Footer from './components/layout/Footer';
import GSMReports from './pages/GSMReports';
import LTEReports from './pages/LTEReports';
import NRReports from './pages/NRReports';
import './App.css';

function App() {
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('gsm');

  const renderPage = () => {
    switch (activeTab) {
      case 'gsm':
        return <GSMReports />;
      case 'lte':
        return <LTEReports />;
      case 'nr':
        return <NRReports />;
      default:
        return <GSMReports />;
    }
  };

  return (
    <div className="App">
      <SideNav 
        isOpen={sideNavOpen} 
        onClose={() => setSideNavOpen(false)} 
      />

      <TopNav 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onMenuClick={() => setSideNavOpen(true)}
      />

      <main className="main-content">
        {renderPage()}
      </main>

      <Footer />
    </div>
  );
}

export default App;

