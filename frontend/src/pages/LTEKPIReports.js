import React, { useState } from 'react';

const LTEKPIReports = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/lte-kpi/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadResult(data);
        setFile(null);
        // Reset file input
        document.getElementById('file-input').value = '';
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Failed to upload file: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: '700', 
          color: '#1f2937',
          marginBottom: '0.5rem'
        }}>
          LTE KPI Reports
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1rem' }}>
          Import and analyze LTE network KPI metrics (33 performance indicators)
        </p>
      </div>

      {/* Import Section */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          color: '#374151',
          marginBottom: '1rem'
        }}>
          Import LTE KPI Data
        </h2>
        
        <p style={{ 
          color: '#6b7280', 
          fontSize: '0.875rem',
          marginBottom: '1.5rem'
        }}>
          Upload CSV/XLSX file with hourly LTE KPI metrics. Required columns: Datetime, Cell Availability, Throughput metrics, etc.
        </p>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <input
            id="file-input"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem',
              flex: 1
            }}
          />
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            style={{
              padding: '0.625rem 1.5rem',
              backgroundColor: uploading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: uploading || !file ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!uploading && file) {
                e.target.style.backgroundColor = '#2563eb';
              }
            }}
            onMouseLeave={(e) => {
              if (!uploading && file) {
                e.target.style.backgroundColor = '#3b82f6';
              }
            }}
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>

        {/* Success Message */}
        {uploadResult && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#d1fae5',
            border: '1px solid #6ee7b7',
            borderRadius: '6px',
            marginTop: '1rem'
          }}>
            <p style={{ color: '#065f46', fontWeight: '500', marginBottom: '0.5rem' }}>
              ✅ {uploadResult.message}
            </p>
            <p style={{ color: '#047857', fontSize: '0.875rem' }}>
              Rows processed: {uploadResult.rowsProcessed} | 
              Rows inserted: {uploadResult.rowsInserted} | 
              Rows skipped: {uploadResult.rowsSkipped}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '6px',
            marginTop: '1rem'
          }}>
            <p style={{ color: '#991b1b', fontWeight: '500' }}>
              ❌ {error}
            </p>
          </div>
        )}
      </div>

      {/* KPI Visualization Section - Placeholder */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '2rem'
      }}>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          color: '#374151',
          marginBottom: '1rem'
        }}>
          KPI Visualizations
        </h2>
        
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#9ca3af',
          fontSize: '1rem'
        }}>
          <p>📊 KPI charts and visualizations will be displayed here</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Upload data to view performance metrics
          </p>
        </div>
      </div>
    </div>
  );
};

export default LTEKPIReports;
