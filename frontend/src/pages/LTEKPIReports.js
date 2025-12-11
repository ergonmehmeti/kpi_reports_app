import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DateFilters from '../components/filters/DateFilters';
import ChartCard from '../components/charts/ChartCard';
import KPILineChart from '../components/charts/KPILineChart';
import { useWeekSelector } from '../hooks/useWeekSelector';
import { API_ENDPOINTS } from '../utils/constants';
import './GSMReports.css';

const LTEKPIReports = () => {
  // Week selector hook
  const { availableWeeks, selectedWeek, handleWeekChange, resetToLastFullWeek } = useWeekSelector();
  
  // Local state
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showWeekSelector, setShowWeekSelector] = useState(true);
  const [kpiData, setKpiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState(null);

  // Initialize dates from selected week
  useEffect(() => {
    if (selectedWeek) {
      setStartDate(selectedWeek.monday.toISOString().split('T')[0]);
      setEndDate(selectedWeek.sunday.toISOString().split('T')[0]);
    }
  }, [selectedWeek]);

  // Fetch data when dates change
  useEffect(() => {
    if (startDate && endDate) {
      fetchKPIData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  // Fetch KPI data from API
  const fetchKPIData = async () => {
    setLoading(true);
    setDataError(null);
    
    try {
      const params = { startDate, endDate };
      const response = await axios.get(API_ENDPOINTS.lteKpi.data, { params });
      
      setKpiData(response.data.data || []);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setDataError(errorMsg);
      console.error('Error fetching KPI data:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

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
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const response = await axios.post(API_ENDPOINTS.lteKpi.upload, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...headers,
        },
      });

      setUploadResult(response.data);
      setFile(null);
      // Reset file input
      document.getElementById('file-input').value = '';
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError('Failed to upload file: ' + errorMsg);
    } finally {
      setUploading(false);
    }
  };

  // Prepare chart data for Availability KPIs
  const prepareAvailabilityData = () => {
    return kpiData.map(record => ({
      name: new Date(record.datetime).toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit' 
      }),
      'Cell Availability (%)': parseFloat(record.cell_availability_pct || 0).toFixed(2),
      'Cell UnAvailability - Fault (%)': parseFloat(record.cell_unavailability_fault_pct || 0).toFixed(2),
      'Cell UnAvailability - Operation (%)': parseFloat(record.cell_unavailability_operation_pct || 0).toFixed(2)
    }));
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">LTE KPI Reports</h1>
        <p className="page-description">
          Import and analyze LTE network KPI metrics (33 performance indicators)
        </p>
      </div>

      {/* Date Filters */}
      <DateFilters
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        showWeekSelector={showWeekSelector}
        onToggleWeekSelector={() => setShowWeekSelector(!showWeekSelector)}
        selectedWeek={selectedWeek}
        availableWeeks={availableWeeks}
        onWeekChange={handleWeekChange}
        onResetToLastWeek={resetToLastFullWeek}
      />

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <p>Loading KPI data...</p>
        </div>
      )}

      {/* Error State */}
      {dataError && (
        <div className="error-container">
          <p>❌ Error loading data: {dataError}</p>
        </div>
      )}

      {/* Availability KPIs Chart */}
      {!loading && !dataError && kpiData.length > 0 && (
        <div className="charts-section" style={{ marginBottom: '2rem' }}>
          <ChartCard title="Cell Availability KPIs" subtitle="Hourly cell availability and unavailability metrics">
            <KPILineChart
              data={prepareAvailabilityData()}
              dataKeys={[
                'Cell Availability (%)',
                'Cell UnAvailability - Fault (%)',
                'Cell UnAvailability - Operation (%)'
              ]}
              yAxisLabel="%"
            />
          </ChartCard>
        </div>
      )}

      {/* No Data State */}
      {!loading && !dataError && kpiData.length === 0 && (
        <div className="charts-section" style={{ marginBottom: '2rem' }}>
          <div className="empty-state">
            <p>📊 No KPI data available for the selected date range</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: '#6b7280' }}>
              Upload data using the import section below
            </p>
          </div>
        </div>
      )}

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

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <p>Loading KPI data...</p>
        </div>
      )}

      {/* Error State */}
      {dataError && (
        <div className="error-container">
          <p>❌ Error loading data: {dataError}</p>
        </div>
      )}

      {/* Availability KPIs Chart */}
      {!loading && !dataError && kpiData.length > 0 && (
        <div className="charts-section" style={{ marginTop: '2rem' }}>
          <ChartCard title="Cell Availability KPIs" subtitle="Hourly cell availability and unavailability metrics">
            <KPILineChart
              data={prepareAvailabilityData()}
              dataKeys={[
                'Cell Availability (%)',
                'Cell UnAvailability - Fault (%)',
                'Cell UnAvailability - Operation (%)'
              ]}
              yAxisLabel="%"
            />
          </ChartCard>
        </div>
      )}

      {/* No Data State */}
      {!loading && !dataError && kpiData.length === 0 && (
        <div className="charts-section" style={{ marginTop: '2rem' }}>
          <div className="empty-state">
            <p>📊 No KPI data available for the selected date range</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: '#6b7280' }}>
              Upload data using the import section above
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LTEKPIReports;
