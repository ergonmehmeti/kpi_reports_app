import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

/**
 * NRRrcUsersStackedAreaChart Component
 * Displays NR RRC Connected Users by frequency band in a stacked area chart
 */
const NRRrcUsersStackedAreaChart = ({ data, height = 400, title = 'RRC Connected Users' }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
        No data available for the selected period
      </div>
    );
  }

  // Define colors for each frequency band (matching NR theme)
  const bandColors = {
    '900MHz': '#6b21a8',   // Purple
    '3500MHz': '#ec4899',  // Pink
  };

  // Custom tooltip with better styling
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
      
      return (
        <div style={{
          backgroundColor: '#fdf4ff',
          border: '1px solid #e879f9',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}>
          <p style={{ 
            margin: '0 0 8px 0', 
            fontWeight: '600', 
            color: '#6b21a8',
            fontSize: '14px' 
          }}>
            {label}
          </p>
          {payload.map((entry, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '4px',
              fontSize: '13px'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: entry.color,
                marginRight: '8px',
                borderRadius: '2px',
              }} />
              <span style={{ color: '#000', fontWeight: '500' }}>
                {entry.name}: {entry.value != null ? Math.round(entry.value).toLocaleString() : 'N/A'} users
              </span>
            </div>
          ))}
          <div style={{ 
            marginTop: '8px', 
            paddingTop: '8px', 
            borderTop: '1px solid #e879f9',
            fontWeight: '600',
            color: '#6b21a8',
            fontSize: '13px'
          }}>
            Total: {Math.round(total).toLocaleString()} users
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom legend component
  const CustomLegend = () => {
    const legendOrder = ['900MHz', '3500MHz'];
    
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        paddingLeft: '10px',
        fontSize: '12px',
        fontWeight: '500'
      }}>
        {legendOrder.map((key) => (
          <div key={key} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '8px' 
          }}>
            <div style={{
              width: '14px',
              height: '14px',
              backgroundColor: bandColors[key],
              marginRight: '8px',
              borderRadius: '2px'
            }} />
            <span style={{ color: '#374151' }}>{key}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          {Object.entries(bandColors).map(([band, color]) => (
            <linearGradient key={band} id={`gradient_nr_${band}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.3} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="name"
          tickFormatter={(name) => {
            // name format: "YYYY-MM-DD HH:00"
            const parts = name.split(' ');
            if (parts.length === 2) {
              const datePart = parts[0];
              const timePart = parts[1];
              const date = new Date(`${datePart}T${timePart}`);
              return date.toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit' 
              });
            }
            return name;
          }}
          interval="preserveStartEnd"
          angle={-45}
          textAnchor="end"
          height={80}
          tick={{ fontSize: 10, fill: '#6b7280' }}
        />
        <YAxis 
          label={{ 
            value: 'Users', 
            angle: -90, 
            position: 'insideLeft',
            style: { fontSize: 12, fill: '#374151' }
          }}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickFormatter={(value) => value.toLocaleString()}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="middle"
          align="right"
          layout="vertical"
          content={<CustomLegend />}
        />
        <Area
          type="monotone"
          dataKey="3500MHz"
          stackId="1"
          stroke={bandColors['3500MHz']}
          fill={`url(#gradient_nr_3500MHz)`}
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="900MHz"
          stackId="1"
          stroke={bandColors['900MHz']}
          fill={`url(#gradient_nr_900MHz)`}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default NRRrcUsersStackedAreaChart;
