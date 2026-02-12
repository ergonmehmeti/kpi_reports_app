import React, { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Stacked Bar Chart Component
 * For displaying stacked vertical bars (e.g., Traffic Volume with/without CA)
 */
const StackedBarChart = memo(({ data, dataKeys, colors, yAxisLabel, barSize = 40, height = 400, yAxisDomain, yAxisTicks }) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Calculate total
      const total = payload.reduce((sum, entry) => sum + (parseFloat(entry.value) || 0), 0);
      
      return (
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{label}</p>
          {payload.reverse().map((entry, index) => (
            <p key={index} style={{ margin: '0', color: entry.color }}>
              {entry.name}: {parseFloat(entry.value).toFixed(2)} {yAxisLabel || ''}
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

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} barSize={barSize}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="name" 
          stroke="#666" 
          height={80}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          stroke="#666" 
          width={80}
          domain={yAxisDomain}
          ticks={yAxisTicks}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } } : undefined}
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

StackedBarChart.displayName = 'StackedBarChart';

export default StackedBarChart;
