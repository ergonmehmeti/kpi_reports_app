import React, { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '../../utils/constants';

const KPILineChart = memo(({ data, dataKeys = ['KPI1', 'KPI2'], yAxisLabel, colors: customColors, yAxisDomain, yAxisTicks, height = 300 }) => {
  const colors = customColors || [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.tertiary];

  // Calculate dynamic Y-axis domain based on data
  const calculateYDomain = () => {
    if (!data || data.length === 0) return [0, 100];
    
    // If custom domain is provided with numeric values, use it directly
    if (yAxisDomain && 
        Array.isArray(yAxisDomain) && 
        typeof yAxisDomain[0] === 'number' && 
        typeof yAxisDomain[1] === 'number') {
      return yAxisDomain;
    }
    
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
    
    // Handle custom domain with 'auto', 'autoRound30000', or 'autoFloorMinus1' for min or max
    if (yAxisDomain) {
      const calculatedMin = Math.floor(min);
      const calculatedMax = Math.ceil(max);
      const roundedMax30000 = Math.ceil(max / 30000) * 30000; // Round up to nearest 30000
      const floorMinus1 = Math.floor(min) - 1; // Floor the min and subtract 1
      return [
        yAxisDomain[0] === 'auto' ? calculatedMin : 
        yAxisDomain[0] === 'autoFloorMinus1' ? floorMinus1 : yAxisDomain[0],
        yAxisDomain[1] === 'auto' ? calculatedMax : 
        yAxisDomain[1] === 'autoRound30000' ? roundedMax30000 : yAxisDomain[1]
      ];
    }
    
    // Floor the minimum value and ceil the maximum value
    const flooredMin = Math.floor(min);
    const ceiledMax = Math.ceil(max);
    return [flooredMin, ceiledMax];
  };

  // Calculate Y-axis ticks for 5 evenly spaced values rounded to 0.5
  const calculateYTicks = () => {
    if (yAxisTicks === 'auto5') {
      const domain = calculateYDomain();
      const [minVal, maxVal] = domain;
      const range = maxVal - minVal;
      const step = range / 4; // 5 ticks = 4 intervals
      const ticks = [];
      for (let i = 0; i <= 4; i++) {
        const rawValue = minVal + (step * i);
        // Round to nearest 0.5
        const roundedValue = Math.round(rawValue * 2) / 2;
        ticks.push(roundedValue);
      }
      // Ensure max is exactly 100 if that's the upper bound
      if (maxVal === 100) ticks[4] = 100;
      return ticks;
    }
    // If custom ticks array is provided, use it directly
    if (Array.isArray(yAxisTicks)) {
      return yAxisTicks;
    }
    return yAxisTicks;
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
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="name" stroke="#666" tick={{ fontSize: 10 }} />
        <YAxis 
          stroke="#666" 
          width={80}
          domain={calculateYDomain()}
          ticks={calculateYTicks()}
          tickFormatter={(value) => typeof value === 'number' ? (Number.isInteger(value) ? value.toString() : value.toFixed(1)) : value}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } } : undefined}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={{ fontSize: '0.875rem', paddingTop: '10px' }}
          iconType="line"
        />
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
  );
});

KPILineChart.displayName = 'KPILineChart';

export default KPILineChart;
