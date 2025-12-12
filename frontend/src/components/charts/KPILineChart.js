import React, { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '../../utils/constants';

const KPILineChart = memo(({ data, dataKeys = ['KPI1', 'KPI2'], yAxisLabel, colors: customColors, yAxisDomain }) => {
  const colors = customColors || [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.tertiary];

  // Calculate dynamic Y-axis domain based on data
  const calculateYDomain = () => {
    if (!data || data.length === 0) return [0, 100];
    
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
    
    // Handle custom domain with 'auto' for min or max
    if (yAxisDomain) {
      const calculatedMin = Math.floor(min);
      const calculatedMax = Math.ceil(max);
      return [
        yAxisDomain[0] === 'auto' ? calculatedMin : yAxisDomain[0],
        yAxisDomain[1] === 'auto' ? calculatedMax : yAxisDomain[1]
      ];
    }
    
    // Floor the minimum value and ceil the maximum value
    const flooredMin = Math.floor(min);
    const ceiledMax = Math.ceil(max);
    return [flooredMin, ceiledMax];
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Sort payload to match dataKeys order
      const sortedPayload = [...payload].sort((a, b) => {
        return dataKeys.indexOf(a.dataKey) - dataKeys.indexOf(b.dataKey);
      });
      
      return (
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{label}</p>
          {sortedPayload.map((entry, index) => (
            <p key={index} style={{ margin: '0', color: entry.color }}>
              {entry.name}: {entry.value}{yAxisLabel || ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="name" stroke="#666" tick={{ fontSize: 10 }} />
        <YAxis 
          stroke="#666" 
          width={80}
          domain={calculateYDomain()}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } } : undefined}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend content={() => null} />
        {dataKeys.map((key, index) => (
          <Line 
            key={key}
            type="monotone" 
            dataKey={key} 
            stroke={colors[index % colors.length]} 
            strokeWidth={2} 
            dot={{ fill: colors[index % colors.length] }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
    {/* Custom Legend */}
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      flexWrap: 'wrap', 
      marginTop: '10px',
      gap: '20px'
    }}>
      {dataKeys.map((key, index) => (
        <div key={key} style={{ display: 'flex', alignItems: 'center' }}>
          <svg width="14" height="14" style={{ marginRight: '4px' }}>
            <line x1="0" y1="7" x2="14" y2="7" stroke={colors[index % colors.length]} strokeWidth="2" />
            <circle cx="7" cy="7" r="3" fill={colors[index % colors.length]} />
          </svg>
          <span style={{ fontSize: '14px', color: '#666' }}>{key}</span>
        </div>
      ))}
    </div>
    </>
  );
});

KPILineChart.displayName = 'KPILineChart';

export default KPILineChart;
