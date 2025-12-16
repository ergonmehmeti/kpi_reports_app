import React, { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * ComparisonLineChart Component
 * Renders a dual-line chart for comparing two weeks of data
 * Supports custom colors for different use cases
 */
const ComparisonLineChart = memo(({ 
  data, 
  week1Label, 
  week2Label, 
  yAxisLabel,
  week1Key,
  week2Key,
  xAxisKey = 'name',
  week1Color,
  week2Color,
  yAxisDomain,
  yAxisTicks
}) => {
  // Default colors: Blue for week 1, Green for week 2
  // Can be overridden with custom colors
  const WEEK1_COLOR = week1Color || '#3b82f6'; // Blue
  const WEEK2_COLOR = week2Color || '#22c55e'; // Green
  
  // Use custom keys if provided, otherwise use labels as keys
  const dataKey1 = week1Key || week1Label;
  const dataKey2 = week2Key || week2Label;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#1e293b' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ 
              margin: '4px 0', 
              color: entry.color,
              fontWeight: 500
            }}>
              {entry.name}: {entry.value} {yAxisLabel || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom legend to show week labels with colors
  const renderLegend = () => {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '24px',
        marginTop: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ 
            width: '12px', 
            height: '12px', 
            backgroundColor: WEEK1_COLOR,
            borderRadius: '50%',
            display: 'inline-block'
          }}></span>
          <span style={{ color: '#475569', fontSize: '0.9rem' }}>{week1Label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ 
            width: '12px', 
            height: '12px', 
            backgroundColor: WEEK2_COLOR,
            borderRadius: '50%',
            display: 'inline-block'
          }}></span>
          <span style={{ color: '#475569', fontSize: '0.9rem' }}>{week2Label}</span>
        </div>
      </div>
    );
  };

  // Calculate Y-axis domain from data for better visualization
  const calculateYDomain = () => {
    if (!data || data.length === 0) return ['auto', 'auto'];
    
    let minVal = Infinity;
    let maxVal = -Infinity;
    
    data.forEach(item => {
      const val1 = item[dataKey1];
      const val2 = item[dataKey2];
      
      if (val1 !== null && val1 !== undefined && !isNaN(val1)) {
        minVal = Math.min(minVal, val1);
        maxVal = Math.max(maxVal, val1);
      }
      if (val2 !== null && val2 !== undefined && !isNaN(val2)) {
        minVal = Math.min(minVal, val2);
        maxVal = Math.max(maxVal, val2);
      }
    });
    
    if (minVal === Infinity || maxVal === -Infinity) return ['auto', 'auto'];

    // Default behavior: match main KPI charts (no extra padding)
    // - min floored, max ceiled
    let domainMin = Math.floor(minVal);
    let domainMax = Math.ceil(maxVal);

    // Keep defaults consistent with main view unless explicitly overridden.
    // Special KPI-specific caps (e.g. Availability max=100) are handled by callers via yAxisDomain.

    // Ensure non-zero range so the chart renders nicely
    if (domainMax === domainMin) {
      domainMax = domainMin + 1;
    }

    return [domainMin, domainMax];
  };

  const yDomain = yAxisDomain || calculateYDomain();

  const calculateTicks = () => {
    if (yAxisTicks) return yAxisTicks;
    if (!Array.isArray(yDomain) || yDomain.length !== 2) return undefined;
    const [min, max] = yDomain;
    if (!Number.isFinite(min) || !Number.isFinite(max)) return undefined;

    const range = max - min;
    if (range <= 0) return undefined;

    // For moderate ranges, enforce readable steps like the main LTE charts.
    if (range <= 5) {
      const ticks = [];
      for (let i = Math.round(min * 2); i <= Math.round(max * 2); i += 1) {
        ticks.push(i / 2);
      }
      return ticks;
    }

    if (range <= 10) {
      const ticks = [];
      for (let i = Math.ceil(min); i <= Math.floor(max); i += 1) {
        ticks.push(i);
      }
      // Ensure endpoints are present
      if (ticks[0] !== min) ticks.unshift(min);
      if (ticks[ticks.length - 1] !== max) ticks.push(max);
      return ticks;
    }

    if (range <= 50) {
      const ticks = [];
      const start = Math.ceil(min / 5) * 5;
      for (let i = start; i <= max; i += 5) {
        ticks.push(i);
      }
      if (ticks.length === 0 || ticks[0] !== min) ticks.unshift(min);
      if (ticks[ticks.length - 1] !== max) ticks.push(max);
      return ticks;
    }

    if (range <= 100) {
      const ticks = [];
      const start = Math.ceil(min / 10) * 10;
      for (let i = start; i <= max; i += 10) {
        ticks.push(i);
      }
      if (ticks.length === 0 || ticks[0] !== min) ticks.unshift(min);
      if (ticks[ticks.length - 1] !== max) ticks.push(max);
      return ticks;
    }

    // For larger ranges, let Recharts choose ticks automatically.
    return undefined;
  };

  const yTicks = calculateTicks();

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey={xAxisKey} 
            stroke="#666"
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#666" 
            width={80}
            domain={yDomain}
            ticks={yTicks}
            label={yAxisLabel ? { 
              value: yAxisLabel, 
              angle: -90, 
              position: 'insideLeft', 
              style: { textAnchor: 'middle' } 
            } : undefined}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
          <Line 
            type="monotone" 
            dataKey={dataKey1}
            name={week1Label}
            stroke={WEEK1_COLOR}
            strokeWidth={2} 
            dot={{ fill: WEEK1_COLOR, r: 2 }}
            activeDot={{ r: 5 }}
            connectNulls
          />
          <Line 
            type="monotone" 
            dataKey={dataKey2}
            name={week2Label}
            stroke={WEEK2_COLOR}
            strokeWidth={2} 
            dot={{ fill: WEEK2_COLOR, r: 2 }}
            activeDot={{ r: 5 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

ComparisonLineChart.displayName = 'ComparisonLineChart';

export default ComparisonLineChart;
