import React, { memo, useState } from 'react';
import './ChartCard.css';

const ChartCard = memo(({ title, badge, description, children, onClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className={`chart-card ${onClick ? 'chart-card-clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="chart-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <h3>{title}</h3>
          {description && (
            <div 
              style={{ position: 'relative', display: 'inline-block' }}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  fontStyle: 'italic',
                  cursor: 'help',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.2s ease',
                  border: '2px solid white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
                }}
              >
                i
              </span>
              {showTooltip && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: '8px',
                    padding: '12px 16px',
                    backgroundColor: '#1e293b',
                    color: 'white',
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                    zIndex: 1000,
                    minWidth: '300px',
                    maxWidth: '400px',
                    pointerEvents: 'none',
                    textAlign: 'left',
                  }}
                >
                  {description}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '0',
                      height: '0',
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderBottom: '6px solid #1e293b',
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
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
