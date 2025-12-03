import React from 'react';
import { FILE_UPLOAD } from '../../utils/constants';
import './FileUpload.css';

const FileUpload = ({ file, onFileChange, disabled = false }) => {
  return (
    <div className="import-section">
      <input 
        type="file" 
        id="file-input"
        accept={FILE_UPLOAD.acceptedFormats}
        onChange={onFileChange}
        disabled={disabled}
      />
      <label htmlFor="file-input" className="file-label">
        <span className="file-icon">📁</span>
        {file ? file.name : 'Choose a file...'}
      </label>
    </div>
  );
};

export default FileUpload;
