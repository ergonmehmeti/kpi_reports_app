import React, { memo, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
  week2Label,
  yAxisDomain: customYAxisDomain,
  yAxisTicks
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

  // Calculate dynamic Y-axis domain based on data (same as KPILineChart)
  const calculateYDomain = () => {
    if (!data || data.length === 0) return [0, 100];
    
    // If custom domain is provided with numeric values, use it directly
    if (customYAxisDomain && 
        Array.isArray(customYAxisDomain) && 
        typeof customYAxisDomain[0] === 'number' && 
        typeof customYAxisDomain[1] === 'number') {
      return customYAxisDomain;
    }
    
    // For bar charts without custom domain, let Recharts auto-calculate
    // This ensures consistent scaling between small chart and modal
    if ((chartType === 'bar' || chartType === 'percentageStackedBar') && !customYAxisDomain) {
      return undefined;
    }
    
    let min = Infinity;
    let max = -Infinity;
    dataKeys.forEach(key => {
      data.forEach(item => {
        const value = parseFloat(item[key]);
        if (!isNaN(value)) {
          min = Math.min(min, value);
          max = Math.max(max, value);
        }
      });
    });
    
    // If no valid values found, return default domain
    if (min === Infinity || max === -Infinity) return [0, 100];
    
    // Handle custom domain with 'auto', 'autoRound30000', or 'autoFloorMinus1'
    if (customYAxisDomain) {
      const calculatedMin = Math.floor(min);
      const calculatedMax = Math.ceil(max);
      const floorMinus1 = Math.floor(min) - 1;
      return [
        customYAxisDomain[0] === 'auto' ? calculatedMin : 
        customYAxisDomain[0] === 'autoFloorMinus1' ? floorMinus1 : customYAxisDomain[0],
        customYAxisDomain[1] === 'auto' ? calculatedMax : customYAxisDomain[1]
      ];
    }
    
    // For line charts, floor the minimum value and ceil the maximum value
    const flooredMin = Math.floor(min);
    const ceiledMax = Math.ceil(max);
    return [flooredMin, ceiledMax];
  };

  // Calculate Y-axis ticks for 5 evenly spaced values rounded to 0.5
  const calculateYTicks = () => {
    // If custom ticks array is provided, use it directly (highest priority)
    if (Array.isArray(yAxisTicks) && yAxisTicks.length > 0) {
      return yAxisTicks;
    }
    
    if (yAxisTicks === 'auto5') {
      const domain = calculateYDomain();
      const [minVal, maxVal] = domain;
      const range = maxVal - minVal;
      const step = range / 4; // 5 ticks = 4 intervals
      const ticks = [];
      for (let i = 0; i <= 4; i++) {
        const rawValue = minVal + (step * i);
        // Round to nearest 0.5
        const roundedValue = Math.round(rawValue * 2) / 2;
        ticks.push(roundedValue);
      }
      // Ensure max is exactly 100 if that's the upper bound
      if (maxVal === 100) ticks[4] = 100;
      return ticks;
    }
    
    // For bar charts without custom ticks or domain, let Recharts auto-calculate
    if ((chartType === 'bar' || chartType === 'percentageStackedBar') && !yAxisTicks && !customYAxisDomain) {
      return undefined;
    }
    
    return yAxisTicks;
  };

  // For comparison charts and bar charts with week labels, use week labels
  const isComparison = chartType === 'comparison' || chartType === 'bar';
  const legendLabels = isComparison && week1Label && week2Label
    ? { [week1Label]: week1Label, [week2Label]: week2Label }
    : {};

  // Custom tooltip that shows actual values for percentage stacked bars
  const CustomTooltipPercentageStacked = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Calculate total
      const total = payload.reduce((sum, entry) => sum + (parseFloat(entry.value) || 0), 0);
      
      // Calculate percentages for display
      const dataWithPercentages = payload.map(entry => ({
        ...entry,
        percentage: total > 0 ? ((parseFloat(entry.value) / total) * 100).toFixed(1) : 0
      }));
      
      return (
        <div className="modal-chart-tooltip">
          <p className="tooltip-label">{label}</p>
          {dataWithPercentages.map((entry, index) => {
            const displayName = legendLabels[entry.dataKey] || entry.name;
            return (
              <p key={index} style={{ color: entry.color }}>
                {displayName}: {parseFloat(entry.value).toFixed(2)} {yAxisLabel || ''} ({entry.percentage}%)
              </p>
            );
          })}
          <p style={{ 
            margin: '5px 0 0 0', 
            paddingTop: '5px', 
            borderTop: '1px solid #e0e0e0', 
            fontWeight: 'bold' 
          }}>
            Total: {total.toFixed(2)} {yAxisLabel || ''}
          </p>
        </div>
      );
    }
    return null;
  };

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
    if (chartType === 'percentageStackedBar') {
      // 100% stacked bar chart with percentage Y-axis but actual values in tooltip
      return (
        <BarChart data={data} stackOffset="expand">
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="name" stroke="#666" tick={{ fontSize: 12 }} />
          <YAxis 
            stroke="#666" 
            width={80}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            domain={[0, 1]}
            ticks={[0, 0.25, 0.5, 0.75, 1]}
            label={{ 
              value: 'Percentage', 
              angle: -90, 
              position: 'insideLeft', 
              style: { textAnchor: 'middle' } 
            }}
          />
          <Tooltip content={<CustomTooltipPercentageStacked />} />
          <Legend />
          {dataKeys.map((key, index) => (
            <Bar 
              key={key}
              dataKey={key} 
              name={legendLabels[key] || key}
              stackId="stack"
              fill={chartColors[index % chartColors.length]} 
              radius={index === dataKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      );
    }

    if (chartType === 'bar') {
      return (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="name" stroke="#666" tick={{ fontSize: 12 }} />
          <YAxis 
            stroke="#666" 
            width={80}
            domain={calculateYDomain()}
            ticks={calculateYTicks()}
            tickFormatter={(value) => typeof value === 'number' ? (Number.isInteger(value) ? value.toString() : value.toFixed(1)) : value}
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

    if (chartType === 'stackedArea') {
      return (
        <AreaChart data={data}>
          <defs>
            {dataKeys.map((key, index) => (
              <linearGradient key={key} id={`gradient_modal_${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColors[index % chartColors.length]} stopOpacity={0.8} />
                <stop offset="95%" stopColor={chartColors[index % chartColors.length]} stopOpacity={0.3} />
              </linearGradient>
            ))}
          </defs>
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
            <Area 
              key={key}
              type="monotone"
              dataKey={key} 
              name={legendLabels[key] || key}
              stackId="1"
              stroke={chartColors[index % chartColors.length]}
              fill={`url(#gradient_modal_${key})`}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
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
          domain={calculateYDomain()}
          ticks={calculateYTicks()}
          tickFormatter={(value) => typeof value === 'number' ? (Number.isInteger(value) ? value.toString() : value.toFixed(1)) : value}
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
