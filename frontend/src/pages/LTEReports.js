import React, { useState, useEffect } from 'react';
import DateFilters from '../components/filters/DateFilters';
import ChartCard from '../components/charts/ChartCard';
import HorizontalStackedBarChart from '../components/charts/HorizontalStackedBarChart';
import FrequencyStackedAreaChart from '../components/charts/FrequencyStackedAreaChart';
import DualAxisLineChart from '../components/charts/DualAxisLineChart';
import KPILineChart from '../components/charts/KPILineChart';
import { useWeekSelector } from '../hooks/useWeekSelector';
import { useLTEData } from '../hooks/useLTEData';
import { useLTEFrequencyData } from '../hooks/useLTEFrequencyData';
import { useLTEKPIData } from '../hooks/useLTEKPIData';
import { getLTEChartConfigs } from '../utils/lteChartConfig';
import {
  prepareAvailabilityData,
  prepareAccessibilityData,
  prepareMobilityData,
  prepareRetainabilityDropRatioData,
  prepareRetainabilityDropsPerHourData
} from '../utils/lteDataFormatters';
import './GSMReports.css';

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
  
  // Local state for date range and mode
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showWeekSelector, setShowWeekSelector] = useState(true);
  const [top20Sites, setTop20Sites] = useState([]);
  const [bottom20Sites, setBottom20Sites] = useState([]);

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
    if (showWeekSelector) {
      resetToLastFullWeek();
    }
  };

  // Handle custom date change
  const handleCustomDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Get chart configurations
  const chartConfigs = getLTEChartConfigs();

  return (
    <div className="reports-page">
      <div className="content-header">
        <h2>LTE Network Traffic Reports</h2>
      </div>

      <DateFilters
        showWeekSelector={showWeekSelector}
        availableWeeks={availableWeeks}
        selectedWeek={selectedWeek}
        onWeekChange={handleWeekChange}
        startDate={startDate}
        endDate={endDate}
        onCustomDateChange={handleCustomDateChange}
        onModeToggle={handleModeToggle}
      />

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
    </div>
  );
};

export default LTEReports;
