import React, { memo, useState, useCallback } from 'react';
import ChartCard from '../charts/ChartCard';
import KPILineChart from '../charts/KPILineChart';
import KPIBarChart from '../charts/KPIBarChart';
import ChartModal from '../charts/ChartModal';

/**
 * ChartGrid Component
 * Renders a grid of charts based on configuration
 * Memoized to prevent unnecessary re-renders
 */
const ChartGrid = memo(({ chartConfigs }) => {
  const [selectedChart, setSelectedChart] = useState(null);

  const handleChartClick = useCallback((config) => {
    setSelectedChart(config);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedChart(null);
  }, []);

  return (
    <section className="charts-section">
      <div className="charts-grid">
        {chartConfigs.map((config, index) => (
          <ChartCard 
            key={index} 
            title={config.title} 
            badge={config.badge || 'Hourly'}
            onClick={() => handleChartClick(config)}
          >
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

      {selectedChart && (
        <ChartModal
          isOpen={true}
          onClose={handleCloseModal}
          title={selectedChart.title}
          badge={selectedChart.badge || 'Hourly'}
          data={selectedChart.data}
          dataKeys={[selectedChart.dataKey]}
          yAxisLabel={selectedChart.yAxisLabel}
          chartType={selectedChart.type || 'line'}
        />
      )}
    </section>
  );
});

ChartGrid.displayName = 'ChartGrid';

export default ChartGrid;
