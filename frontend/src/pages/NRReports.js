import React, { useState, useEffect, useCallback } from 'react';
import DateFilters from '../components/filters/DateFilters';
import ChartCard from '../components/charts/ChartCard';
import KPILineChart from '../components/charts/KPILineChart';
import NRReportsComparison from './NRReportsComparison';
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
  
  // Comparison mode state
  const [comparisonMode, setComparisonMode] = useState(false);

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

  // Handle toggle comparison mode
  const handleToggleComparison = useCallback(() => {
    const newComparisonMode = !comparisonMode;
    setComparisonMode(newComparisonMode);
    if (newComparisonMode) {
      setShowWeekSelector(true);
    }
  }, [comparisonMode]);

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

  // Prepare EN-DC Inter-sgNodeB PSCell Change Success Rate chart data (hourly)
  const prepareInterPsCellChangeData = () => {
    if (!kpiData || kpiData.length === 0) {
      return [];
    }

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
      
      if (item.endc_inter_pscell_change_success_rate !== null && item.endc_inter_pscell_change_success_rate !== undefined) {
        if (item.freq_band === '900MHz') {
          dataByHour[key]['900MHz'] = parseFloat(item.endc_inter_pscell_change_success_rate);
        } else if (item.freq_band === '3500MHz') {
          dataByHour[key]['3500MHz'] = parseFloat(item.endc_inter_pscell_change_success_rate);
        }
      }
    });

    // Sort by timestamp
    const result = Object.values(dataByHour).sort((a, b) => a.timestamp - b.timestamp);

    return result;
  };

  // Prepare SCG Retainability EN-DC Connectivity chart data (hourly)
  const prepareScgRetainabilityEndcData = () => {
    if (!kpiData || kpiData.length === 0) {
      return [];
    }

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
      
      if (item.scg_retainability_endc_connectivity !== null && item.scg_retainability_endc_connectivity !== undefined) {
        if (item.freq_band === '900MHz') {
          dataByHour[key]['900MHz'] = parseFloat(item.scg_retainability_endc_connectivity);
        } else if (item.freq_band === '3500MHz') {
          dataByHour[key]['3500MHz'] = parseFloat(item.scg_retainability_endc_connectivity);
        }
      }
    });

    return Object.values(dataByHour).sort((a, b) => a.timestamp - b.timestamp);
  };

  // Prepare SCG Active Radio Resource Retainability chart data (hourly)
  const prepareScgRetainabilityActiveData = () => {
    if (!kpiData || kpiData.length === 0) {
      return [];
    }

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
      
      if (item.scg_retainability_active !== null && item.scg_retainability_active !== undefined) {
        if (item.freq_band === '900MHz') {
          dataByHour[key]['900MHz'] = parseFloat(item.scg_retainability_active);
        } else if (item.freq_band === '3500MHz') {
          dataByHour[key]['3500MHz'] = parseFloat(item.scg_retainability_active);
        }
      }
    });

    return Object.values(dataByHour).sort((a, b) => a.timestamp - b.timestamp);
  };

  // Prepare SCG Radio Resource Retainability Overall chart data (hourly)
  const prepareScgRetainabilityOverallData = () => {
    if (!kpiData || kpiData.length === 0) {
      return [];
    }

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
      
      if (item.scg_retainability_overall !== null && item.scg_retainability_overall !== undefined) {
        if (item.freq_band === '900MHz') {
          dataByHour[key]['900MHz'] = parseFloat(item.scg_retainability_overall);
        } else if (item.freq_band === '3500MHz') {
          dataByHour[key]['3500MHz'] = parseFloat(item.scg_retainability_overall);
        }
      }
    });

    return Object.values(dataByHour).sort((a, b) => a.timestamp - b.timestamp);
  };

  // Prepare Peak RRC Connected Users chart data (hourly)
  const preparePeakRrcConnectedUsersData = () => {
    if (!kpiData || kpiData.length === 0) {
      return [];
    }

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
      
      if (item.peak_rrc_connected_users !== null && item.peak_rrc_connected_users !== undefined) {
        if (item.freq_band === '900MHz') {
          dataByHour[key]['900MHz'] = parseFloat(item.peak_rrc_connected_users);
        } else if (item.freq_band === '3500MHz') {
          dataByHour[key]['3500MHz'] = parseFloat(item.peak_rrc_connected_users);
        }
      }
    });

    return Object.values(dataByHour).sort((a, b) => a.timestamp - b.timestamp);
  };

  // Prepare Average RRC Connected Users chart data (hourly)
  const prepareAvgRrcConnectedUsersData = () => {
    if (!kpiData || kpiData.length === 0) {
      return [];
    }

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
      
      if (item.avg_rrc_connected_users !== null && item.avg_rrc_connected_users !== undefined) {
        if (item.freq_band === '900MHz') {
          dataByHour[key]['900MHz'] = parseFloat(item.avg_rrc_connected_users);
        } else if (item.freq_band === '3500MHz') {
          dataByHour[key]['3500MHz'] = parseFloat(item.avg_rrc_connected_users);
        }
      }
    });

    return Object.values(dataByHour).sort((a, b) => a.timestamp - b.timestamp);
  };

  const setupSuccessRateData = prepareSetupSuccessRateData();
  const interPsCellChangeData = prepareInterPsCellChangeData();
  const scgRetainabilityEndcData = prepareScgRetainabilityEndcData();
  const scgRetainabilityActiveData = prepareScgRetainabilityActiveData();
  const scgRetainabilityOverallData = prepareScgRetainabilityOverallData();
  const peakRrcConnectedUsersData = preparePeakRrcConnectedUsersData();
  const avgRrcConnectedUsersData = prepareAvgRrcConnectedUsersData();

  // If comparison mode is active, render NRReportsComparison instead
  if (comparisonMode) {
    return (
      <div className="reports-page">
        <div className="content-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2>NR (5G) Network Reports - Week Comparison</h2>
              <p className="content-subtitle">Compare 5G NR KPIs between two weeks by frequency band</p>
            </div>
            <button 
              onClick={handleToggleComparison}
              className="toggle-mode-btn comparison-active"
              style={{ marginLeft: 'auto' }}
            >
              ← Exit Compare
            </button>
          </div>
        </div>
        <NRReportsComparison />
      </div>
    );
  }

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
        onToggleMode={() => setShowWeekSelector(!showWeekSelector)}
        onToggleComparison={handleToggleComparison}
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
              5G NR Accessibility & Mobility KPI's
            </h3>
            <p className="content-subtitle" style={{ fontSize: '0.875rem' }}>
              EN-DC setup and PSCell change success rates by frequency band
            </p>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
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

          <div style={{ marginTop: '1.5rem' }}>
            <ChartCard 
              title="EN-DC Inter-sgNodeB PSCell Change Success Rate (%)" 
              description="5G inter-gNodeB PSCell change success rate by frequency band"
            >
              <KPILineChart 
                data={interPsCellChangeData}
                dataKeys={['900MHz', '3500MHz']}
                colors={['#6b21a8', '#ec4899']}
                yAxisLabel="%"
              />
            </ChartCard>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <ChartCard 
              title="SCG Active Radio Resource Retainability considering EN-DC connectivity (%)" 
              description="SCG retainability considering EN-DC connectivity by frequency band"
            >
              <KPILineChart 
                data={scgRetainabilityEndcData}
                dataKeys={['900MHz', '3500MHz']}
                colors={['#6b21a8', '#ec4899']}
                yAxisLabel="%"
              />
            </ChartCard>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <ChartCard 
              title="SCG Active Radio Resource Retainability (%)" 
              description="SCG active radio resource retainability by frequency band"
            >
              <KPILineChart 
                data={scgRetainabilityActiveData}
                dataKeys={['900MHz', '3500MHz']}
                colors={['#6b21a8', '#ec4899']}
                yAxisLabel="%"
              />
            </ChartCard>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <ChartCard 
              title="SCG Radio Resource Retainability (%)" 
              description="Overall SCG radio resource retainability by frequency band"
            >
              <KPILineChart 
                data={scgRetainabilityOverallData}
                dataKeys={['900MHz', '3500MHz']}
                colors={['#6b21a8', '#ec4899']}
                yAxisLabel="%"
              />
            </ChartCard>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <ChartCard 
              title="Peak RRC Connected Users" 
              description="Peak number of NR EN-DC RRC connected users by frequency band"
            >
              <KPILineChart 
                data={peakRrcConnectedUsersData}
                dataKeys={['900MHz', '3500MHz']}
                colors={['#6b21a8', '#ec4899']}
                yAxisLabel="Users"
              />
            </ChartCard>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <ChartCard 
              title="Average RRC Connected Users" 
              description="Average NR EN-DC RRC connected users by frequency band"
            >
              <KPILineChart 
                data={avgRrcConnectedUsersData}
                dataKeys={['900MHz', '3500MHz']}
                colors={['#6b21a8', '#ec4899']}
                yAxisLabel="Users"
              />
            </ChartCard>
          </div>
        </div>
      )}

      {!kpiLoading && !kpiError && kpiData.length === 0 && (
        <div className="no-data-message">
          <p>No NR data available</p>
          <p>Please import NR data using the sidebar or select a different date range.</p>
        </div>
      )}
    </div>
  );
};

export default NRReports;
