import React, { useRef, useState, useEffect } from 'react';
import StatusMessage from '../common/StatusMessage';
import { useFileUpload } from '../../hooks/useFileUpload';
import './SideNav.css';

const SideNav = ({ isOpen, onClose }) => {
  const { uploadStatus, loading, handleUpload, resetUpload } = useFileUpload();
  const fileInputRef = useRef(null);
  
  // Collapsible section states
  const [expandedSections, setExpandedSections] = useState({
    gsm: false,
    lte: false,
    nr: false
  });

  // Reset state when sidebar closes
  useEffect(() => {
    if (!isOpen) {
      // Small delay to allow close animation to complete
      const timer = setTimeout(() => {
        setExpandedSections({
          gsm: false,
          lte: false,
          nr: false
        });
        resetUpload();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, resetUpload]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleImportClick = async (type) => {
    console.log('🔵 Import clicked, type:', type);
    // Trigger file picker
    fileInputRef.current.click();
    fileInputRef.current.setAttribute('data-type', type);
  };

  const handleFileSelected = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const type = event.target.getAttribute('data-type') || 'gsm';
    console.log('🟢 File selected:', file.name, 'type:', type);
    
    const result = await handleUpload(type, file);
    console.log('🟡 Upload result:', result);
    if (result.success) {
      // Reset file input
      event.target.value = '';
      // Close sidebar after successful upload
      setTimeout(() => onClose(), 2000);
    }
  };

  const getStatusType = () => {
    if (!uploadStatus) return 'info';
    if (uploadStatus.includes('Error')) return 'error';
    if (uploadStatus.includes('Success')) return 'success';
    return 'info';
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`side-nav-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
      />

      {/* Side Navigation */}
      <nav className={`side-nav ${isOpen ? 'open' : ''}`}>
        <div className="side-nav-header">
          <h3>Import Data</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="side-nav-content">
          {/* Hidden file input */}
          <input 
            type="file" 
            ref={fileInputRef}
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelected}
            style={{ display: 'none' }}
          />

          <div className="import-sections">
            {/* GSM Section */}
            <div className="import-section">
              <button 
                className="section-header gsm"
                onClick={() => toggleSection('gsm')}
              >
                <span className="section-icon">📊</span>
                <span className="section-title">GSM</span>
                <span className={`section-arrow ${expandedSections.gsm ? 'expanded' : ''}`}>▼</span>
              </button>
              
              <div className={`section-items ${expandedSections.gsm ? 'expanded' : ''}`}>
                <button 
                  className="sub-item active"
                  onClick={() => handleImportClick('gsm')}
                  disabled={loading}
                >
                  <span className="sub-icon">📁</span>
                  <span className="sub-text">Import GSM KPI CSV</span>
                </button>
              </div>
            </div>

            {/* LTE Section */}
            <div className="import-section">
              <button 
                className="section-header lte"
                onClick={() => toggleSection('lte')}
              >
                <span className="section-icon">📈</span>
                <span className="section-title">LTE</span>
                <span className={`section-arrow ${expandedSections.lte ? 'expanded' : ''}`}>▼</span>
              </button>
              
              <div className={`section-items ${expandedSections.lte ? 'expanded' : ''}`}>
                <button 
                  className="sub-item active"
                  onClick={() => handleImportClick('lteKpi')}
                  disabled={loading}
                >
                  <span className="sub-icon">📁</span>
                  <span className="sub-text">Import LTE KPI CSV</span>
                </button>
                <button 
                  className="sub-item active"
                  onClick={() => handleImportClick('lte')}
                  disabled={loading}
                >
                  <span className="sub-icon">📁</span>
                  <span className="sub-text">Import LTE Site Data CSV</span>
                </button>
                <button 
                  className="sub-item active"
                  onClick={() => handleImportClick('lteFrequency')}
                  disabled={loading}
                >
                  <span className="sub-icon">📁</span>
                  <span className="sub-text">Import LTE Frequency Data CSV</span>
                </button>
              </div>
            </div>

            {/* NR Section */}
            <div className="import-section">
              <button 
                className="section-header nr"
                onClick={() => toggleSection('nr')}
              >
                <span className="section-icon">📉</span>
                <span className="section-title">NR (5G)</span>
                <span className={`section-arrow ${expandedSections.nr ? 'expanded' : ''}`}>▼</span>
              </button>
              
              <div className={`section-items ${expandedSections.nr ? 'expanded' : ''}`}>
                <button 
                  className="sub-item disabled"
                  disabled={true}
                  title="Coming soon"
                >
                  <span className="sub-icon">📁</span>
                  <span className="sub-text">Import NR KPI CSV</span>
                  <span className="coming-soon-badge">Coming Soon</span>
                </button>
              </div>
            </div>
          </div>

          <StatusMessage message={uploadStatus} type={getStatusType()} />
        </div>
      </nav>
    </>
  );
};

export default SideNav;
