import React, { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '../../utils/constants';

/**
 * Dual-axis line chart for metrics with different scales
 * Left axis: Primary metric (e.g., Availability 99-100%)
 * Right axis: Secondary metrics (e.g., Unavailability 0-1%)
 */
const DualAxisLineChart = memo(({ 
  data, 
  leftAxisKey,
  rightAxisKeys = [],
  leftAxisLabel,
  rightAxisLabel
}) => {
  const colors = [CHART_COLORS.primary, CHART_COLORS.danger, CHART_COLORS.warning];

  // Calculate dynamic domain for left axis (Availability)
  const calculateLeftDomain = () => {
    if (!data || data.length === 0) return [99, 100];
    
    const values = data.map(d => parseFloat(d[leftAxisKey] || 0)).filter(v => !isNaN(v));
    if (values.length === 0) return [99, 100];
    
    const min = Math.min(...values);
    
    // Round down to nearest integer, ensure max is 100
    const domainMin = Math.floor(min);
    const domainMax = 100;
    
    return [domainMin, domainMax];
  };

  // Calculate dynamic domain for right axis (Unavailability)
  const calculateRightDomain = () => {
    if (!data || data.length === 0 || rightAxisKeys.length === 0) return [0, 1];
    
    const values = [];
    rightAxisKeys.forEach(key => {
      data.forEach(d => {
        const val = parseFloat(d[key] || 0);
        if (!isNaN(val)) values.push(val);
      });
    });
    
    if (values.length === 0) return [0, 1];
    
    const max = Math.max(...values);
    
    // Round up to nearest integer, ensure min is 0
    const domainMin = 0;
    const domainMax = Math.ceil(max);
    
    return [domainMin, domainMax];
  };

  const leftDomain = calculateLeftDomain();
  const rightDomain = calculateRightDomain();

  // Generate ticks for left axis
  const generateLeftTicks = () => {
    const [min, max] = leftDomain;
    const range = max - min;
    if (range <= 5) {
      // For small ranges (e.g., 99-100), use 0.2 increments
      return [min, min + 0.2, min + 0.4, min + 0.6, min + 0.8, max];
    } else {
      // For larger ranges, use 1 unit increments
      const ticks = [];
      for (let i = min; i <= max; i++) {
        ticks.push(i);
      }
      return ticks;
    }
  };

  // Generate ticks for right axis
  const generateRightTicks = () => {
    const [min, max] = rightDomain;
    const range = max - min;
    if (range <= 2) {
      // For small ranges (e.g., 0-1), use 0.2 increments
      return [0, 0.2, 0.4, 0.6, 0.8, max];
    } else {
      // For larger ranges, use 1 unit increments
      const ticks = [];
      for (let i = min; i <= max; i++) {
        ticks.push(i);
      }
      return ticks;
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '0.875rem' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '2px 0', color: entry.color, fontSize: '0.875rem' }}>
              {entry.name}: {parseFloat(entry.value).toFixed(2)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 5, right: 40, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="name" 
          stroke="#666"
          tick={{ fontSize: 11 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        
        {/* Left Y-axis for Availability */}
        <YAxis 
          yAxisId="left"
          stroke="#666"
          domain={leftDomain}
          ticks={generateLeftTicks()}
          label={{ 
            value: leftAxisLabel || 'Availability (%)', 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle', fill: '#666', fontSize: 12 }
          }}
          tick={{ fontSize: 11 }}
        />
        
        {/* Right Y-axis for Unavailability */}
        <YAxis 
          yAxisId="right"
          orientation="right"
          stroke="#666"
          domain={rightDomain}
          ticks={generateRightTicks()}
          label={{ 
            value: rightAxisLabel || 'Unavailability (%)', 
            angle: -90, 
            position: 'insideRight',
            style: { textAnchor: 'middle', fill: '#666', fontSize: 12 }
          }}
          tick={{ fontSize: 11 }}
        />
        
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ fontSize: '0.875rem', paddingTop: '10px' }}
          iconType="line"
        />
        
        {/* Left axis line - Availability */}
        <Line 
          yAxisId="left"
          type="monotone" 
          dataKey={leftAxisKey}
          stroke={colors[0]}
          strokeWidth={2.5}
          dot={{ fill: colors[0], r: 3 }}
          activeDot={{ r: 5 }}
        />
        
        {/* Right axis lines - Unavailability metrics */}
        {rightAxisKeys.map((key, index) => (
          <Line 
            key={key}
            yAxisId="right"
            type="monotone" 
            dataKey={key}
            stroke={colors[index + 1]}
            strokeWidth={2}
            dot={{ fill: colors[index + 1], r: 2.5 }}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
});

DualAxisLineChart.displayName = 'DualAxisLineChart';

export default DualAxisLineChart;
