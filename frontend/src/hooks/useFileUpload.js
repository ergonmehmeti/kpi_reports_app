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
    setUploadStatus('Uploading...');

    try {
      const response = await uploadCSV(type, file);
      console.log('📊 Full response stats:', JSON.stringify(response.stats, null, 2));
      console.log('❌ Errors:', response.errors);
      setUploadStatus(
        `Success! ${response.stats?.inserted || 0} inserted, ${response.stats?.updated || 0} updated`
      );
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
