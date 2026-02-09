import React, { useState, useEffect, useCallback } from 'react';
import ComparisonLineChart from '../components/charts/ComparisonLineChart';
import ChartCard from '../components/charts/ChartCard';
import ChartModal from '../components/charts/ChartModal';
import { useWeekSelector } from '../hooks/useWeekSelector';
import { useNRComparisonData, NR_KPI_OPTIONS } from '../hooks/useNRComparisonData';
import './LTEReports.css';

/**
 * NRReportsComparison Page Component
 * Page for comparing NR (5G) KPIs between two weeks
 * Shows side-by-side charts for 900MHz and 3500MHz frequency bands
 */
const NRReportsComparison = () => {
  // Week selector hook
  const { availableWeeks, selectedWeek, handleWeekChange } = useWeekSelector();
  
  // Comparison data hook
  const {
    comparisonData,
    loading: comparisonLoading,
    error: comparisonError,
    fetchComparisonData,
    week1Label,
    week2Label
  } = useNRComparisonData();
  
  // Local state
  const [selectedWeek2, setSelectedWeek2] = useState(null);
  const [selectedKPIs, setSelectedKPIs] = useState([]);
  
  // Modal state for enlarged chart view
  const [selectedChart, setSelectedChart] = useState(null);

  // Handle chart click to open modal
  const handleChartClick = useCallback((chartConfig) => {
    setSelectedChart(chartConfig);
  }, []);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setSelectedChart(null);
  }, []);

  // Initialize second week
  useEffect(() => {
    if (availableWeeks.length > 0 && !selectedWeek2) {
      const week2 = availableWeeks.find(w => w.id === -2) || availableWeeks[1];
      setSelectedWeek2(week2);
    }
  }, [availableWeeks, selectedWeek2]);

  // Handle week 2 selection change
  const onWeek2Change = useCallback((weekId) => {
    const week = availableWeeks.find(w => w.id === weekId);
    if (week) {
      setSelectedWeek2(week);
    }
  }, [availableWeeks]);

  // Handle KPI selection toggle
  const handleKPIToggle = (kpiId) => {
    setSelectedKPIs(prev => {
      if (prev.includes(kpiId)) {
        return prev.filter(id => id !== kpiId);
      } else {
        return [...prev, kpiId];
      }
    });
  };

  // Auto-fetch comparison data when KPIs or weeks change
  useEffect(() => {
    if (selectedWeek && selectedWeek2 && selectedKPIs.length > 0) {
      fetchComparisonData(selectedWeek, selectedWeek2, selectedKPIs);
    }
  }, [selectedWeek, selectedWeek2, selectedKPIs, fetchComparisonData]);

  // Group KPIs by category for the selector
  const kpisByCategory = NR_KPI_OPTIONS.reduce((acc, kpi) => {
    if (!acc[kpi.category]) {
      acc[kpi.category] = [];
    }
    acc[kpi.category].push(kpi);
    return acc;
  }, {});

  // Colors for comparison charts
  // Each frequency band uses two distinct colors for week1 and week2
  const colors = {
    '900MHz': {
      week1: '#6b21a8', // Purple
      week2: '#be185d'  // Pink
    },
    '3500MHz': {
      week1: '#6b21a8', // Purple
      week2: '#be185d'  // Pink
    }
  };

  return (
    <div>
      {/* Week Selectors */}
      <div className="date-range-picker comparison-mode">
        <div className="comparison-selectors">
          <div className="date-input-group">
            <label htmlFor="week1-select">
              <span className="week-indicator week1-indicator">●</span> Compare
            </label>
            <select 
              id="week1-select"
              value={selectedWeek?.id || 0}
              onChange={(e) => handleWeekChange(parseInt(e.target.value))}
              className="week-dropdown"
            >
              {availableWeeks.map(week => (
                <option key={week.id} value={week.id}>
                  {week.label}
                </option>
              ))}
            </select>
          </div>
          <div className="date-input-group">
            <label htmlFor="week2-select">
              <span className="week-indicator week2-indicator">●</span> with
            </label>
            <select 
              id="week2-select"
              value={selectedWeek2?.id || 0}
              onChange={(e) => onWeek2Change(parseInt(e.target.value))}
              className="week-dropdown"
            >
              {availableWeeks.map(week => (
                <option key={week.id} value={week.id}>
                  {week.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Selector */}
      <div className="kpi-selector-container">
        <h4>Zgjedh KPI-të për krahasim:</h4>
        
        <div className="kpi-categories three-columns">
          {/* Column 1: 5G NR Accessibility & Mobility KPI's */}
          <div className="kpi-category">
            <h5>5G NR Accessibility & Mobility KPI's</h5>
            <div className="kpi-checkboxes">
              {(kpisByCategory['5G NR Accessibility & Mobility KPIs'] || []).map(kpi => (
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
          
          {/* Column 2: Traffic & Integrity */}
          <div className="kpi-category">
            <h5>Traffic & Integrity</h5>
            <div className="kpi-checkboxes">
              {(kpisByCategory['Traffic & Integrity'] || []).map(kpi => (
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
          
          {/* Column 3: TOP Sites */}
          <div className="kpi-category">
            <h5>TOP Sites</h5>
            <div className="kpi-checkboxes">
              {(kpisByCategory['TOP Sites'] || []).map(kpi => (
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
        </div>
        
        <p className="kpi-selection-hint">
          {selectedKPIs.length === 0
            ? '⚠️ Zgjedh të paktën një KPI për krahasim'
            : `✓ ${selectedKPIs.length} ${selectedKPIs.length === 1 ? 'KPI' : "KPI's"} të zgjedhura`}
        </p>
      </div>

      {/* Loading and Error states */}
      {comparisonLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading comparison data...</p>
        </div>
      )}

      {comparisonError && (
        <div className="error-message">
          <p>Error loading data: {comparisonError}</p>
        </div>
      )}

      {/* Comparison Charts */}
      {!comparisonLoading && !comparisonError && Object.keys(comparisonData).length > 0 && (
        <div style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '12px', 
          padding: '2rem', 
          marginTop: '2rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb'
        }}>

          {/* Group KPIs by category and render with section headers */}
          {(() => {
            // Helper function to check if KPI has missing data
            const checkKPIMissingData = (kpiId) => {
              const kpiConfig = NR_KPI_OPTIONS.find(k => k.id === kpiId);
              if (!kpiConfig) return null;

              const chartData = comparisonData[kpiId];
              if (!chartData) return { week1: true, week2: true };

              // Check if data exists for both weeks and both bands
              let week1Missing = false;
              let week2Missing = false;

              if (kpiConfig.id.startsWith('top_sites')) {
                // TOP Sites use different data structure
                const sitesData = chartData['sites'];
                if (!sitesData || sitesData.length === 0) {
                  week1Missing = true;
                  week2Missing = true;
                } else {
                  week1Missing = sitesData.every(item => !item[week1Label] || item[week1Label] === 0);
                  week2Missing = sitesData.every(item => !item[week2Label] || item[week2Label] === 0);
                }
              } else {
                // Regular KPIs check both frequency bands
                const data900 = chartData['900MHz'] || [];
                const data3500 = chartData['3500MHz'] || [];
                
                week1Missing = (data900.length === 0 && data3500.length === 0) || 
                  (data900.every(item => item[week1Label] === null || item[week1Label] === undefined) &&
                   data3500.every(item => item[week1Label] === null || item[week1Label] === undefined));
                   
                week2Missing = (data900.length === 0 && data3500.length === 0) || 
                  (data900.every(item => item[week2Label] === null || item[week2Label] === undefined) &&
                   data3500.every(item => item[week2Label] === null || item[week2Label] === undefined));
              }

              if (week1Missing || week2Missing) {
                return { week1: week1Missing, week2: week2Missing, name: kpiConfig.name };
              }
              return null;
            };
            // Sort selectedKPIs by their order in NR_KPI_OPTIONS
            const sortedKPIs = [...selectedKPIs].sort((a, b) => {
              const indexA = NR_KPI_OPTIONS.findIndex(k => k.id === a);
              const indexB = NR_KPI_OPTIONS.findIndex(k => k.id === b);
              return indexA - indexB;
            });

            // Group by category
            const kpisByCategory = {};
            sortedKPIs.forEach(kpiId => {
              const kpiConfig = NR_KPI_OPTIONS.find(k => k.id === kpiId);
              if (kpiConfig) {
                if (!kpisByCategory[kpiConfig.category]) {
                  kpisByCategory[kpiConfig.category] = [];
                }
                kpisByCategory[kpiConfig.category].push(kpiId);
              }
            });

            // Define section order and titles
            const sectionOrder = [
              { category: '5G NR Accessibility & Mobility KPIs', title: "5G NR Accessibility & Mobility KPI's", subtitle: 'Cell availability, EN-DC setup and PSCell change success rates by frequency band' },
              { category: 'Traffic & Integrity', title: 'Traffic & Integrity', subtitle: 'Throughput, utilization and traffic volume metrics by frequency band' },
              { category: 'TOP Sites', title: 'TOP Sites', subtitle: 'Top sites traffic comparison by frequency band' }
            ];

            return sectionOrder.map(section => {
              const categoryKPIs = kpisByCategory[section.category];
              if (!categoryKPIs || categoryKPIs.length === 0) return null;

              // Check for missing data in this section
              const sectionMissingKPIs = [];
              categoryKPIs.forEach(kpiId => {
                const missingInfo = checkKPIMissingData(kpiId);
                if (missingInfo) {
                  sectionMissingKPIs.push({ kpiId, ...missingInfo });
                }
              });

              // Filter out KPIs with missing data
              const validKPIs = categoryKPIs.filter(kpiId => !checkKPIMissingData(kpiId));

              // Don't show section if no valid KPIs
              if (validKPIs.length === 0 && sectionMissingKPIs.length === 0) return null;

              return (
                <div key={section.category}>
                  {/* Section Header */}
                  <div className="content-header" style={{ marginTop: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', color: '#1f2937', marginBottom: '0.25rem' }}>
                      {section.title}
                    </h3>
                    <p className="content-subtitle" style={{ fontSize: '0.8rem', marginBottom: sectionMissingKPIs.length > 0 ? '0.75rem' : '0' }}>
                      {section.subtitle}
                    </p>

                    {/* Section-specific Missing Data Warnings */}
                    {sectionMissingKPIs.length > 0 && (
                      <div style={{
                        backgroundColor: '#fef3c7',
                        border: '1px solid #f59e0b',
                        borderRadius: '6px',
                        padding: '0.75rem',
                        marginTop: '0.75rem'
                      }}>
                        <div style={{ fontSize: '0.875rem', color: '#78350f' }}>
                          {sectionMissingKPIs.map((item, idx) => {
                            const weeks = [];
                            if (item.week1) weeks.push(week1Label);
                            if (item.week2) weeks.push(week2Label);
                            const weeksText = weeks.join(' and ');
                            const suggestion = item.week1 && item.week2 ? 'different weeks' : 'a different week';
                            return (
                              <div key={idx} style={{ marginBottom: idx < sectionMissingKPIs.length - 1 ? '0.5rem' : '0' }}>
                                ⚠️ There is missing data for KPI <strong>{item.name}</strong> ({weeksText}). Choose {suggestion} to compare.
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* KPIs in this section (only valid ones) */}
                  {/* Use grid layout for TOP Sites section */}
                  <div style={section.category === 'TOP Sites' ? { 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '1.5rem',
                    marginTop: '1.5rem'
                  } : {}}>
                  {validKPIs.map(kpiId => {
            const kpiConfig = NR_KPI_OPTIONS.find(k => k.id === kpiId);
            const chartData = comparisonData[kpiId];
            
            if (!chartData || !kpiConfig) return null;

            // Helper function to calculate yAxisDomain based on KPI type
            const getYAxisDomain = (data, freqBand) => {
              // Random Access Success Rate - use [40, 100] domain
              if (kpiConfig.id === 'random_access_success_rate_pct') {
                return [40, 100];
              }
              
              // For Partial Cell Availability and UE Context Setup - use [90, 100] domain
              if (kpiConfig.id === 'partial_cell_availability_pct' || 
                  kpiConfig.id === 'ue_context_setup_success_rate_pct') {
                return [90, 100];
              }
              
              // SCG Retainability KPIs - use [0, 8] domain
              if (kpiConfig.id === 'scg_retainability_overall' || 
                  kpiConfig.id === 'scg_retainability_active' ||
                  kpiConfig.id === 'scg_retainability_endc_connectivity') {
                return [0, 8];
              }
              
              // RRC Connected Users - use [0, 12000] domain
              if (kpiConfig.id === 'avg_rrc_connected_users' || 
                  kpiConfig.id === 'peak_rrc_connected_users') {
                return [0, 12000];
              }
              
              // Average DL MAC DRB Throughput - use [0, 60000] domain
              if (kpiConfig.id === 'avg_dl_mac_drb_throughput_mbps') {
                return [0, 60000];
              }
              
              // Normalized Average DL MAC Cell Throughput Considering Traffic - use [0, 16000] domain
              if (kpiConfig.id === 'normalized_avg_dl_mac_cell_throughput_traffic_mbps') {
                return [0, 16000];
              }
              
              // 5G User Data Traffic Volume on Downlink - use [0, 800] domain
              if (kpiConfig.id === 'user_data_traffic_volume_dl_gb') {
                return [0, 800];
              }
              
              // 5G User Data Traffic Volume on Uplink - use [0, 80] domain
              if (kpiConfig.id === 'user_data_traffic_volume_ul_gb') {
                return [0, 80];
              }
              
              // Share of 5G Traffic Volume - use [0, 16000] domain
              if (kpiConfig.id === 'share_5g_traffic_volume') {
                return [0, 16000];
              }
              
              // For EN-DC Setup Success Rate - use floor(min) - 1 to 100
              if (kpiConfig.id === 'endc_setup_success_rate') {
                if (!data || data.length === 0) return [0, 100];
                
                let minVal = Infinity;
                data.forEach(item => {
                  const val1 = item[week1Label];
                  const val2 = item[week2Label];
                  if (val1 !== null && val1 !== undefined && !isNaN(val1)) {
                    minVal = Math.min(minVal, val1);
                  }
                  if (val2 !== null && val2 !== undefined && !isNaN(val2)) {
                    minVal = Math.min(minVal, val2);
                  }
                });
                
                if (minVal === Infinity) return [0, 100];
                
                const minTick = Math.floor(minVal) - 1;
                return [minTick, 100];
              }
              
              // For EN-DC Inter-sgNodeB PSCell Change Success Rate
              if (kpiConfig.id === 'endc_inter_pscell_change_success_rate') {
                if (!data || data.length === 0) return [0, 100];
                
                let minVal = Infinity;
                data.forEach(item => {
                  const val1 = item[week1Label];
                  const val2 = item[week2Label];
                  if (val1 !== null && val1 !== undefined && !isNaN(val1)) {
                    minVal = Math.min(minVal, val1);
                  }
                  if (val2 !== null && val2 !== undefined && !isNaN(val2)) {
                    minVal = Math.min(minVal, val2);
                  }
                });
                
                if (minVal === Infinity) return [0, 100];
                
                // Round down to nearest 10
                const roundedMin = Math.floor(minVal / 10) * 10;
                return [roundedMin, 100];
              }
              
              // For percentage KPIs (utilization, unrestricted volume) - use [0, 100]
              if (kpiConfig.id === 'pdsch_slot_utilization_pct' || 
                  kpiConfig.id === 'dl_rbsym_utilization_pct' ||
                  kpiConfig.id === 'percentage_unrestricted_volume_dl_pct' ||
                  kpiConfig.id === 'pusch_slot_utilization_pct' ||
                  kpiConfig.id === 'ul_rbsym_utilization_pct' ||
                  kpiConfig.id === 'percentage_unrestricted_volume_ul_pct') {
                return [0, 100];
              }
              
              // Helper to calculate nice rounded max (similar to NRReports.js)
              const calculateNiceMax = (maxVal) => {
                if (maxVal === 0) return 100;
                const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
                const normalized = maxVal / magnitude;
                let niceMax;
                if (normalized <= 1) niceMax = magnitude;
                else if (normalized <= 1.5) niceMax = 1.5 * magnitude;
                else if (normalized <= 2) niceMax = 2 * magnitude;
                else if (normalized <= 2.5) niceMax = 2.5 * magnitude;
                else if (normalized <= 3) niceMax = 3 * magnitude;
                else if (normalized <= 4) niceMax = 4 * magnitude;
                else if (normalized <= 5) niceMax = 5 * magnitude;
                else if (normalized <= 5.5) niceMax = 5.5 * magnitude;
                else if (normalized <= 6) niceMax = 6 * magnitude;
                else if (normalized <= 7) niceMax = 7 * magnitude;
                else if (normalized <= 8) niceMax = 8 * magnitude;
                else niceMax = 10 * magnitude;
                return niceMax;
              };

              // For other throughput KPIs - calculate from 0 to nice max
              if (kpiConfig.id === 'normalized_dl_mac_cell_throughput_actual_pdsch_mbps' ||
                  kpiConfig.id === 'avg_ul_mac_ue_throughput_mbps' ||
                  kpiConfig.id === 'normalized_avg_ul_mac_cell_throughput_successful_pusch_mbps' ||
                  kpiConfig.id === 'normalized_avg_ul_mac_cell_throughput_actual_pusch_mbps') {
                if (!data || data.length === 0) return [0, 100];
                
                let maxVal = -Infinity;
                data.forEach(item => {
                  const val1 = item[week1Label];
                  const val2 = item[week2Label];
                  if (val1 !== null && val1 !== undefined && !isNaN(val1)) {
                    maxVal = Math.max(maxVal, val1);
                  }
                  if (val2 !== null && val2 !== undefined && !isNaN(val2)) {
                    maxVal = Math.max(maxVal, val2);
                  }
                });
                
                if (maxVal === -Infinity) return [0, 100];
                
                // Use nice rounded max calculation
                const niceMax = calculateNiceMax(maxVal);
                return [0, niceMax];
              }
              
              return undefined;
            };

            // Helper function to calculate yAxisTicks based on KPI type
            const getYAxisTicks = (data, freqBand) => {
              // Random Access Success Rate - use [40, 60, 80, 100] ticks
              if (kpiConfig.id === 'random_access_success_rate_pct') {
                return [40, 60, 80, 100];
              }
              
              // For Partial Cell Availability and UE Context Setup - use [90, 95, 100] ticks
              if (kpiConfig.id === 'partial_cell_availability_pct' || 
                  kpiConfig.id === 'ue_context_setup_success_rate_pct') {
                return [90, 95, 100];
              }
              
              // SCG Retainability KPIs - use [0, 2, 4, 6, 8] ticks
              if (kpiConfig.id === 'scg_retainability_overall' || 
                  kpiConfig.id === 'scg_retainability_active' ||
                  kpiConfig.id === 'scg_retainability_endc_connectivity') {
                return [0, 2, 4, 6, 8];
              }
              
              // RRC Connected Users - use [0, 3000, 6000, 9000, 12000] ticks
              if (kpiConfig.id === 'avg_rrc_connected_users' || 
                  kpiConfig.id === 'peak_rrc_connected_users') {
                return [0, 3000, 6000, 9000, 12000];
              }
              
              // Average DL MAC DRB Throughput - use [0, 20000, 40000, 60000] ticks
              if (kpiConfig.id === 'avg_dl_mac_drb_throughput_mbps') {
                return [0, 20000, 40000, 60000];
              }
              
              // Normalized Average DL MAC Cell Throughput Considering Traffic - use [0, 4000, 8000, 12000, 16000] ticks
              if (kpiConfig.id === 'normalized_avg_dl_mac_cell_throughput_traffic_mbps') {
                return [0, 4000, 8000, 12000, 16000];
              }
              
              // 5G User Data Traffic Volume on Downlink - use [0, 200, 400, 600, 800] ticks
              if (kpiConfig.id === 'user_data_traffic_volume_dl_gb') {
                return [0, 200, 400, 600, 800];
              }
              
              // 5G User Data Traffic Volume on Uplink - use [0, 20, 40, 60, 80] ticks
              if (kpiConfig.id === 'user_data_traffic_volume_ul_gb') {
                return [0, 20, 40, 60, 80];
              }
              
              // Share of 5G Traffic Volume - use [0, 4000, 8000, 12000, 16000] ticks
              if (kpiConfig.id === 'share_5g_traffic_volume') {
                return [0, 4000, 8000, 12000, 16000];
              }
              
              // For EN-DC Setup Success Rate - 3 ticks: min, middle, max
              if (kpiConfig.id === 'endc_setup_success_rate') {
                if (!data || data.length === 0) return undefined;
                
                let minVal = Infinity;
                data.forEach(item => {
                  const val1 = item[week1Label];
                  const val2 = item[week2Label];
                  if (val1 !== null && val1 !== undefined && !isNaN(val1)) {
                    minVal = Math.min(minVal, val1);
                  }
                  if (val2 !== null && val2 !== undefined && !isNaN(val2)) {
                    minVal = Math.min(minVal, val2);
                  }
                });
                
                if (minVal === Infinity) return undefined;
                
                const minTick = Math.floor(minVal) - 1;
                const maxTick = 100;
                const middleTick = (minTick + maxTick) / 2;
                
                return [
                  parseFloat(minTick.toFixed(1)),
                  parseFloat(middleTick.toFixed(1)),
                  parseFloat(maxTick.toFixed(1))
                ];
              }
              
              // For EN-DC Inter-sgNodeB PSCell Change Success Rate
              if (kpiConfig.id === 'endc_inter_pscell_change_success_rate') {
                if (!data || data.length === 0) return undefined;
                
                let minVal = Infinity;
                data.forEach(item => {
                  const val1 = item[week1Label];
                  const val2 = item[week2Label];
                  if (val1 !== null && val1 !== undefined && !isNaN(val1)) {
                    minVal = Math.min(minVal, val1);
                  }
                  if (val2 !== null && val2 !== undefined && !isNaN(val2)) {
                    minVal = Math.min(minVal, val2);
                  }
                });
                
                if (minVal === Infinity) return undefined;
                
                // Round down to nearest 10
                const roundedMin = Math.floor(minVal / 10) * 10;
                const maxTick = 100;
                const middleTick = (roundedMin + maxTick) / 2;
                
                return [
                  Number(roundedMin.toFixed(1)),
                  Number(middleTick.toFixed(1)),
                  Number(maxTick.toFixed(1))
                ];
              }
              
              // For percentage KPIs (utilization, unrestricted volume) - use [0, 50, 100] ticks
              if (kpiConfig.id === 'pdsch_slot_utilization_pct' || 
                  kpiConfig.id === 'dl_rbsym_utilization_pct' ||
                  kpiConfig.id === 'percentage_unrestricted_volume_dl_pct' ||
                  kpiConfig.id === 'pusch_slot_utilization_pct' ||
                  kpiConfig.id === 'ul_rbsym_utilization_pct' ||
                  kpiConfig.id === 'percentage_unrestricted_volume_ul_pct') {
                return [0, 50, 100];
              }
              
              // Helper to calculate nice rounded max for ticks (same as in getYAxisDomain)
              const calculateNiceMaxForTicks = (maxVal) => {
                if (maxVal === 0) return 100;
                const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
                const normalized = maxVal / magnitude;
                let niceMax;
                if (normalized <= 1) niceMax = magnitude;
                else if (normalized <= 1.5) niceMax = 1.5 * magnitude;
                else if (normalized <= 2) niceMax = 2 * magnitude;
                else if (normalized <= 2.5) niceMax = 2.5 * magnitude;
                else if (normalized <= 3) niceMax = 3 * magnitude;
                else if (normalized <= 4) niceMax = 4 * magnitude;
                else if (normalized <= 5) niceMax = 5 * magnitude;
                else if (normalized <= 5.5) niceMax = 5.5 * magnitude;
                else if (normalized <= 6) niceMax = 6 * magnitude;
                else if (normalized <= 7) niceMax = 7 * magnitude;
                else if (normalized <= 8) niceMax = 8 * magnitude;
                else niceMax = 10 * magnitude;
                return niceMax;
              };

              // For other throughput KPIs - calculate ticks from 0 to nice max
              if (kpiConfig.id === 'normalized_dl_mac_cell_throughput_actual_pdsch_mbps' ||
                  kpiConfig.id === 'avg_ul_mac_ue_throughput_mbps' ||
                  kpiConfig.id === 'normalized_avg_ul_mac_cell_throughput_successful_pusch_mbps' ||
                  kpiConfig.id === 'normalized_avg_ul_mac_cell_throughput_actual_pusch_mbps') {
                if (!data || data.length === 0) return undefined;
                
                let maxVal = -Infinity;
                data.forEach(item => {
                  const val1 = item[week1Label];
                  const val2 = item[week2Label];
                  if (val1 !== null && val1 !== undefined && !isNaN(val1)) {
                    maxVal = Math.max(maxVal, val1);
                  }
                  if (val2 !== null && val2 !== undefined && !isNaN(val2)) {
                    maxVal = Math.max(maxVal, val2);
                  }
                });
                
                if (maxVal === -Infinity) return undefined;
                
                // Use nice rounded max calculation
                const niceMax = calculateNiceMaxForTicks(maxVal);
                const middleTick = niceMax / 2;
                
                return [0, middleTick, niceMax];
              }
              
              return undefined;
            };

            // Render TOP Sites KPIs inline with section
            if (kpiId === 'top_sites_total' || kpiId === 'top_sites_tdd' || kpiId === 'top_sites_fdd') {
              const sitesData = chartData['sites'];
              if (!sitesData || sitesData.length === 0) return null;
              
              const chartTitle = kpiId === 'top_sites_total' ? 'All Bands' :
                                 kpiId === 'top_sites_tdd' ? 'TDD (3500MHz)' :
                                 'FDD (900MHz)';
              
              return (
                <ChartCard 
                  key={kpiId}
                  title={chartTitle}
                >
                  <div>
                    <div style={{ 
                      marginBottom: '0.5rem', 
                      fontSize: '0.8rem', 
                      color: '#6b7280' 
                    }}>
                      <span style={{ color: '#6b21a8', fontWeight: 600 }}>{week1Label}</span>
                      {' and '}
                      <span style={{ color: '#be185d', fontWeight: 600 }}>{week2Label}</span>
                      {' Comparison'}
                    </div>
                    {sitesData.map((site, index) => {
                      const maxTraffic = Math.max(...sitesData.map(s => Math.max(s[week1Label] || 0, s[week2Label] || 0)));
                      const week1Value = site[week1Label] || 0;
                      const week2Value = site[week2Label] || 0;
                      const week1Percentage = (week1Value / maxTraffic) * 100;
                      const week2Percentage = (week2Value / maxTraffic) * 100;
                      
                      return (
                        <div key={index} style={{ marginBottom: '0.65rem' }}>
                          <div style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 600, 
                            color: '#374151',
                            marginBottom: '0.25rem'
                          }}>
                            {site.site_name}
                          </div>
                          
                          {/* Week 1 Bar */}
                          <div style={{ 
                            height: '18px',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '3px',
                            overflow: 'hidden',
                            position: 'relative',
                            marginBottom: '0.15rem'
                          }}>
                            <div
                              style={{
                                width: `${week1Percentage}%`,
                                height: '100%',
                                backgroundColor: '#6b21a8',
                                transition: 'width 0.3s ease',
                                minWidth: week1Value > 0 ? '2px' : '0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                padding: '0 4px'
                              }}
                            >
                              {week1Percentage > 15 ? `${week1Value.toFixed(1)} GB` : ''}
                            </div>
                          </div>
                          
                          {/* Week 2 Bar */}
                          <div style={{ 
                            height: '18px',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '3px',
                            overflow: 'hidden',
                            position: 'relative'
                          }}>
                            <div
                              style={{
                                width: `${week2Percentage}%`,
                                height: '100%',
                                backgroundColor: '#be185d',
                                transition: 'width 0.3s ease',
                                minWidth: week2Value > 0 ? '2px' : '0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                padding: '0 4px'
                              }}
                            >
                              {week2Percentage > 15 ? `${week2Value.toFixed(1)} GB` : ''}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ChartCard>
              );
            }

            // Special handling for EN-DC LTE Traffic (single chart, no frequency bands)
            if (kpiId === 'endc_lte_traffic') {
              const allData = chartData['all'];
              if (!allData || allData.length === 0) return null;

              // Calculate nice Y-axis domain for EN-DC traffic
              const calculateEndcYAxis = () => {
                let maxVal = 0;
                allData.forEach(item => {
                  const val1 = item[week1Label];
                  const val2 = item[week2Label];
                  if (val1 !== null && val1 !== undefined && !isNaN(val1)) {
                    maxVal = Math.max(maxVal, val1);
                  }
                  if (val2 !== null && val2 !== undefined && !isNaN(val2)) {
                    maxVal = Math.max(maxVal, val2);
                  }
                });
                
                if (maxVal === 0) return { domain: [0, 100], ticks: [0, 25, 50, 75, 100] };
                
                // Calculate nice rounded max
                const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
                const normalized = maxVal / magnitude;
                let niceMax;
                if (normalized <= 1) niceMax = magnitude;
                else if (normalized <= 1.5) niceMax = 1.5 * magnitude;
                else if (normalized <= 2) niceMax = 2 * magnitude;
                else if (normalized <= 2.5) niceMax = 2.5 * magnitude;
                else if (normalized <= 3) niceMax = 3 * magnitude;
                else if (normalized <= 4) niceMax = 4 * magnitude;
                else if (normalized <= 5) niceMax = 5 * magnitude;
                else if (normalized <= 6) niceMax = 6 * magnitude;
                else if (normalized <= 8) niceMax = 8 * magnitude;
                else niceMax = 10 * magnitude;
                
                // Create 5 evenly spaced ticks
                const step = niceMax / 4;
                const ticks = [0, step, step * 2, step * 3, niceMax];
                
                return { domain: [0, niceMax], ticks };
              };

              const endcYAxis = calculateEndcYAxis();

              return (
                <div key={kpiId} style={{ marginTop: '2rem' }}>
                  <h4 style={{ 
                    fontSize: '1.1rem', 
                    color: '#374151', 
                    marginBottom: '1rem',
                    fontWeight: 600
                  }}>
                    {kpiConfig.label}
                  </h4>
                  
                  {/* Single chart for EN-DC traffic */}
                  <div 
                    style={{
                      backgroundColor: '#faf5ff',
                      borderRadius: '8px',
                      padding: '1rem',
                      border: '1px solid #e9d5ff',
                      cursor: 'pointer',
                      transition: 'box-shadow 0.2s ease',
                      maxWidth: '50%'
                    }}
                    onClick={() => handleChartClick({
                      title: kpiConfig.label,
                      data: allData,
                      yAxisLabel: kpiConfig.yAxisLabel,
                      week1Label: week1Label,
                      week2Label: week2Label,
                      week1Color: '#6b21a8',
                      week2Color: '#be185d',
                      yAxisDomain: endcYAxis.domain,
                      yAxisTicks: endcYAxis.ticks
                    })}
                  >
                    <h5 style={{ 
                      fontSize: '0.95rem', 
                      color: '#6b21a8', 
                      marginBottom: '0.75rem',
                      fontWeight: 600,
                      textAlign: 'center'
                    }}>
                      📊 EN-DC LTE Traffic
                    </h5>
                    <ComparisonLineChart
                      data={allData}
                      week1Label={week1Label}
                      week2Label={week2Label}
                      yAxisLabel={kpiConfig.yAxisLabel}
                      week1Color="#6b21a8"
                      week2Color="#be185d"
                      yAxisDomain={endcYAxis.domain}
                      yAxisTicks={endcYAxis.ticks}
                    />
                  </div>
                </div>
              );
            }

            return (
              <div key={kpiId} style={{ marginTop: '2rem' }}>
                <h4 style={{ 
                  fontSize: '1.1rem', 
                  color: '#374151', 
                  marginBottom: '1rem',
                  fontWeight: 600
                }}>
                  {kpiConfig.label}
                </h4>
                
                {/* Two charts side by side */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '1.5rem'
                }}>
                  {/* 900MHz Chart */}
                  <div 
                    style={{
                      backgroundColor: '#faf5ff',
                      borderRadius: '8px',
                      padding: '1rem',
                      border: '1px solid #e9d5ff',
                      cursor: 'pointer',
                      transition: 'box-shadow 0.2s ease'
                    }}
                    onClick={() => handleChartClick({
                      title: `${kpiConfig.label} - 900MHz Band`,
                      data: chartData['900MHz'],
                      yAxisLabel: kpiConfig.yAxisLabel,
                      week1Label: week1Label,
                      week2Label: week2Label,
                      week1Color: colors['900MHz'].week1,
                      week2Color: colors['900MHz'].week2,
                      yAxisDomain: getYAxisDomain(chartData['900MHz'], '900MHz'),
                      yAxisTicks: getYAxisTicks(chartData['900MHz'], '900MHz')
                    })}
                  >
                    <h5 style={{ 
                      fontSize: '0.95rem', 
                      color: '#6b21a8', 
                      marginBottom: '0.75rem',
                      fontWeight: 600,
                      textAlign: 'center'
                    }}>
                      📡 900MHz Band
                    </h5>
                    <ComparisonLineChart
                      data={chartData['900MHz']}
                      week1Label={week1Label}
                      week2Label={week2Label}
                      yAxisLabel={kpiConfig.yAxisLabel}
                      week1Color={colors['900MHz'].week1}
                      week2Color={colors['900MHz'].week2}
                      yAxisDomain={getYAxisDomain(chartData['900MHz'], '900MHz')}
                      yAxisTicks={getYAxisTicks(chartData['900MHz'], '900MHz')}
                    />
                  </div>

                  {/* 3500MHz Chart */}
                  <div 
                    style={{
                      backgroundColor: '#fdf2f8',
                      borderRadius: '8px',
                      padding: '1rem',
                      border: '1px solid #fbcfe8',
                      cursor: 'pointer',
                      transition: 'box-shadow 0.2s ease'
                    }}
                    onClick={() => handleChartClick({
                      title: `${kpiConfig.label} - 3500MHz Band`,
                      data: chartData['3500MHz'],
                      yAxisLabel: kpiConfig.yAxisLabel,
                      week1Label: week1Label,
                      week2Label: week2Label,
                      week1Color: colors['3500MHz'].week1,
                      week2Color: colors['3500MHz'].week2,
                      yAxisDomain: getYAxisDomain(chartData['3500MHz'], '3500MHz'),
                      yAxisTicks: getYAxisTicks(chartData['3500MHz'], '3500MHz')
                    })}
                  >
                    <h5 style={{ 
                      fontSize: '0.95rem', 
                      color: '#be185d', 
                      marginBottom: '0.75rem',
                      fontWeight: 600,
                      textAlign: 'center'
                    }}>
                      📡 3500MHz Band
                    </h5>
                    <ComparisonLineChart
                      data={chartData['3500MHz']}
                      week1Label={week1Label}
                      week2Label={week2Label}
                      yAxisLabel={kpiConfig.yAxisLabel}
                      week1Color={colors['3500MHz'].week1}
                      week2Color={colors['3500MHz'].week2}
                      yAxisDomain={getYAxisDomain(chartData['3500MHz'], '3500MHz')}
                      yAxisTicks={getYAxisTicks(chartData['3500MHz'], '3500MHz')}
                    />
                  </div>
                </div>
              </div>
            );
          })}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* No KPIs selected message */}
      {!comparisonLoading && selectedKPIs.length === 0 && (
        <div className="no-data-message">
          <p>Zgjidhni KPI-të nga lista më lart për të parë krahasimin e javëve.</p>
        </div>
      )}

      {/* Chart Modal for enlarged view */}
      {selectedChart && (
        <ChartModal
          isOpen={true}
          onClose={handleCloseModal}
          title={selectedChart.title}
          badge="Weekly Comparison"
          data={selectedChart.data}
          dataKeys={[selectedChart.week1Label, selectedChart.week2Label]}
          yAxisLabel={selectedChart.yAxisLabel}
          chartType="comparison"
          week1Label={selectedChart.week1Label}
          week2Label={selectedChart.week2Label}
          colors={[selectedChart.week1Color, selectedChart.week2Color]}
          yAxisDomain={selectedChart.yAxisDomain}
          yAxisTicks={selectedChart.yAxisTicks}
        />
      )}
    </div>
  );
};

export default NRReportsComparison;
