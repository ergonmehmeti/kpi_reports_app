import React, { useState, useEffect, useCallback } from 'react';
import ComparisonLineChart from '../components/charts/ComparisonLineChart';
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
  // 900MHz: Purple shades (darker for week1, lighter for week2)
  // 3500MHz: Pink shades (darker for week1, lighter for week2)
  const colors = {
    '900MHz': {
      week1: '#6b21a8', // Dark purple
      week2: '#a855f7'  // Light purple
    },
    '3500MHz': {
      week1: '#be185d', // Dark pink
      week2: '#f472b6'  // Light pink
    }
  };

  return (
    <div>
      {/* Week Selectors */}
      <div className="date-range-picker comparison-mode">
        <div className="comparison-selectors">
          <div className="date-input-group">
            <label htmlFor="week1-select">
              <span className="week-indicator week1-indicator">●</span> Week 1:
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
              <span className="week-indicator week2-indicator">●</span> Week 2:
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
          <div className="content-header" style={{ marginTop: '0' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '0.5rem' }}>
              5G NR KPI's Weekly Comparison
            </h3>
            <p className="content-subtitle" style={{ fontSize: '0.875rem' }}>
              Comparing <span style={{color: colors['900MHz'].week1, fontWeight: 600}}>{week1Label}</span> vs <span style={{color: colors['900MHz'].week2, fontWeight: 600}}>{week2Label}</span>
            </p>
          </div>

          {selectedKPIs.map(kpiId => {
            const kpiConfig = NR_KPI_OPTIONS.find(k => k.id === kpiId);
            const chartData = comparisonData[kpiId];
            
            if (!chartData || !kpiConfig) return null;

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
                  <div style={{
                    backgroundColor: '#faf5ff',
                    borderRadius: '8px',
                    padding: '1rem',
                    border: '1px solid #e9d5ff'
                  }}>
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
                    />
                  </div>

                  {/* 3500MHz Chart */}
                  <div style={{
                    backgroundColor: '#fdf2f8',
                    borderRadius: '8px',
                    padding: '1rem',
                    border: '1px solid #fbcfe8'
                  }}>
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
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No KPIs selected message */}
      {!comparisonLoading && selectedKPIs.length === 0 && (
        <div className="no-data-message">
          <p>Zgjidhni KPI-të nga lista më lart për të parë krahasimin e javëve.</p>
        </div>
      )}
    </div>
  );
};

export default NRReportsComparison;
