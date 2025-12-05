import React, { memo } from 'react';
import './ChartCard.css';

const ChartCard = memo(({ title, badge, children, onClick }) => {
  return (
    <div 
      className={`chart-card ${onClick ? 'chart-card-clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="chart-header">
        <h3>{title}</h3>
        <div className="chart-header-right">
          {badge && <span className="chart-badge">{badge}</span>}
          {onClick && <span className="chart-expand-hint">🔍</span>}
        </div>
      </div>
      {children}
    </div>
  );
});

ChartCard.displayName = 'ChartCard';

export default ChartCard;
