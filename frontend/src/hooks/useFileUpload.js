import { useState, useCallback } from 'react';
import { uploadCSV } from '../services/api';

/**
 * Custom hook for file upload functionality
 */
export const useFileUpload = () => {
  const [uploadStatus, setUploadStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async (type, file) => {
    if (!file) {
      setUploadStatus('Please select a file first');
      return { success: false, error: 'No file selected' };
    }

    setLoading(true);
    
    // Show different messages for large imports
    if (type === 'nr' || type === 'nrCell') {
      setUploadStatus('📤 Uploading NR data... This may take 10-30 seconds for large files.');
    } else if (type === 'endcLte') {
      setUploadStatus('📤 Uploading EN-DC LTE data... Processing...');
    } else {
      setUploadStatus('Uploading...');
    }

    try {
      const response = await uploadCSV(type, file);
      console.log('📊 Full response stats:', JSON.stringify(response.stats, null, 2));
      console.log('❌ Errors:', response.errors);
      
      // Handle NR Cell response format
      if (type === 'nrCell' && response.rawRecords) {
        setUploadStatus(
          `✅ Success! Processed ${response.rawRecords.toLocaleString()} raw records → ${response.hourlyKpis?.count || 0} hourly KPIs (${response.hourlyKpis?.inserted || 0} inserted, ${response.hourlyKpis?.updated || 0} updated) + ${response.weeklyTraffic?.count || 0} weekly traffic records`
        );
      }
      // Handle original NR response format
      else if (type === 'nr' && response.rawRecords) {
        setUploadStatus(
          `✅ Success! Processed ${response.rawRecords.toLocaleString()} raw records → Generated ${response.kpiRecords} KPI records (${response.inserted} inserted, ${response.updated} updated)`
        );
      }
      // Handle EN-DC LTE response format
      else if (type === 'endcLte' && response.rawRecords) {
        setUploadStatus(
          `✅ Success! Processed ${response.rawRecords.toLocaleString()} raw records → ${response.trafficRecords} traffic records (${response.inserted} inserted, ${response.updated} updated)`
        );
      }
      else {
        setUploadStatus(
          `Success! ${response.stats?.inserted || 0} inserted, ${response.stats?.updated || 0} updated`
        );
      }
      // Return success for parent component to handle
      return { success: true, data: response };
    } catch (error) {
      const errorMsg = `Error: ${error.response?.data?.error || error.message}`;
      setUploadStatus(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const resetUpload = useCallback(() => {
    setUploadStatus('');
    setLoading(false);
  }, []);

  return {
    uploadStatus,
    loading,
    handleUpload,
    resetUpload,
  };
};
