import React, { memo } from 'react';
import './ChartCard.css';

const ChartCard = memo(({ title, badge, children }) => {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>{title}</h3>
        {badge && <span className="chart-badge">{badge}</span>}
      </div>
      {children}
    </div>
  );
});

ChartCard.displayName = 'ChartCard';

export default ChartCard;
