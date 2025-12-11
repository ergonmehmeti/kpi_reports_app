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
 * FrequencyStackedAreaChart Component
 * Displays LTE traffic data by frequency carrier in a stacked area chart
 */
const FrequencyStackedAreaChart = ({ data, height = 400 }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
        No frequency data available for the selected period
      </div>
    );
  }

  // Transform data to group by datetime (hourly) - NO aggregation
  
  // Group by datetime hour
  const groupedByTime = {};
  data.forEach(record => {
    const datetimeStr = record.datetime;
    
    if (!groupedByTime[datetimeStr]) {
      groupedByTime[datetimeStr] = {
        datetime: datetimeStr
      };
    }
    
    const carrierKey = `carrier_${record.earfcndl}`;
    groupedByTime[datetimeStr][carrierKey] = parseFloat(record.total_traffic_gb || 0);
  });

  // Convert to array and sort
  const sortedData = Object.entries(groupedByTime)
    .map(([datetime, values]) => ({ datetime, ...values }))
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

  // Define colors for each carrier frequency
  const carrierColors = {
    carrier_500: '#3b82f6',   // Blue - LTE2100
    carrier_1799: '#f97316',  // Orange - LTE1800
    carrier_3550: '#10b981',  // Green - LTE900
    carrier_6400: '#ec4899',  // Pink - LTE800
  };

  // Custom tooltip with better styling
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + entry.value, 0);
      const datetime = new Date(label);
      
      return (
        <div style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}>
          <p style={{ 
            margin: '0 0 8px 0', 
            fontWeight: '600', 
            color: '#1e3a8a',
            fontSize: '14px' 
          }}>
            {datetime.toLocaleString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })}
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
                {entry.name}: {entry.value.toFixed(2)} GB
              </span>
            </div>
          ))}
          <div style={{ 
            marginTop: '8px', 
            paddingTop: '8px', 
            borderTop: '1px solid #bfdbfe',
            fontWeight: '600',
            color: '#1e3a8a',
            fontSize: '13px'
          }}>
            Total: {total.toFixed(2)} GB
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom legend with frequency labels
  const carrierLabels = {
    carrier_500: '500 - LTE2100',
    carrier_1799: '1799 - LTE1800',
    carrier_3550: '3550 - LTE900',
    carrier_6400: '6400 - LTE800',
  };

  // Custom legend component with specific order
  const CustomLegend = () => {
    const legendOrder = ['carrier_500', 'carrier_1799', 'carrier_3550', 'carrier_6400'];
    
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
              backgroundColor: carrierColors[key],
              marginRight: '8px',
              borderRadius: '2px'
            }} />
            <span style={{ color: '#374151' }}>{carrierLabels[key]}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={sortedData}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          {Object.entries(carrierColors).map(([carrier, color]) => (
            <linearGradient key={carrier} id={`gradient_${carrier}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.3} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="datetime"
          tickFormatter={(datetime) => {
            const date = new Date(datetime);
            const day = date.getDate();
            const hour = date.getHours();
            const month = date.toLocaleDateString('en-US', { month: 'short' });
            
            // Show date at midnight, otherwise just show hour
            if (hour === 0) {
              return `${month} ${day}`;
            }
            return `${hour}:00`;
          }}
          interval="preserveStartEnd"
          angle={-45}
          textAnchor="end"
          height={80}
          tick={{ fontSize: 10, fill: '#6b7280' }}
        />
        <YAxis 
          label={{ 
            value: 'Traffic Volume (GB)', 
            angle: -90, 
            position: 'insideLeft',
            style: { fontSize: 12, fill: '#374151' }
          }}
          tick={{ fontSize: 11, fill: '#6b7280' }}
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
          dataKey="carrier_6400"
          stackId="1"
          stroke={carrierColors.carrier_6400}
          fill={`url(#gradient_carrier_6400)`}
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="carrier_3550"
          stackId="1"
          stroke={carrierColors.carrier_3550}
          fill={`url(#gradient_carrier_3550)`}
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="carrier_1799"
          stackId="1"
          stroke={carrierColors.carrier_1799}
          fill={`url(#gradient_carrier_1799)`}
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="carrier_500"
          stackId="1"
          stroke={carrierColors.carrier_500}
          fill={`url(#gradient_carrier_500)`}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default FrequencyStackedAreaChart;
