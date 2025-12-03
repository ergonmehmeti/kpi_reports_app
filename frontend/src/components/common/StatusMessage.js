import React from 'react';
import './StatusMessage.css';

const StatusMessage = ({ message, type = 'info' }) => {
  if (!message) return null;

  return (
    <div className={`status-message ${type}`}>
      {message}
    </div>
  );
};

export default StatusMessage;
