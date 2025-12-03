import React from 'react';
import ChartCard from '../charts/ChartCard';
import KPILineChart from '../charts/KPILineChart';
import KPIBarChart from '../charts/KPIBarChart';

/**
 * ChartGrid Component
 * Renders a grid of charts based on configuration
 */
const ChartGrid = ({ chartConfigs }) => {
  return (
    <section className="charts-section">
      <div className="charts-grid">
        {chartConfigs.map((config, index) => (
          <ChartCard key={index} title={config.title} badge={config.badge || 'Hourly'}>
            {config.type === 'bar' ? (
              <KPIBarChart 
                data={config.data} 
                dataKeys={[config.dataKey]}
                yAxisLabel={config.yAxisLabel}
              />
            ) : (
              <KPILineChart 
                data={config.data} 
                dataKeys={[config.dataKey]}
                yAxisLabel={config.yAxisLabel}
              />
            )}
          </ChartCard>
        ))}
      </div>
    </section>
  );
};

export default ChartGrid;
