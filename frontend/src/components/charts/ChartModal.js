import React, { memo, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './ChartModal.css';

/**
 * ChartModal Component
 * Full-screen modal for viewing charts in detail
 * Supports line, bar, and comparison charts
 */
const ChartModal = memo(({ 
  isOpen, 
  onClose, 
  title, 
  badge,
  data, 
  dataKeys, 
  yAxisLabel, 
  chartType = 'line',
  colors,
  week1Label,
  week2Label
}) => {
  // Handle ESC key to close
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  // Default colors - blue for week1/single, green for week2
  const chartColors = colors || ['#3b82f6', '#22c55e', '#8b5cf6'];

  // For comparison charts, use week labels
  const isComparison = chartType === 'comparison';
  const legendLabels = isComparison 
    ? { week1Value: week1Label || 'Week 1', week2Value: week2Label || 'Week 2' }
    : {};

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="modal-chart-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => {
            const displayName = legendLabels[entry.dataKey] || entry.name;
            return (
              <p key={index} style={{ color: entry.color }}>
                {displayName}: {entry.value} {yAxisLabel || ''}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (chartType === 'bar') {
      return (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="name" stroke="#666" tick={{ fontSize: 12 }} />
          <YAxis 
            stroke="#666" 
            width={80}
            label={yAxisLabel ? { 
              value: yAxisLabel, 
              angle: -90, 
              position: 'insideLeft', 
              style: { textAnchor: 'middle' } 
            } : undefined}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {dataKeys.map((key, index) => (
            <Bar 
              key={key}
              dataKey={key} 
              name={legendLabels[key] || key}
              fill={chartColors[index % chartColors.length]} 
              radius={[4, 4, 0, 0]} 
            />
          ))}
        </BarChart>
      );
    }

    // Line chart (including comparison)
    return (
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="name" stroke="#666" tick={{ fontSize: 12 }} />
        <YAxis 
          stroke="#666" 
          width={80}
          label={yAxisLabel ? { 
            value: yAxisLabel, 
            angle: -90, 
            position: 'insideLeft', 
            style: { textAnchor: 'middle' } 
          } : undefined}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {dataKeys.map((key, index) => (
          <Line 
            key={key}
            type="monotone" 
            dataKey={key} 
            name={legendLabels[key] || key}
            stroke={chartColors[index % chartColors.length]} 
            strokeWidth={2} 
            dot={{ fill: chartColors[index % chartColors.length], r: 3 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    );
  };

  const modalContent = (
    <div className="chart-modal-overlay" onClick={onClose}>
      <div className="chart-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="chart-modal-header">
          <div className="chart-modal-title">
            <h2>{title}</h2>
            {badge && <span className="chart-modal-badge">{badge}</span>}
          </div>
          <button className="chart-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        
        <div className="chart-modal-body">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
        
        <div className="chart-modal-footer">
          <span className="chart-modal-hint">Press ESC or click outside to close</span>
        </div>
      </div>
    </div>
  );

  // Use React Portal to render at document root
  return ReactDOM.createPortal(modalContent, document.body);
});

ChartModal.displayName = 'ChartModal';

export default ChartModal;
