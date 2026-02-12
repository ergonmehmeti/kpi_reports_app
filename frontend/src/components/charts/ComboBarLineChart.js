import React, { memo } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Combination chart with bars and line using dual Y-axes
 * Left axis: Bar values (e.g., Traffic Volume in GB)
 * Right axis: Line values (e.g., Throughput in Mbps)
 */
const ComboBarLineChart = memo(({ 
  data, 
  barKey,
  lineKey,
  barLabel,
  lineLabel,
  leftAxisLabel,
  rightAxisLabel,
  barColor = '#f97316',
  lineColor = '#3b82f6',
  height = 400
}) => {
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
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '2px 0', color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis 
          dataKey="name" 
          stroke="#666"
          height={80}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          yAxisId="left"
          stroke="#666" 
          width={80}
          label={leftAxisLabel ? { 
            value: leftAxisLabel, 
            angle: -90, 
            position: 'insideLeft', 
            style: { textAnchor: 'middle' } 
          } : undefined}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          stroke="#666" 
          width={80}
          label={rightAxisLabel ? { 
            value: rightAxisLabel, 
            angle: 90, 
            position: 'insideRight', 
            style: { textAnchor: 'middle' } 
          } : undefined}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          yAxisId="left"
          dataKey={barKey} 
          name={barLabel}
          fill={barColor} 
          radius={[4, 4, 0, 0]}
          barSize={40}
        />
        <Line 
          yAxisId="right"
          type="monotone" 
          dataKey={lineKey}
          name={lineLabel}
          stroke={lineColor}
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
});

ComboBarLineChart.displayName = 'ComboBarLineChart';

export default ComboBarLineChart;
