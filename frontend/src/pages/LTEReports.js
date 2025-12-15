import React, { useState, useEffect, useCallback } from 'react';
import DateFilters from '../components/filters/DateFilters';
import ChartCard from '../components/charts/ChartCard';
import HorizontalStackedBarChart from '../components/charts/HorizontalStackedBarChart';
import FrequencyStackedAreaChart from '../components/charts/FrequencyStackedAreaChart';
import DualAxisLineChart from '../components/charts/DualAxisLineChart';
import KPILineChart from '../components/charts/KPILineChart';
import StackedBarChart from '../components/charts/StackedBarChart';
import ComboBarLineChart from '../components/charts/ComboBarLineChart';
import ComparisonLineChart from '../components/charts/ComparisonLineChart';
import { useWeekSelector } from '../hooks/useWeekSelector';
import { useLTEData } from '../hooks/useLTEData';
import { useLTEFrequencyData } from '../hooks/useLTEFrequencyData';
import { useLTEKPIData } from '../hooks/useLTEKPIData';
import { useLTEComparisonData, LTE_KPI_OPTIONS } from '../hooks/useLTEComparisonData';
import { getLTEChartConfigs } from '../utils/lteChartConfig';
import {
  prepareAvailabilityData,
  prepareAccessibilityData,
  prepareMobilityData,
  prepareRetainabilityDropRatioData,
  prepareRetainabilityDropsPerHourData,
  prepareIntegrityThroughputData,
  prepareUtilizationVolumeData,
  prepareTrafficThroughputCombinedData,
  prepareTrafficThroughputOverallData,
  prepareULUtilizationVolumeData,
  prepareULIntegrityThroughputData,
  prepareConnectedUsersData,
  prepareMACThroughputData,
  prepareMACTrafficThroughputDLData,
  prepareMACTrafficThroughputULData,
  prepareLatencyPacketLossData,
  prepareTotalTrafficVolumeData
} from '../utils/lteDataFormatters';
import './GSMReports.css';
import './LTEReports.css';

/**
 * LTEReports Page Component
 * Main page for displaying LTE network traffic reports
 */
const LTEReports = () => {
  // Week selector hook
  const { availableWeeks, selectedWeek, handleWeekChange, resetToLastFullWeek } = useWeekSelector();
  
  // Data fetching hooks
  const { loading, error, fetchData } = useLTEData();
  const { 
    data: frequencyData, 
    loading: frequencyLoading, 
    error: frequencyError, 
    fetchData: fetchFrequencyData 
  } = useLTEFrequencyData();
  const { 
    data: kpiData, 
    loading: kpiLoading, 
    error: kpiError, 
    fetchData: fetchKPIData 
  } = useLTEKPIData();
  
  // Comparison data hook
  const {
    comparisonData,
    siteTrafficComparison,
    frequencyComparison,
    loading: comparisonLoading,
    error: comparisonError,
    fetchComparisonData,
    week1Label,
    week2Label
  } = useLTEComparisonData();
  
  // Local state for date range and mode
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showWeekSelector, setShowWeekSelector] = useState(true);
  const [top20Sites, setTop20Sites] = useState([]);
  const [bottom20Sites, setBottom20Sites] = useState([]);
  
  // Comparison mode state
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedWeek2, setSelectedWeek2] = useState(null);
  const [selectedKPIs, setSelectedKPIs] = useState([]);
  const [includeSiteTraffic, setIncludeSiteTraffic] = useState(false);
  const [includeFrequencyBand, setIncludeFrequencyBand] = useState(false);

  // Initialize dates from selected week
  useEffect(() => {
    if (selectedWeek) {
      setStartDate(selectedWeek.monday.toISOString().split('T')[0]);
      setEndDate(selectedWeek.sunday.toISOString().split('T')[0]);
    }
  }, [selectedWeek]);

  // Fetch data when dates change
  useEffect(() => {
    if (startDate && endDate) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  // Load LTE data
  const loadData = async () => {
    try {
      const rawData = await fetchData(startDate, endDate);
      calculateTopAndBottomSites(rawData?.data || []);
      
      // Also fetch frequency data and KPI data
      await fetchFrequencyData(startDate, endDate);
      await fetchKPIData(startDate, endDate);
    } catch (err) {
      console.error('Error loading LTE data:', err);
    }
  };

  // Calculate top 20 and bottom 20 sites by total traffic
  const calculateTopAndBottomSites = (rawData) => {
    const siteTraffic = {};
    
    // Aggregate traffic per site
    rawData.forEach(record => {
      const site = record.site_name;
      if (!siteTraffic[site]) {
        siteTraffic[site] = {
          site_name: site,
          dl_traffic_gb: 0,
          ul_traffic_gb: 0,
          total_traffic_gb: 0
        };
      }
      siteTraffic[site].dl_traffic_gb += parseFloat(record.dl_traffic_gb || 0);
      siteTraffic[site].ul_traffic_gb += parseFloat(record.ul_traffic_gb || 0);
      siteTraffic[site].total_traffic_gb += parseFloat(record.total_traffic_gb || 0);
    });

    // Convert to array and sort by total traffic
    const sortedSites = Object.values(siteTraffic)
      .sort((a, b) => b.total_traffic_gb - a.total_traffic_gb);

    // Get top 20 and bottom 20
    setTop20Sites(sortedSites.slice(0, 20));
    setBottom20Sites(sortedSites.slice(-20).reverse()); // Reverse so lowest is at top
  };

  // Handle mode toggle
  const handleModeToggle = () => {
    setShowWeekSelector(!showWeekSelector);
    setComparisonMode(false);
    if (showWeekSelector) {
      resetToLastFullWeek();
    }
  };

  // Handle custom date change
  const handleCustomDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Initialize second week for comparison
  useEffect(() => {
    if (availableWeeks.length > 0 && !selectedWeek2) {
      const week2 = availableWeeks.find(w => w.id === -2) || availableWeeks[1];
      setSelectedWeek2(week2);
    }
  }, [availableWeeks, selectedWeek2]);

  // Handle toggle comparison mode
  const handleToggleComparison = useCallback(() => {
    const newComparisonMode = !comparisonMode;
    setComparisonMode(newComparisonMode);
    if (newComparisonMode) {
      setShowWeekSelector(true);
    }
  }, [comparisonMode]);

  // Handle week 2 selection change
  const onWeek2Change = useCallback((weekId) => {
    const week = availableWeeks.find(w => w.id === weekId);
    if (week) {
      setSelectedWeek2(week);
    }
  }, [availableWeeks]);

  // Handle KPI selection
  const handleKPIToggle = (kpiId) => {
    setSelectedKPIs(prev => {
      if (prev.includes(kpiId)) {
        return prev.filter(id => id !== kpiId);
      } else {
        return [...prev, kpiId];
      }
    });
  };

  // Handle refresh for comparison
  const handleRefresh = useCallback(() => {
    if (comparisonMode) {
      if (selectedWeek && selectedWeek2 && (selectedKPIs.length > 0 || includeSiteTraffic || includeFrequencyBand)) {
        fetchComparisonData(selectedWeek, selectedWeek2, selectedKPIs, includeSiteTraffic, includeFrequencyBand);
      }
    } else {
      loadData();
    }
  }, [comparisonMode, selectedWeek, selectedWeek2, selectedKPIs, includeSiteTraffic, includeFrequencyBand, fetchComparisonData]);

  // Auto-fetch comparison data when KPIs, weeks, or options change
  useEffect(() => {
    if (comparisonMode && selectedWeek && selectedWeek2) {
      // Only fetch if at least one option is selected
      if (selectedKPIs.length > 0 || includeSiteTraffic || includeFrequencyBand) {
        fetchComparisonData(selectedWeek, selectedWeek2, selectedKPIs, includeSiteTraffic, includeFrequencyBand);
      }
    }
  }, [comparisonMode, selectedWeek, selectedWeek2, selectedKPIs, includeSiteTraffic, includeFrequencyBand, fetchComparisonData]);

  // Get chart configurations
  const chartConfigs = getLTEChartConfigs();

  // Group KPIs by category for the selector
  const kpisByCategory = LTE_KPI_OPTIONS.reduce((acc, kpi) => {
    if (!acc[kpi.category]) {
      acc[kpi.category] = [];
    }
    acc[kpi.category].push(kpi);
    return acc;
  }, {});

  const isLoading = comparisonMode ? comparisonLoading : loading;
  const currentError = comparisonMode ? comparisonError : error;

  return (
    <div className="reports-page">
      <div className="content-header">
        <h2>LTE Network Traffic Reports</h2>
        <p className="content-subtitle">
          {comparisonMode 
            ? 'Compare LTE KPIs between two weeks' 
            : 'View and analyze LTE network traffic and KPI data'}
        </p>
      </div>

      <DateFilters
        showWeekSelector={showWeekSelector}
        availableWeeks={availableWeeks}
        selectedWeek={selectedWeek}
        onWeekChange={handleWeekChange}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onToggleMode={handleModeToggle}
        onRefresh={handleRefresh}
        hideCustomDatesButton={true}
        comparisonMode={comparisonMode}
        onToggleComparison={handleToggleComparison}
        selectedWeek2={selectedWeek2}
        onWeek2Change={onWeek2Change}
      />

      {/* KPI Selector for Comparison Mode */}
      {comparisonMode && (
        <div className="kpi-selector-container">
          <h4>Zgjedh KPI-të për krahasim:</h4>
          
          <div className="kpi-categories">
            {Object.entries(kpisByCategory).map(([category, kpis]) => (
              <div key={category} className="kpi-category">
                <h5>{String(category).replace('KPIs', "KPI's")}</h5>
                <div className="kpi-checkboxes">
                  {kpis.map(kpi => (
                    <label key={kpi.id} className="kpi-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedKPIs.includes(kpi.id)}
                        onChange={() => handleKPIToggle(kpi.id)}
                      />
                      <span>{kpi.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Site Traffic & Frequency Band Options - At Bottom */}
          <div className="site-traffic-option" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
            <label className="kpi-checkbox site-traffic-checkbox">
              <input
                type="checkbox"
                checked={includeSiteTraffic}
                onChange={() => setIncludeSiteTraffic(!includeSiteTraffic)}
              />
              <span>📊 Site Traffic Volume Analysis (DL/UL) - Top 20 & Bottom 20</span>
            </label>
            <label className="kpi-checkbox site-traffic-checkbox">
              <input
                type="checkbox"
                checked={includeFrequencyBand}
                onChange={() => setIncludeFrequencyBand(!includeFrequencyBand)}
              />
              <span>📶 LTE Data Traffic Volume by Frequency Band</span>
            </label>
          </div>
          
          <p className="kpi-selection-hint">
            {selectedKPIs.length === 0 && !includeSiteTraffic && !includeFrequencyBand
              ? '⚠️ Zgjedh të paktën një KPI ose Site Traffic për krahasim'
              : `✓ ${selectedKPIs.length} ${selectedKPIs.length === 1 ? 'KPI' : "KPI's"}${includeSiteTraffic ? ' + Site Traffic' : ''}${includeFrequencyBand ? ' + Frequency Band' : ''} të zgjedhura`}
          </p>
        </div>
      )}

      {isLoading && <div className="loading">Loading LTE data...</div>}
      {currentError && <div className="error-message"><p>⚠️ {currentError}</p></div>}

      {/* Comparison Charts - KPIs first */}
      {comparisonMode && !comparisonLoading && !comparisonError && Object.keys(comparisonData).length > 0 && (
        <section className="charts-section">
          <div className="charts-grid">
            {selectedKPIs.map(kpiId => {
              const kpiConfig = LTE_KPI_OPTIONS.find(k => k.id === kpiId);
              const chartData = comparisonData[kpiId];
              
              if (!chartData || !kpiConfig) return null;
              
              return (
                <ChartCard 
                  key={kpiId}
                  title={kpiConfig.label} 
                  badge="Weekly Comparison"
                >
                  <ComparisonLineChart
                    data={chartData}
                    week1Label={week1Label}
                    week2Label={week2Label}
                    yAxisLabel={kpiConfig.yAxisLabel}
                  />
                </ChartCard>
              );
            })}
          </div>
        </section>
      )}

      {/* Site Traffic Comparison Charts - At bottom */}
      {comparisonMode && !comparisonLoading && !comparisonError && includeSiteTraffic && 
       (siteTrafficComparison.top20.length > 0 || siteTrafficComparison.bottom20.length > 0) && (
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '12px', 
          padding: '2rem', 
          marginTop: '2rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb'
        }}>
          <div className="content-header" style={{ marginTop: '0' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '0.5rem' }}>
              Site Traffic Volume Comparison (DL/UL)
            </h3>
            <p className="content-subtitle" style={{ fontSize: '0.875rem' }}>
              Comparing total traffic per site: <span style={{color: '#3b82f6', fontWeight: 600}}>{week1Label}</span> vs <span style={{color: '#22c55e', fontWeight: 600}}>{week2Label}</span>
            </p>
          </div>
          
          <div className="site-comparison-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
            {siteTrafficComparison.top20.length > 0 && (
              <ChartCard title="Top 20 Sites by Traffic" badge="Weekly Comparison">
                <div style={{ height: '500px' }}>
                  {siteTrafficComparison.top20.map((site, index) => (
                    <div key={site.site_name} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '6px 0',
                      borderBottom: index < 19 ? '1px solid #f0f0f0' : 'none'
                    }}>
                      <span style={{ width: '140px', fontSize: '0.75rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {site.site_name}
                      </span>
                      <div style={{ flex: 1, display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <div style={{
                          height: '12px',
                          width: `${Math.min((site.week1_traffic / Math.max(...siteTrafficComparison.top20.map(s => Math.max(s.week1_traffic, s.week2_traffic)))) * 100, 100)}%`,
                          backgroundColor: '#3b82f6',
                          borderRadius: '2px'
                        }}></div>
                        <span style={{ fontSize: '0.65rem', color: '#3b82f6', minWidth: '50px' }}>{site.week1_traffic.toFixed(1)} GB</span>
                      </div>
                      <div style={{ flex: 1, display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <div style={{
                          height: '12px',
                          width: `${Math.min((site.week2_traffic / Math.max(...siteTrafficComparison.top20.map(s => Math.max(s.week1_traffic, s.week2_traffic)))) * 100, 100)}%`,
                          backgroundColor: '#22c55e',
                          borderRadius: '2px'
                        }}></div>
                        <span style={{ fontSize: '0.65rem', color: '#22c55e', minWidth: '50px' }}>{site.week2_traffic.toFixed(1)} GB</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>
            )}

            {siteTrafficComparison.bottom20.length > 0 && (
              <ChartCard title="Bottom 20 Sites by Traffic" badge="Weekly Comparison">
                <div style={{ height: '500px' }}>
                  {siteTrafficComparison.bottom20.map((site, index) => (
                    <div key={site.site_name} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '6px 0',
                      borderBottom: index < 19 ? '1px solid #f0f0f0' : 'none'
                    }}>
                      <span style={{ width: '140px', fontSize: '0.75rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {site.site_name}
                      </span>
                      <div style={{ flex: 1, display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <div style={{
                          height: '12px',
                          width: `${Math.min((site.week1_traffic / Math.max(...siteTrafficComparison.bottom20.map(s => Math.max(s.week1_traffic, s.week2_traffic)), 1)) * 100, 100)}%`,
                          backgroundColor: '#3b82f6',
                          borderRadius: '2px'
                        }}></div>
                        <span style={{ fontSize: '0.65rem', color: '#3b82f6', minWidth: '50px' }}>{site.week1_traffic.toFixed(1)} GB</span>
                      </div>
                      <div style={{ flex: 1, display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <div style={{
                          height: '12px',
                          width: `${Math.min((site.week2_traffic / Math.max(...siteTrafficComparison.bottom20.map(s => Math.max(s.week1_traffic, s.week2_traffic)), 1)) * 100, 100)}%`,
                          backgroundColor: '#22c55e',
                          borderRadius: '2px'
                        }}></div>
                        <span style={{ fontSize: '0.65rem', color: '#22c55e', minWidth: '50px' }}>{site.week2_traffic.toFixed(1)} GB</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>
            )}
          </div>
          
          {/* Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '50%' }}></span>
              <span style={{ color: '#475569', fontSize: '0.9rem' }}>{week1Label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#22c55e', borderRadius: '50%' }}></span>
              <span style={{ color: '#475569', fontSize: '0.9rem' }}>{week2Label}</span>
            </div>
          </div>
        </div>
      )}

      {/* Frequency Band Comparison Charts - 4 separate charts, one per band - At bottom */}
      {comparisonMode && !comparisonLoading && !comparisonError && includeFrequencyBand && 
       Object.keys(frequencyComparison).length > 0 && (
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '12px', 
          padding: '2rem', 
          marginTop: '2rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb'
        }}>
          <div className="content-header" style={{ marginTop: '0' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '0.5rem' }}>
              LTE Data Traffic Volume by Frequency Band
            </h3>
            <p className="content-subtitle" style={{ fontSize: '0.875rem' }}>
              Comparing traffic by frequency band: <span style={{fontWeight: 600}}>{week1Label}</span> (light shade) vs <span style={{fontWeight: 600}}>{week2Label}</span> (dark shade)
            </p>
          </div>
          
          {/* Legend - showing band colors */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '50%' }}></span>
              <span style={{ color: '#475569', fontSize: '0.85rem' }}>LTE2100</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#f97316', borderRadius: '50%' }}></span>
              <span style={{ color: '#475569', fontSize: '0.85rem' }}>LTE1800</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '50%' }}></span>
              <span style={{ color: '#475569', fontSize: '0.85rem' }}>LTE900</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#ec4899', borderRadius: '50%' }}></span>
              <span style={{ color: '#475569', fontSize: '0.85rem' }}>LTE800</span>
            </div>
          </div>
          
          {/* 4 Charts Grid - one per frequency band */}
          <div className="frequency-comparison-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
            {['500 - LTE2100', '1799 - LTE1800', '3550 - LTE900', '6400 - LTE800'].map((bandName) => {
              const bandData = frequencyComparison[bandName] || [];
              
              // Band-specific colors matching main view
              // Week 1: lighter shade, Week 2: darker/stronger shade
              const bandColorSchemes = {
                '500 - LTE2100': { 
                  week1: '#93c5fd', // Light blue
                  week2: '#1d4ed8', // Strong blue
                  base: '#3b82f6'   // Base blue
                },
                '1799 - LTE1800': { 
                  week1: '#fdba74', // Light orange
                  week2: '#c2410c', // Strong orange
                  base: '#f97316'   // Base orange
                },
                '3550 - LTE900': { 
                  week1: '#6ee7b7', // Light green
                  week2: '#047857', // Strong green
                  base: '#10b981'   // Base green
                },
                '6400 - LTE800': { 
                  week1: '#f9a8d4', // Light pink
                  week2: '#be185d', // Strong pink
                  base: '#ec4899'   // Base pink
                }
              };
              
              const colorScheme = bandColorSchemes[bandName];
              
              if (bandData.length === 0) return null;
              
              // Calculate totals for summary
              const week1Total = bandData.reduce((sum, d) => sum + d.week1, 0);
              const week2Total = bandData.reduce((sum, d) => sum + d.week2, 0);
              const change = week1Total > 0 ? ((week2Total - week1Total) / week1Total * 100) : 0;
              
              return (
                <ChartCard 
                  key={bandName}
                  title={bandName} 
                  badge="Weekly Comparison"
                >
                  <div style={{ height: '300px' }}>
                    <ComparisonLineChart
                      data={bandData}
                      week1Label={week1Label}
                      week2Label={week2Label}
                      yAxisLabel="Traffic (GB)"
                      week1Key="week1"
                      week2Key="week2"
                      xAxisKey="time"
                      week1Color={colorScheme.week1}
                      week2Color={colorScheme.week2}
                    />
                  </div>
                  {/* Band Summary */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-around', 
                    padding: '12px', 
                    backgroundColor: '#f9fafb', 
                    borderRadius: '8px',
                    marginTop: '8px',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: colorScheme.week1, fontWeight: 600 }}>{week1Total.toFixed(1)} GB</div>
                      <div style={{ color: '#6b7280' }}>{week1Label}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: colorScheme.week2, fontWeight: 600 }}>{week2Total.toFixed(1)} GB</div>
                      <div style={{ color: '#6b7280' }}>{week2Label}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        color: change > 0 ? '#22c55e' : change < 0 ? '#ef4444' : '#6b7280', 
                        fontWeight: 600 
                      }}>
                        {change > 0 ? '+' : ''}{change.toFixed(1)}%
                      </div>
                      <div style={{ color: '#6b7280' }}>Change</div>
                    </div>
                  </div>
                </ChartCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Normal View - All existing sections */}
      {!comparisonMode && (
        <>
          {loading && <div className="loading">Loading LTE traffic data...</div>}
          {error && <div className="error">Error: {error}</div>}

      {/* Cell Availability KPIs Section */}
      {!kpiLoading && !kpiError && kpiData.length > 0 && (
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '12px', 
          padding: '2rem', 
          marginTop: '2rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb'
        }}>
          <div className="content-header" style={{ marginTop: '0' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '0.5rem' }}>
              Cell Availability KPIs
            </h3>
            <p className="content-subtitle" style={{ fontSize: '0.875rem' }}>
              Hourly cell availability and unavailability metrics
            </p>
          </div>
          
          <div style={{ marginTop: '1.5rem' }}>
            <ChartCard title="Availability Metrics">
              <DualAxisLineChart
                data={prepareAvailabilityData(kpiData)}
                leftAxisKey="Cell Availability (%)"
                rightAxisKeys={[
                  'Cell UnAvailability - Fault (%)',
                  'Cell UnAvailability - Operation (%)'
                ]}
                leftAxisLabel="Availability (%)"
                rightAxisLabel="Unavailability (%)"
              />
            </ChartCard>
          </div>
        </div>
      )}

      {/* Accessibility KPIs Section (Connection Success) */}
      {!kpiLoading && !kpiError && kpiData.length > 0 && (
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '12px', 
          padding: '2rem', 
          marginTop: '2rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb'
        }}>
          <div className="content-header" style={{ marginTop: '0' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '0.5rem' }}>
              Accessibility KPIs
            </h3>
            <p className="content-subtitle" style={{ fontSize: '0.875rem' }}>
              E2E KPI from RRC to E-RAB setup (Radio, Transport and Core)
            </p>
          </div>
          
          <div style={{ marginTop: '1.5rem' }}>
            <ChartCard title="Connection Establishment Success Rates">
              <KPILineChart
                data={prepareAccessibilityData(kpiData)}
                dataKeys={[
                  'RRC Connection Establishment Success (%)',
                  'S1 Connection Establishment Success (%)',
                  'E-RAB Only Establishment Success (%)',
                  'Initial E-RAB Establishment Success (%)'
                ]}
                colors={['#3b82f6', '#f97316', '#10b981', '#ec4899']}
                yAxisLabel="%"
              />
            </ChartCard>
          </div>
        </div>
      )}

      {/* Traffic & Throughput KPIs Section */}
      {!kpiLoading && !kpiError && kpiData.length > 0 && (
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '12px', 
          padding: '2rem', 
          marginTop: '2rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb'
        }}>
          <div className="content-header" style={{ marginTop: '0' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '0.5rem' }}>
              Traffic & Throughput KPIs
            </h3>
            <p className="content-subtitle" style={{ fontSize: '0.875rem' }}>
              Data traffic volume and user throughput performance metrics
            </p>
          </div>
          
          <div style={{ marginTop: '1.5rem' }}>
            <ChartCard title="Integrity KPIs - The speed at which packets can be transferred once the first packet has been scheduled on the air interface">
              <KPILineChart
                data={prepareIntegrityThroughputData(kpiData)}
                dataKeys={[
                  'Average DL PDCP UE Throughput with CA (Mbps)',
                  'Average DL PDCP UE Throughput Overall (Mbps)'
                ]}
                colors={['#3b82f6', '#60a5fa']}
                yAxisLabel="Mbps"
                yAxisDomain={[0, 'auto']}
              />
            </ChartCard>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <ChartCard title="Utilization - LTE Data Traffic Volume transferred on DL direction with and without using Carrier Aggregation">
              <StackedBarChart
                data={prepareUtilizationVolumeData(kpiData)}
                dataKeys={[
                  '4G DL PDCP Traffic Volume without CA (GB)',
                  '4G DL PDCP Traffic Volume with CA (GB)'
                ]}
                colors={['#fbbf24', '#f97316']}
                yAxisLabel="GB"
                barSize={40}
                height={400}
              />
            </ChartCard>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <ChartCard title="Traffic and Throughput for UEs using LTE Carrier Aggregation on DL direction - UE DL Throughput is reduced with increase of traffic load on network">
              <ComboBarLineChart
                data={prepareTrafficThroughputCombinedData(kpiData)}
                barKey="4G DL PDCP Traffic Volume with CA (GB)"
                lineKey="Average DL PDCP UE Throughput with CA (Mbps)"
                barLabel="4G DL PDCP Traffic Volume with CA (GB)"
                lineLabel="Average DL PDCP UE Throughput with CA (Mbps)"
                leftAxisLabel="Traffic Volume (GB)"
                rightAxisLabel="Throughput (Mbps)"
                barColor="#f97316"
                lineColor="#3b82f6"
                height={400}
              />
            </ChartCard>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <ChartCard title="Traffic and Throughput for UEs with and without using LTE Carrier Aggregation on DL direction - UE DL Throughput is reduced with increase of traffic load on network">
              <ComboBarLineChart
                data={prepareTrafficThroughputOverallData(kpiData)}
                barKey="4G DL PDCP Traffic Volume Overall (GB)"
                lineKey="Average DL PDCP UE Throughput Overall (Mbps)"
                barLabel="4G DL PDCP Traffic Volume Overall (GB)"
                lineLabel="Average DL PDCP UE Throughput Overall (Mbps)"
                leftAxisLabel="Traffic Volume (GB)"
                rightAxisLabel="Throughput (Mbps)"
                barColor="#f97316"
                lineColor="#60a5fa"
                height={400}
              />
            </ChartCard>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <ChartCard title="Utilization - LTE Data Traffic Volume transferred on UL direction used for UL PDCP UE throughput calculation - Overall traffic volume and amount of traffic using Carrier Aggregation (CA) on UL">
              <StackedBarChart
                data={prepareULUtilizationVolumeData(kpiData)}
                dataKeys={[
                  '4G UL PDCP Traffic Volume with CA (GB)',
                  '4G UL PDCP Traffic Volume Overall (GB)'
                ]}
                colors={['#60a5fa', '#f97316']}
                yAxisLabel="GB"
                barSize={40}
                height={400}
              />
            </ChartCard>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <ChartCard title="Integrity KPIs - The speed at which packets can be transferred once the first packet has been scheduled on the air interface (UL direction)">
              <KPILineChart
                data={prepareULIntegrityThroughputData(kpiData)}
                dataKeys={[
                  'Average UL PDCP UE Throughput with CA (Mbps)',
                  'Average UL PDCP UE Throughput Overall (Mbps)'
                ]}
                colors={['#60a5fa', '#f97316']}
                yAxisLabel="Mbps"
                yAxisDomain={[0, 'auto']}
              />
            </ChartCard>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <ChartCard title="Utilization KPIs - Number of LTE UEs on 'Connected State' - Connected means there is signaling connection between UE and Network. Signaling Connection is made up of 2 parts: RRC Connection (UE<->eNB) and S1_MME (eNB<->MME) Connection">
              <KPILineChart
                data={prepareConnectedUsersData(kpiData)}
                dataKeys={[
                  'Connected LTE Users (Avg)',
                  'Connected LTE User (Max)'
                ]}
                colors={['#f97316', '#3b82f6']}
                yAxisLabel="Users"
                yAxisDomain={[0, 'auto']}
              />
            </ChartCard>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <ChartCard title="Integrity KPIs - Downlink and Uplink Throughput for Cell Level measured at MAC layer">
              <DualAxisLineChart
                data={prepareMACThroughputData(kpiData)}
                leftAxisKey="Average DL MAC Cell Throughput (Mbps)"
                rightAxisKeys={['Average UL MAC Cell Throughput (Mbps)']}
                leftAxisLabel="DL Throughput (Mbps)"
                rightAxisLabel="UL Throughput (Mbps)"
                colors={['#3b82f6', '#f97316']}
                leftAxisDomain={[0, 'autoRound10']}
                leftAxisUnit="Mbps"
                rightAxisUnit="Mbps"
              />
            </ChartCard>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <ChartCard title="Integrity KPIs - Throughput for cell and Traffic Volume measured at MAC layer on Downlink direction">
              <ComboBarLineChart
                data={prepareMACTrafficThroughputDLData(kpiData)}
                barKey="4G DL MAC Traffic Volume (GB)"
                lineKey="Average DL MAC Cell Throughput (Mbps)"
                barLabel="4G DL MAC Traffic Volume (GB)"
                lineLabel="Average DL MAC Cell Throughput (Mbps)"
                leftAxisLabel="Traffic Volume (GB)"
                rightAxisLabel="Throughput (Mbps)"
                barColor="#f97316"
                lineColor="#3b82f6"
                height={400}
              />
            </ChartCard>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <ChartCard title="Integrity KPIs - Throughput for cell and Traffic Volume measured at MAC layer on Uplink direction">
              <ComboBarLineChart
                data={prepareMACTrafficThroughputULData(kpiData)}
                barKey="4G UL MAC Traffic Volume (GB)"
                lineKey="Average UL MAC Cell Throughput (Mbps)"
                barLabel="4G UL MAC Traffic Volume (GB)"
                lineLabel="Average UL MAC Cell Throughput (Mbps)"
                leftAxisLabel="Traffic Volume (GB)"
                rightAxisLabel="Throughput (Mbps)"
                barColor="#f97316"
                lineColor="#3b82f6"
                height={400}
              />
            </ChartCard>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <ChartCard title="Integrity KPIs - DL Latency and UL Packet Loss - DL Latency indicates how long it takes to transmit the first packet on Air Interface from the time it was received on eNB. UL Packet Loss measures proportion of packets that have lost on Air interface in Uplink direction">
              <DualAxisLineChart
                data={prepareLatencyPacketLossData(kpiData)}
                leftAxisKey="Downlink Latency (ms)"
                rightAxisKeys={['Uplink Packet Loss (%)']}
                leftAxisLabel="Latency (ms)"
                rightAxisLabel="Packet Loss (%)"
                colors={['#3b82f6', '#f97316']}
                leftAxisDomain={[0, 'autoRound10']}
                rightAxisDomain={[0, 'autoRound0.2']}
                leftAxisUnit="ms"
                rightAxisUnit="%"
              />
            </ChartCard>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <ChartCard title="Utilization - LTE Total Data Traffic Volume transferred on DL and UL direction - The metric shows the total volume of PDCP SDUs on Data Radio Bearers that have been transferred in DL and UL">
              <StackedBarChart
                data={prepareTotalTrafficVolumeData(kpiData)}
                dataKeys={[
                  '4G UL PDCP Total Traffic Volume (GB)',
                  '4G DL PDCP Total Traffic Volume (GB)'
                ]}
                colors={['#3b82f6', '#f97316']}
                yAxisLabel="GB"
                barSize={40}
                height={400}
              />
            </ChartCard>
          </div>
        </div>
      )}

      {/* Mobility KPIs Section */}
      {!kpiLoading && !kpiError && kpiData.length > 0 && (
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '12px', 
          padding: '2rem', 
          marginTop: '2rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb'
        }}>
          <div className="content-header" style={{ marginTop: '0' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '0.5rem' }}>
              Mobility KPIs
            </h3>
            <p className="content-subtitle" style={{ fontSize: '0.875rem' }}>
              The ability to provide the requested service to the user with mobility. Success of HOs from preparation to execution phase.
            </p>
          </div>
          
          <div style={{ marginTop: '1.5rem' }}>
            <ChartCard title="Handover Success Metrics">
              <KPILineChart
                data={prepareMobilityData(kpiData)}
                dataKeys={[
                  'Handover Success Ratio (%)',
                  'Handover Execution Success (%)',
                  'Handover Preparation Success (%)'
                ]}
                colors={['#10b981', '#f59e0b', '#3b82f6']}
                yAxisLabel="%"
              />
            </ChartCard>
          </div>
        </div>
      )}

      {/* Retainability KPIs Section */}
      {!kpiLoading && !kpiError && kpiData.length > 0 && (
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '12px', 
          padding: '2rem', 
          marginTop: '2rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb'
        }}>
          <div className="content-header" style={{ marginTop: '0' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '0.5rem' }}>
              Retainability KPIs
            </h3>
            <p className="content-subtitle" style={{ fontSize: '0.875rem' }}>
              The ability of service, once obtained, to continued to be provided for a requested duration
            </p>
          </div>
          
          <div style={{ marginTop: '1.5rem' }}>
            <ChartCard title="Proportions of Abnormal E-RAB Releases over Total E-RAB Releases">
              <KPILineChart
                data={prepareRetainabilityDropRatioData(kpiData)}
                dataKeys={[
                  'E-RAB Drop Ratio-Overall (%)',
                  'E-RAB Drop due to MME (%)',
                  'E-RAB Drop due to eNB (%)'
                ]}
                colors={['#3b82f6', '#f97316', '#10b981']}
                yAxisLabel="%"
              />
            </ChartCard>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <ChartCard title="Rate of E-RABs Abnormally Released over Duration of Active Session Time for All UEs">
              <KPILineChart
                data={prepareRetainabilityDropsPerHourData(kpiData)}
                dataKeys={[
                  'E-RAB Drops per Hour (Overall)',
                  'E-RAB Drops per Hour due to MME',
                  'E-RAB Drops per Hour due to eNB'
                ]}
                colors={['#3b82f6', '#f97316', '#10b981']}
                yAxisLabel="drops/hour"
              />
            </ChartCard>
          </div>
        </div>
      )}

      {!loading && !error && (top20Sites.length > 0 || bottom20Sites.length > 0) && (
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '12px', 
          padding: '2rem', 
          marginTop: '2rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb'
        }}>
          <div className="content-header" style={{ marginTop: '0' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '0.5rem' }}>
              Site Traffic Volume Analysis (DL/UL)
            </h3>
            <p className="content-subtitle" style={{ fontSize: '0.875rem' }}>
              Top and bottom performing sites by total traffic volume (Downlink/Uplink)
            </p>
          </div>
          
          <div className="lte-charts-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
            {top20Sites.length > 0 && (
              <ChartCard title={chartConfigs[0].title}>
                <HorizontalStackedBarChart
                  data={top20Sites}
                  dataKeys={chartConfigs[0].dataKeys}
                  colors={chartConfigs[0].colors}
                  labels={chartConfigs[0].labels}
                  format={chartConfigs[0].format}
                />
              </ChartCard>
            )}

            {bottom20Sites.length > 0 && (
              <ChartCard title={chartConfigs[1].title}>
                <HorizontalStackedBarChart
                  data={bottom20Sites}
                  dataKeys={chartConfigs[1].dataKeys}
                  colors={chartConfigs[1].colors}
                  labels={chartConfigs[1].labels}
                  format={chartConfigs[1].format}
                />
              </ChartCard>
            )}
          </div>
        </div>
      )}

      {!loading && !error && top20Sites.length === 0 && bottom20Sites.length === 0 && (
        <div className="no-data">
          <p>No LTE traffic data available for the selected period.</p>
          <p>Please import data using the Import CSV button in the sidebar.</p>
        </div>
      )}

      {/* LTE Frequency (Carrier) Data Section */}
      <div style={{
        backgroundColor: '#ffffff', 
        borderRadius: '12px', 
        padding: '2rem', 
        marginTop: '2rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        border: '1px solid #e5e7eb'
      }}>
        <div className="content-header" style={{ marginTop: '0' }}>
          <h3 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '0.5rem' }}>
            LTE Data Traffic Volume by Frequency Band
          </h3>
          <p className="content-subtitle" style={{ fontSize: '0.875rem' }}>
            Hourly traffic distribution across carrier frequencies (500-LTE2100, 1799-LTE1800, 3550-LTE900, 6400-LTE800)
          </p>
        </div>

        {frequencyLoading && <div className="loading">Loading frequency data...</div>}
        {frequencyError && <div className="error">Error loading frequency data: {frequencyError}</div>}

        {!frequencyLoading && !frequencyError && frequencyData?.data && frequencyData.data.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <ChartCard title="">
              <FrequencyStackedAreaChart data={frequencyData.data} height={450} />
            </ChartCard>
          </div>
        )}

        {!frequencyLoading && !frequencyError && (!frequencyData?.data || frequencyData.data.length === 0) && (
          <div className="no-data">
            <p>No frequency data available for the selected period.</p>
            <p>Please import LTE Frequency CSV data using the sidebar.</p>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
};

export default LTEReports;
