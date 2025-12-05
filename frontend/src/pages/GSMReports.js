import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DateFilters from '../components/filters/DateFilters';
import ChartGrid from '../components/charts/ChartGrid';
import ChartCard from '../components/charts/ChartCard';
import ComparisonLineChart from '../components/charts/ComparisonLineChart';
import ChartModal from '../components/charts/ChartModal';
import { useWeekSelector } from '../hooks/useWeekSelector';
import { useGSMData } from '../hooks/useGSMData';
import { useGSMComparisonData } from '../hooks/useGSMComparisonData';
import { getGSMChartConfigs } from '../utils/gsmChartConfig';
import './GSMReports.css';

/**
 * GSMReports Page Component
 * Main page for displaying GSM network KPI reports
 */
const GSMReports = () => {
  // Week selector hook
  const { availableWeeks, selectedWeek, handleWeekChange, resetToLastFullWeek } = useWeekSelector();
  
  // Data fetching hooks
  const { data, loading, error, fetchData } = useGSMData();
  const { comparisonData, loading: comparisonLoading, error: comparisonError, fetchComparisonData } = useGSMComparisonData();
  
  // Local state for date range and mode
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showWeekSelector, setShowWeekSelector] = useState(true);
  
  // Comparison mode state
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedWeek2, setSelectedWeek2] = useState(null);
  
  // Modal state for comparison charts
  const [selectedComparisonChart, setSelectedComparisonChart] = useState(null);

  const handleComparisonChartClick = useCallback((chartConfig) => {
    setSelectedComparisonChart(chartConfig);
  }, []);

  const handleCloseComparisonModal = useCallback(() => {
    setSelectedComparisonChart(null);
  }, []);

  // Initialize dates from selected week
  useEffect(() => {
    if (selectedWeek) {
      setStartDate(selectedWeek.monday.toISOString().split('T')[0]);
      setEndDate(selectedWeek.sunday.toISOString().split('T')[0]);
    }
  }, [selectedWeek]);

  // Initialize second week for comparison (default to week before selected)
  useEffect(() => {
    if (availableWeeks.length > 0 && !selectedWeek2) {
      const week2 = availableWeeks.find(w => w.id === -2) || availableWeeks[1];
      setSelectedWeek2(week2);
    }
  }, [availableWeeks, selectedWeek2]);

  // Auto-fetch data when dates change in week selector mode (not comparison)
  useEffect(() => {
    if (startDate && endDate && showWeekSelector && !comparisonMode) {
      fetchData(startDate, endDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, showWeekSelector, comparisonMode]);

  // Handle week selection change - memoized to prevent recreation
  const onWeekChange = useCallback((weekId) => {
    handleWeekChange(weekId);
  }, [handleWeekChange]);

  // Handle week 2 selection change for comparison
  const onWeek2Change = useCallback((weekId) => {
    const week = availableWeeks.find(w => w.id === weekId);
    if (week) {
      setSelectedWeek2(week);
    }
  }, [availableWeeks]);

  // Handle toggle between week selector and custom dates - memoized
  const handleToggleMode = useCallback(() => {
    const newMode = !showWeekSelector;
    setShowWeekSelector(newMode);
    setComparisonMode(false); // Exit comparison mode when switching
    
    // If switching to week mode, reset to last full week
    if (newMode) {
      resetToLastFullWeek();
    }
  }, [showWeekSelector, resetToLastFullWeek]);

  // Handle toggle comparison mode
  const handleToggleComparison = useCallback(() => {
    const newComparisonMode = !comparisonMode;
    setComparisonMode(newComparisonMode);
    
    if (newComparisonMode) {
      setShowWeekSelector(true); // Ensure week selector mode
    }
  }, [comparisonMode]);

  // Handle manual refresh - memoized
  const handleRefresh = useCallback(() => {
    if (comparisonMode) {
      if (selectedWeek && selectedWeek2) {
        fetchComparisonData(selectedWeek, selectedWeek2);
      }
    } else if (startDate && endDate) {
      fetchData(startDate, endDate);
    }
  }, [comparisonMode, selectedWeek, selectedWeek2, startDate, endDate, fetchData, fetchComparisonData]);

  // Get chart configurations with current data - memoized to prevent recreation
  const chartConfigs = useMemo(() => getGSMChartConfigs(data), [data]);

  const isLoading = comparisonMode ? comparisonLoading : loading;
  const currentError = comparisonMode ? comparisonError : error;

  if (isLoading) {
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
        <p className="content-subtitle">
          {comparisonMode 
            ? 'Compare GSM KPIs between two weeks' 
            : 'View and analyze GSM network KPI data (Hourly)'}
        </p>
        
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
          comparisonMode={comparisonMode}
          onToggleComparison={handleToggleComparison}
          selectedWeek2={selectedWeek2}
          onWeek2Change={onWeek2Change}
        />
      </div>

      {currentError && (
        <div className="error-message">
          <p>⚠️ {currentError}</p>
        </div>
      )}

      {!currentError && comparisonMode && (
        <section className="charts-section">
          <div className="charts-grid">
            <ChartCard 
              title="Cell Availability Comparison" 
              badge="Weekly Comparison"
              onClick={() => handleComparisonChartClick({
                title: 'Cell Availability Comparison',
                data: comparisonData.cellAvailability,
                yAxisLabel: '%',
                week1Label: comparisonData.week1Label,
                week2Label: comparisonData.week2Label
              })}
            >
              <ComparisonLineChart
                data={comparisonData.cellAvailability}
                week1Label={comparisonData.week1Label}
                week2Label={comparisonData.week2Label}
                yAxisLabel="%"
              />
            </ChartCard>
            <ChartCard 
              title="Good Voice Quality Ratio UL" 
              badge="Weekly Comparison"
              onClick={() => handleComparisonChartClick({
                title: 'Good Voice Quality Ratio UL',
                data: comparisonData.voiceQuality,
                yAxisLabel: '%',
                week1Label: comparisonData.week1Label,
                week2Label: comparisonData.week2Label
              })}
            >
              <ComparisonLineChart
                data={comparisonData.voiceQuality}
                week1Label={comparisonData.week1Label}
                week2Label={comparisonData.week2Label}
                yAxisLabel="%"
              />
            </ChartCard>
            <ChartCard 
              title="Traffic Volume Comparison" 
              badge="Weekly Comparison"
              onClick={() => handleComparisonChartClick({
                title: 'Traffic Volume Comparison',
                data: comparisonData.trafficVolume,
                yAxisLabel: 'Erlangs',
                week1Label: comparisonData.week1Label,
                week2Label: comparisonData.week2Label
              })}
            >
              <ComparisonLineChart
                data={comparisonData.trafficVolume}
                week1Label={comparisonData.week1Label}
                week2Label={comparisonData.week2Label}
                yAxisLabel="Erlangs"
              />
            </ChartCard>
            <ChartCard 
              title="SDCCH Congestion Comparison" 
              badge="Weekly Comparison"
              onClick={() => handleComparisonChartClick({
                title: 'SDCCH Congestion Comparison',
                data: comparisonData.sdcchCongestion,
                yAxisLabel: '%',
                week1Label: comparisonData.week1Label,
                week2Label: comparisonData.week2Label
              })}
            >
              <ComparisonLineChart
                data={comparisonData.sdcchCongestion}
                week1Label={comparisonData.week1Label}
                week2Label={comparisonData.week2Label}
                yAxisLabel="%"
              />
            </ChartCard>
            <ChartCard 
              title="SDCCH Drop Rate Comparison" 
              badge="Weekly Comparison"
              onClick={() => handleComparisonChartClick({
                title: 'SDCCH Drop Rate Comparison',
                data: comparisonData.sdcchDropRate,
                yAxisLabel: '%',
                week1Label: comparisonData.week1Label,
                week2Label: comparisonData.week2Label
              })}
            >
              <ComparisonLineChart
                data={comparisonData.sdcchDropRate}
                week1Label={comparisonData.week1Label}
                week2Label={comparisonData.week2Label}
                yAxisLabel="%"
              />
            </ChartCard>
            <ChartCard 
              title="TCH Assignment Success Rate" 
              badge="Weekly Comparison"
              onClick={() => handleComparisonChartClick({
                title: 'TCH Assignment Success Rate',
                data: comparisonData.successRate,
                yAxisLabel: '%',
                week1Label: comparisonData.week1Label,
                week2Label: comparisonData.week2Label
              })}
            >
              <ComparisonLineChart
                data={comparisonData.successRate}
                week1Label={comparisonData.week1Label}
                week2Label={comparisonData.week2Label}
                yAxisLabel="%"
              />
            </ChartCard>
            <ChartCard 
              title="Subscriber TCH Congestion" 
              badge="Weekly Comparison"
              onClick={() => handleComparisonChartClick({
                title: 'Subscriber TCH Congestion',
                data: comparisonData.congestion,
                yAxisLabel: '%',
                week1Label: comparisonData.week1Label,
                week2Label: comparisonData.week2Label
              })}
            >
              <ComparisonLineChart
                data={comparisonData.congestion}
                week1Label={comparisonData.week1Label}
                week2Label={comparisonData.week2Label}
                yAxisLabel="%"
              />
            </ChartCard>
            <ChartCard 
              title="Call Drop Rate Comparison" 
              badge="Weekly Comparison"
              onClick={() => handleComparisonChartClick({
                title: 'Call Drop Rate Comparison',
                data: comparisonData.callDropRate,
                yAxisLabel: '%',
                week1Label: comparisonData.week1Label,
                week2Label: comparisonData.week2Label
              })}
            >
              <ComparisonLineChart
                data={comparisonData.callDropRate}
                week1Label={comparisonData.week1Label}
                week2Label={comparisonData.week2Label}
                yAxisLabel="%"
              />
            </ChartCard>
            <ChartCard 
              title="Call Minutes per Drop" 
              badge="Weekly Comparison"
              onClick={() => handleComparisonChartClick({
                title: 'Call Minutes per Drop',
                data: comparisonData.callMinutesPerDrop,
                yAxisLabel: 'Minutes',
                week1Label: comparisonData.week1Label,
                week2Label: comparisonData.week2Label
              })}
            >
              <ComparisonLineChart
                data={comparisonData.callMinutesPerDrop}
                week1Label={comparisonData.week1Label}
                week2Label={comparisonData.week2Label}
                yAxisLabel="Minutes"
              />
            </ChartCard>
            <ChartCard 
              title="Handover Success Rate" 
              badge="Weekly Comparison"
              onClick={() => handleComparisonChartClick({
                title: 'Handover Success Rate',
                data: comparisonData.handoverSuccess,
                yAxisLabel: '%',
                week1Label: comparisonData.week1Label,
                week2Label: comparisonData.week2Label
              })}
            >
              <ComparisonLineChart
                data={comparisonData.handoverSuccess}
                week1Label={comparisonData.week1Label}
                week2Label={comparisonData.week2Label}
                yAxisLabel="%"
              />
            </ChartCard>
            <ChartCard 
              title="Handover Drop Rate Comparison" 
              badge="Weekly Comparison"
              onClick={() => handleComparisonChartClick({
                title: 'Handover Drop Rate Comparison',
                data: comparisonData.handoverDropRate,
                yAxisLabel: '%',
                week1Label: comparisonData.week1Label,
                week2Label: comparisonData.week2Label
              })}
            >
              <ComparisonLineChart
                data={comparisonData.handoverDropRate}
                week1Label={comparisonData.week1Label}
                week2Label={comparisonData.week2Label}
                yAxisLabel="%"
              />
            </ChartCard>
          </div>

          {selectedComparisonChart && (
            <ChartModal
              isOpen={true}
              onClose={handleCloseComparisonModal}
              title={selectedComparisonChart.title}
              badge="Weekly Comparison"
              data={selectedComparisonChart.data}
              dataKeys={[selectedComparisonChart.week1Label, selectedComparisonChart.week2Label]}
              yAxisLabel={selectedComparisonChart.yAxisLabel}
              chartType="comparison"
              week1Label={selectedComparisonChart.week1Label}
              week2Label={selectedComparisonChart.week2Label}
            />
          )}
        </section>
      )}

      {!currentError && !comparisonMode && <ChartGrid chartConfigs={chartConfigs} />}
    </div>
  );
};

export default GSMReports;
