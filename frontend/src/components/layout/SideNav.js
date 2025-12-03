import React, { useRef } from 'react';
import StatusMessage from '../common/StatusMessage';
import { useFileUpload } from '../../hooks/useFileUpload';
import './SideNav.css';

const SideNav = ({ isOpen, onClose }) => {
  const { uploadStatus, loading, handleUpload } = useFileUpload();
  const fileInputRef = useRef(null);

  const handleImportClick = async (type) => {
    // Trigger file picker
    fileInputRef.current.click();
    fileInputRef.current.setAttribute('data-type', type);
  };

  const handleFileSelected = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const type = event.target.getAttribute('data-type') || 'gsm';
    
    const result = await handleUpload(type, file);
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

          <div className="import-buttons">
            <button 
              className="import-btn gsm"
              onClick={() => handleImportClick('gsm')}
              disabled={loading}
            >
              <span className="btn-icon">📊</span>
              <span className="btn-text">Import GSM CSV</span>
            </button>
            
            <button 
              className="import-btn lte"
              disabled={true}
              title="Coming soon - KPIs being defined by team"
            >
              <span className="btn-icon">📈</span>
              <span className="btn-text">Import LTE CSV (Coming Soon)</span>
            </button>
            
            <button 
              className="import-btn nr"
              disabled={true}
              title="Coming soon - KPIs being defined by team"
            >
              <span className="btn-icon">📉</span>
              <span className="btn-text">Import NR CSV (Coming Soon)</span>
            </button>
          </div>

          <StatusMessage message={uploadStatus} type={getStatusType()} />
        </div>
      </nav>
    </>
  );
};

export default SideNav;
