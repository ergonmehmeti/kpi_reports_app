import React from 'react';
import './ChartCard.css';

const ChartCard = ({ title, badge, children }) => {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>{title}</h3>
        {badge && <span className="chart-badge">{badge}</span>}
      </div>
      {children}
    </div>
  );
};

export default ChartCard;
