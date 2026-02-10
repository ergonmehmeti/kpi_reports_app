import React, { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * ComparisonBarChart Component
 * Renders a side-by-side bar chart for comparing two weeks of data
 * Supports custom colors for different use cases
 */
const ComparisonBarChart = memo(({ 
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
  yAxisTicks,
  height = 350,
  barSize = 30
}) => {
  // Default colors: Purple for week 1, Pink for week 2 (matching NR compare color scheme)
  // Can be overridden with custom colors
  const WEEK1_COLOR = week1Color || '#6b21a8'; // Purple
  const WEEK2_COLOR = week2Color || '#be185d'; // Pink
  
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
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value} {yAxisLabel || ''}
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
            borderRadius: '2px',
            display: 'inline-block'
          }}></span>
          <span style={{ color: '#475569', fontSize: '0.9rem' }}>{week1Label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ 
            width: '12px', 
            height: '12px', 
            backgroundColor: WEEK2_COLOR,
            borderRadius: '2px',
            display: 'inline-block'
          }}></span>
          <span style={{ color: '#475569', fontSize: '0.9rem' }}>{week2Label}</span>
        </div>
      </div>
    );
  };

  // Calculate Y-axis domain from data if not provided
  const calculateYDomain = () => {
    if (yAxisDomain) return yAxisDomain;
    
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
    
    if (minVal === Infinity || maxVal === -Infinity) {
      return [0, 100];
    }
    
    // Add some padding to the domain
    const padding = (maxVal - minVal) * 0.1;
    return [Math.max(0, minVal - padding), maxVal + padding];
  };

  const domain = calculateYDomain();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} barSize={barSize}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey={xAxisKey} 
          stroke="#666" 
          angle={-45}
          textAnchor="end"
          height={100}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          stroke="#666" 
          width={80}
          domain={domain}
          ticks={yAxisTicks}
          label={yAxisLabel ? { 
            value: yAxisLabel, 
            angle: -90, 
            position: 'insideLeft', 
            style: { textAnchor: 'middle' } 
          } : undefined}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend content={renderLegend} />
        <Bar 
          dataKey={dataKey1} 
          fill={WEEK1_COLOR} 
          name={week1Label}
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey={dataKey2} 
          fill={WEEK2_COLOR} 
          name={week2Label}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
});

ComparisonBarChart.displayName = 'ComparisonBarChart';

export default ComparisonBarChart;
