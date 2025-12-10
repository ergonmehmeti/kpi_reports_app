import React, { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';

/**
 * Horizontal Stacked Bar Chart Component
 * For displaying DL/UL traffic per site
 */
const HorizontalStackedBarChart = memo(({ data, dataKeys, colors, labels, format }) => {
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: '#f0f9ff',
          border: '2px solid #60a5fa',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <p className="label" style={{ margin: '0 0 8px 0' }}><strong>{label}</strong></p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: '#333', margin: '4px 0' }}>
              <span style={{ 
                display: 'inline-block', 
                width: '12px', 
                height: '12px', 
                backgroundColor: entry.color,
                marginRight: '8px',
                borderRadius: '2px'
              }}></span>
              <strong>{labels[index]}:</strong> {format ? format(entry.value) : entry.value} GB
            </p>
          ))}
          <p style={{ marginTop: '8px', borderTop: '1px solid #94a3b8', paddingTop: '8px', color: '#333', marginBottom: 0 }}>
            <strong>Total: {format ? format(payload.reduce((sum, p) => sum + p.value, 0)) : payload.reduce((sum, p) => sum + p.value, 0)} GB</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={600}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number"
            label={{ value: '[GB]', position: 'insideBottom', offset: -10 }}
          />
          <YAxis 
            type="category"
            dataKey="site_name"
            width={90}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            payload={[
              { value: labels[0], type: 'rect', color: colors[0] },
              { value: labels[1], type: 'rect', color: colors[1] }
            ]}
          />
          
          {/* DL Bar */}
          <Bar dataKey={dataKeys[0]} stackId="a" fill={colors[0]}>
            <LabelList 
              dataKey={dataKeys[0]} 
              position="inside" 
              formatter={(value) => value > 0 ? format(value) : ''}
              style={{ fill: '#fff', fontSize: 12, fontWeight: 'bold' }}
            />
            {data.map((entry, index) => (
              <Cell key={`cell-dl-${index}`} />
            ))}
          </Bar>
          
          {/* UL Bar */}
          <Bar dataKey={dataKeys[1]} stackId="a" fill={colors[1]}>
            <LabelList 
              dataKey={dataKeys[1]} 
              position="inside" 
              formatter={(value) => value > 0 ? format(value) : ''}
              style={{ fill: '#fff', fontSize: 12, fontWeight: 'bold' }}
            />
            {data.map((entry, index) => (
              <Cell key={`cell-ul-${index}`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

HorizontalStackedBarChart.displayName = 'HorizontalStackedBarChart';

export default HorizontalStackedBarChart;
