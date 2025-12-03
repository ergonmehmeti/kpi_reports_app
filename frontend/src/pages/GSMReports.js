import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DateFilters from '../components/filters/DateFilters';
import ChartGrid from '../components/charts/ChartGrid';
import { useWeekSelector } from '../hooks/useWeekSelector';
import { useGSMData } from '../hooks/useGSMData';
import { getGSMChartConfigs } from '../utils/gsmChartConfig';
import './GSMReports.css';

/**
 * GSMReports Page Component
 * Main page for displaying GSM network KPI reports
 */
const GSMReports = () => {
  // Week selector hook
  const { availableWeeks, selectedWeek, handleWeekChange, resetToLastFullWeek } = useWeekSelector();
  
  // Data fetching hook
  const { data, loading, error, fetchData } = useGSMData();
  
  // Local state for date range and mode
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

  // Auto-fetch data when dates change in week selector mode
  useEffect(() => {
    if (startDate && endDate && showWeekSelector) {
      fetchData(startDate, endDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, showWeekSelector]);

  // Handle week selection change - memoized to prevent recreation
  const onWeekChange = useCallback((weekId) => {
    handleWeekChange(weekId);
  }, [handleWeekChange]);

  // Handle toggle between week selector and custom dates - memoized
  const handleToggleMode = useCallback(() => {
    const newMode = !showWeekSelector;
    setShowWeekSelector(newMode);
    
    // If switching to week mode, reset to last full week
    if (newMode) {
      resetToLastFullWeek();
    }
  }, [showWeekSelector, resetToLastFullWeek]);

  // Handle manual refresh - memoized
  const handleRefresh = useCallback(() => {
    if (startDate && endDate) {
      fetchData(startDate, endDate);
    }
  }, [startDate, endDate, fetchData]);

  // Get chart configurations with current data - memoized to prevent recreation
  const chartConfigs = useMemo(() => getGSMChartConfigs(data), [data]);

  if (loading) {
    return (
      <div className="reports-page">
        <div className="content-header">
          <h2>GSM Network Reports</h2>
          <p className="content-subtitle">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="content-header">
        <h2>GSM Network Reports</h2>
        <p className="content-subtitle">View and analyze GSM network KPI data (Hourly)</p>
        
        <DateFilters
          showWeekSelector={showWeekSelector}
          availableWeeks={availableWeeks}
          selectedWeek={selectedWeek}
          startDate={startDate}
          endDate={endDate}
          onWeekChange={onWeekChange}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onToggleMode={handleToggleMode}
          onRefresh={handleRefresh}
        />
      </div>

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
        </div>
      )}

      {!error && <ChartGrid chartConfigs={chartConfigs} />}
    </div>
  );
};

export default GSMReports;
