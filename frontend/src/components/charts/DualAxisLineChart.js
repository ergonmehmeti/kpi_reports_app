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
  rightAxisLabel,
  colors: customColors,
  leftAxisDomain,
  rightAxisDomain,
  leftAxisUnit = '%',
  rightAxisUnit = '%'
}) => {
  const colors = customColors || [CHART_COLORS.primary, CHART_COLORS.danger, CHART_COLORS.warning];

  // Calculate dynamic domain for left axis (Availability)
  const calculateLeftDomain = () => {
    if (!data || data.length === 0) return [99, 100];
    
    const values = data.map(d => parseFloat(d[leftAxisKey] || 0)).filter(v => !isNaN(v));
    if (values.length === 0) return [99, 100];
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Handle custom domain with 'auto' or 'autoRound10' for min or max
    if (leftAxisDomain) {
      const calculatedMin = Math.floor(min);
      const calculatedMax = Math.ceil(max);
      const roundedMax10 = Math.ceil(max / 10) * 10; // Round up to nearest 10
      return [
        leftAxisDomain[0] === 'auto' ? calculatedMin : leftAxisDomain[0],
        leftAxisDomain[1] === 'auto' ? calculatedMax : 
        leftAxisDomain[1] === 'autoRound10' ? roundedMax10 : leftAxisDomain[1]
      ];
    }
    
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
    
    // Handle custom domain with 'auto' or 'autoRound0.2' for max
    if (rightAxisDomain) {
      const calculatedMax = Math.ceil(max);
      const roundedMax02 = Math.ceil(max / 0.2) * 0.2; // Round up to nearest 0.2
      return [
        rightAxisDomain[0] === 'auto' ? 0 : rightAxisDomain[0],
        rightAxisDomain[1] === 'auto' ? calculatedMax : 
        rightAxisDomain[1] === 'autoRound0.2' ? roundedMax02 : rightAxisDomain[1]
      ];
    }
    
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
      // For small ranges (e.g., 97-100), use 0.5 increments
      const ticks = [];
      for (let i = min; i <= max; i += 0.5) {
        ticks.push(i);
      }
      return ticks;
    } else if (range <= 10) {
      // For ranges up to 10, use 1 unit increments
      const ticks = [];
      for (let i = min; i <= max; i += 1) {
        ticks.push(i);
      }
      return ticks;
    } else {
      // For larger ranges, use 5 or 10 unit increments
      const ticks = [];
      const step = range <= 50 ? 5 : 10;
      for (let i = min; i <= max; i += step) {
        ticks.push(i);
      }
      if (ticks[ticks.length - 1] !== max) ticks.push(max);
      return ticks;
    }
  };

  // Generate ticks for right axis
  const generateRightTicks = () => {
    const [min, max] = rightDomain;
    const range = max - min;
    if (range <= 5) {
      // For small ranges (e.g., 0-2), use 0.5 increments
      const ticks = [];
      for (let i = min; i <= max; i += 0.5) {
        ticks.push(i);
      }
      return ticks;
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
          {payload.map((entry, index) => {
            const unit = entry.dataKey === leftAxisKey ? leftAxisUnit : rightAxisUnit;
            return (
              <p key={index} style={{ margin: '2px 0', color: entry.color, fontSize: '0.875rem' }}>
                {entry.name}: {parseFloat(entry.value).toFixed(2)} {unit}
              </p>
            );
          })}
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
