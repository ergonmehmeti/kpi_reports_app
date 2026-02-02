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
    console.log('🔵 fileInputRef.current:', fileInputRef.current);
    
    if (!fileInputRef.current) {
      console.error('❌ File input ref is null!');
      return;
    }
    
    // Set type before triggering click
    fileInputRef.current.setAttribute('data-type', type);
    // Trigger file picker
    fileInputRef.current.click();
  };

  const handleFileSelected = async (event) => {
    console.log('📁 File input changed, event:', event);
    const file = event.target.files[0];
    console.log('📁 File object:', file);
    
    if (!file) {
      console.warn('⚠️ No file selected');
      return;
    }

    const type = event.target.getAttribute('data-type') || 'gsm';
    console.log('🟢 File selected:', file.name, 'type:', type);
    
    try {
      const result = await handleUpload(type, file);
      console.log('🟡 Upload result:', result);
      if (result.success) {
        // Reset file input
        event.target.value = '';
        // Close sidebar after successful upload
        setTimeout(() => onClose(), 2000);
      }
    } catch (error) {
      console.error('❌ Error in handleFileSelected:', error);
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
                  className="sub-item active"
                  onClick={() => handleImportClick('nr')}
                  disabled={loading}
                >
                  <span className="sub-icon">📁</span>
                  <span className="sub-text">Import NR Cell CU</span>
                </button>
                
                <button 
                  className="sub-item"
                  onClick={() => handleImportClick('nrCell')}
                  disabled={loading}
                >
                  <span className="sub-icon">📊</span>
                  <span className="sub-text">Import NR Cell DU</span>
                </button>
                
                <button 
                  className="sub-item active"
                  onClick={() => handleImportClick('endcLte')}
                  disabled={loading}
                >
                  <span className="sub-icon">🔗</span>
                  <span className="sub-text">Import LTE EN-DC</span>
                </button>
              </div>
            </div>
          </div>

          <StatusMessage message={uploadStatus} type={getStatusType()} />
          
          {/* Loading overlay for import in progress */}
          {loading && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              pointerEvents: 'all'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
              }}>
                <div className="spinner" style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 1rem'
                }}></div>
                <p style={{ margin: 0, color: '#374151', fontWeight: 500 }}>
                  Import in progress...
                </p>
                <p style={{ margin: '0.5rem 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
                  Please wait, do not close this window
                </p>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default SideNav;
