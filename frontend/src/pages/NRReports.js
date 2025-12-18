import React, { useState, useEffect, useCallback } from 'react';
import DateFilters from '../components/filters/DateFilters';
import ChartCard from '../components/charts/ChartCard';
import KPILineChart from '../components/charts/KPILineChart';
import { useWeekSelector } from '../hooks/useWeekSelector';
import { useNRKPIData } from '../hooks/useNRKPIData';
import './LTEReports.css';

/**
 * NRReports Page Component
 * Main page for displaying NR (5G) network KPI reports
 */
const NRReports = () => {
  // Week selector hook
  const { availableWeeks, selectedWeek, handleWeekChange } = useWeekSelector();
  
  // Data fetching hook
  const { 
    data: kpiData, 
    loading: kpiLoading, 
    error: kpiError, 
    fetchData: fetchKPIData 
  } = useNRKPIData();
  
  // Local state for date range
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showWeekSelector, setShowWeekSelector] = useState(true);

  // Initialize dates from selected week
  useEffect(() => {
    if (selectedWeek) {
      setStartDate(selectedWeek.monday.toISOString().split('T')[0]);
      setEndDate(selectedWeek.sunday.toISOString().split('T')[0]);
    }
  }, [selectedWeek]);

  const loadData = useCallback(async () => {
    try {
      await fetchKPIData(startDate, endDate);
    } catch (error) {
      console.error('Error loading NR data:', error);
    }
  }, [startDate, endDate, fetchKPIData]);

  // Fetch data when dates change
  useEffect(() => {
    if (startDate && endDate) {
      loadData();
    }
  }, [startDate, endDate, loadData]);

  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Prepare EN-DC Setup Success Rate chart data (hourly)
  const prepareSetupSuccessRateData = () => {
    if (!kpiData || kpiData.length === 0) {
      console.log('❌ No KPI data available');
      return [];
    }

    console.log(`📊 Processing ${kpiData.length} KPI records`);

    // Group by date+hour for hourly granularity
    const dataByHour = {};
    
    kpiData.forEach(item => {
      const key = `${item.date_id}_${item.hour_id}`;
      if (!dataByHour[key]) {
        dataByHour[key] = { 
          name: `${item.date_id} ${String(item.hour_id).padStart(2, '0')}:00`,
          date: item.date_id,
          hour: item.hour_id,
          timestamp: new Date(`${item.date_id}T${String(item.hour_id).padStart(2, '0')}:00:00`).getTime(),
          '900MHz': null, 
          '3500MHz': null
        };
      }
      
      if (item.endc_setup_success_rate !== null && item.endc_setup_success_rate !== undefined) {
        if (item.freq_band === '900MHz') {
          dataByHour[key]['900MHz'] = parseFloat(item.endc_setup_success_rate);
        } else if (item.freq_band === '3500MHz') {
          dataByHour[key]['3500MHz'] = parseFloat(item.endc_setup_success_rate);
        }
      }
    });

    // Sort by timestamp
    const result = Object.values(dataByHour).sort((a, b) => a.timestamp - b.timestamp);

    console.log('📈 Hourly chart data prepared:', result.length, 'data points');
    return result;
  };

  const setupSuccessRateData = prepareSetupSuccessRateData();

  return (
    <div className="reports-page">
      <div className="content-header">
        <h2>NR (5G) Network Reports</h2>
        <p className="content-subtitle">Key Performance Indicators for 5G Network</p>
      </div>

      <DateFilters
        availableWeeks={availableWeeks}
        selectedWeek={selectedWeek}
        showWeekSelector={showWeekSelector}
        startDate={startDate}
        endDate={endDate}
        onWeekChange={handleWeekChange}
        onToggleSelector={() => setShowWeekSelector(!showWeekSelector)}
        onDateChange={handleDateChange}
      />

      {kpiLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading NR KPI data...</p>
        </div>
      )}

      {kpiError && (
        <div className="error-message">
          <p>Error loading data: {kpiError}</p>
        </div>
      )}

      {!kpiLoading && !kpiError && kpiData.length > 0 && (
        <div className="charts-section">
          <ChartCard 
            title="EN-DC Setup Success Rate (%)" 
            description="5G connection establishment success rate by frequency band"
          >
            <KPILineChart 
              data={setupSuccessRateData}
              dataKeys={['900MHz', '3500MHz']}
              colors={['#6b21a8', '#ec4899']}
              yAxisLabel="%"
            />
          </ChartCard>
        </div>
      )}

      {!kpiLoading && !kpiError && kpiData.length === 0 && (
        <div className="no-data-message">
          <p>No data available for the selected period. Please import NR data or select a different date range.</p>
        </div>
      )}
    </div>
  );
};

export default NRReports;
