import React, { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * ComparisonLineChart Component
 * Renders a dual-line chart for comparing two weeks of data
 * Blue line for Week 1, Green line for Week 2
 */
const ComparisonLineChart = memo(({ data, week1Label, week2Label, yAxisLabel }) => {
  // Fixed colors: Blue for week 1, Green for week 2
  const WEEK1_COLOR = '#3b82f6'; // Blue
  const WEEK2_COLOR = '#22c55e'; // Green

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

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="name" 
            stroke="#666"
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
          />
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
          <Legend content={renderLegend} />
          <Line 
            type="monotone" 
            dataKey={week1Label}
            name={week1Label}
            stroke={WEEK1_COLOR}
            strokeWidth={2} 
            dot={{ fill: WEEK1_COLOR, r: 2 }}
            activeDot={{ r: 5 }}
            connectNulls
          />
          <Line 
            type="monotone" 
            dataKey={week2Label}
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
