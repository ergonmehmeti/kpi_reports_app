import React, { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * 100% Stacked Bar Chart Component
 * Displays bars as percentages (100% height) but shows actual values in tooltips
 */
const PercentageStackedBarChart = memo(({ 
  data, 
  dataKeys, 
  colors, 
  yAxisLabel, 
  barSize = 40, 
  height = 400 
}) => {
  // Custom tooltip that shows actual values (GB) instead of percentages
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Calculate total
      const total = payload.reduce((sum, entry) => sum + (parseFloat(entry.value) || 0), 0);
      
      // Calculate percentages for display
      const dataWithPercentages = payload.map(entry => ({
        ...entry,
        percentage: total > 0 ? ((parseFloat(entry.value) / total) * 100).toFixed(1) : 0
      }));
      
      return (
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{label}</p>
          {dataWithPercentages.reverse().map((entry, index) => (
            <p key={index} style={{ margin: '0', color: entry.color }}>
              {entry.name}: {parseFloat(entry.value).toFixed(2)} {yAxisLabel || ''} ({entry.percentage}%)
            </p>
          ))}
          <p style={{ margin: '5px 0 0 0', paddingTop: '5px', borderTop: '1px solid #e0e0e0', fontWeight: 'bold' }}>
            Total: {total.toFixed(2)} {yAxisLabel || ''}
          </p>
        </div>
      );
    }
    return null;
  };

  // Format Y-axis as percentages
  const formatYAxis = (value) => {
    return `${(value * 100).toFixed(0)}%`;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} barSize={barSize} stackOffset="expand">
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="name" 
          stroke="#666" 
          angle={-45}
          textAnchor="end"
          height={100}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          stroke="#666" 
          width={80}
          tickFormatter={formatYAxis}
          domain={[0, 1]}
          ticks={[0, 0.25, 0.5, 0.75, 1]}
          label={{ value: 'Percentage', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {dataKeys.map((key, index) => (
          <Bar 
            key={key}
            dataKey={key} 
            stackId="stack"
            fill={colors[index % colors.length]} 
            radius={index === dataKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
});

PercentageStackedBarChart.displayName = 'PercentageStackedBarChart';

export default PercentageStackedBarChart;
