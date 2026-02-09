import React, { useState, useEffect, useCallback } from 'react';
import DateFilters from '../components/filters/DateFilters';
import ChartCard from '../components/charts/ChartCard';
import KPILineChart from '../components/charts/KPILineChart';
import StackedBarChart from '../components/charts/StackedBarChart';
import HorizontalStackedBarChart from '../components/charts/HorizontalStackedBarChart';
import NRRrcUsersStackedAreaChart from '../components/charts/NRRrcUsersStackedAreaChart';
import ChartModal from '../components/charts/ChartModal';
import NRReportsComparison from './NRReportsComparison';
import { useWeekSelector } from '../hooks/useWeekSelector';
import { useNRKPIData } from '../hooks/useNRKPIData';
import { useNRWeeklyTrafficData } from '../hooks/useNRWeeklyTrafficData';
import { useENDCLTETrafficData } from '../hooks/useENDCLTETrafficData';
import { getKpiDisplayName } from '../config/nrKpiMetadata';
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

  // Weekly traffic data hook for TOP Sites
  const {
    data: weeklyTrafficData,
    loading: weeklyTrafficLoading,
    error: weeklyTrafficError,
    fetchData: fetchWeeklyTrafficData
  } = useNRWeeklyTrafficData();

  // EN-DC LTE traffic data hook
  const {
    data: endcTrafficData,
    loading: endcTrafficLoading,
    error: endcTrafficError,
    fetchData: fetchENDCTrafficData
  } = useENDCLTETrafficData();
  
  // Local state for date range
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showWeekSelector, setShowWeekSelector] = useState(true);
  
  // Comparison mode state
  const [comparisonMode, setComparisonMode] = useState(false);

  // Modal state for enlarged chart view
  const [selectedChart, setSelectedChart] = useState(null);

  // Progressive rendering state - sections appear one by one
  const [visibleSections, setVisibleSections] = useState(0);

  // No Data Warning Component
  const NoDataWarning = () => (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#f59e0b', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fcd34d' }}>
      <svg style={{ width: '48px', height: '48px', margin: '0 auto 1rem', display: 'block' }} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
      </svg>
      No Data for this week
    </div>
  );

  // Handle chart click to open modal
  const handleChartClick = useCallback((chartConfig) => {
    setSelectedChart(chartConfig);
  }, []);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    setSelectedChart(null);
  }, []);

  // Initialize dates from selected week
  useEffect(() => {
    if (selectedWeek) {
      setStartDate(selectedWeek.monday.toISOString().split('T')[0]);
      setEndDate(selectedWeek.sunday.toISOString().split('T')[0]);
      // Reset visible sections when week changes
      setVisibleSections(0);
    }
  }, [selectedWeek]);

  // Progressive rendering - reveal sections one by one after data loads
  useEffect(() => {
    if (!kpiLoading && !weeklyTrafficLoading && !endcTrafficLoading && kpiData.length > 0 && !comparisonMode) {
      // Reset and start progressive reveal
      setVisibleSections(0);
      const totalSections = 10; // KPI section + 8 rows of charts + TOP Sites
      const delay = 150; // ms between each section
      
      for (let i = 1; i <= totalSections; i++) {
        setTimeout(() => {
          setVisibleSections(i);
        }, i * delay);
      }
    }
  }, [kpiLoading, weeklyTrafficLoading, endcTrafficLoading, kpiData.length, comparisonMode]);

  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        fetchKPIData(startDate, endDate),
        fetchWeeklyTrafficData(startDate, endDate),
        fetchENDCTrafficData(startDate, endDate)
      ]);
    } catch (error) {
      console.error('Error loading NR data:', error);
    }
  }, [startDate, endDate, fetchKPIData, fetchWeeklyTrafficData, fetchENDCTrafficData]);

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

  // HIDDEN: SCG Active Radio Resource Retainability - Not shown in main reports (available in NR Compare only)
  /* const prepareScgRetainabilityActiveData = () => {
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
  }; */

  // HIDDEN: SCG Radio Resource Retainability Overall - Not shown in main reports (available in NR Compare only)
  /* const prepareScgRetainabilityOverallData = () => {
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
  }; */

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

  // Prepare Partial Cell Availability chart data (hourly)
  const preparePartialCellAvailabilityData = () => {
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
      
      if (item.partial_cell_availability_pct !== null && item.partial_cell_availability_pct !== undefined) {
        if (item.freq_band === '900MHz') {
          dataByHour[key]['900MHz'] = parseFloat(item.partial_cell_availability_pct);
        } else if (item.freq_band === '3500MHz') {
          dataByHour[key]['3500MHz'] = parseFloat(item.partial_cell_availability_pct);
        }
      }
    });

    return Object.values(dataByHour).sort((a, b) => a.timestamp - b.timestamp);
  };

  // Prepare Random Access Success Rate chart data (hourly)
  const prepareRandomAccessSuccessRateData = () => {
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
      
      if (item.random_access_success_rate_pct !== null && item.random_access_success_rate_pct !== undefined) {
        if (item.freq_band === '900MHz') {
          dataByHour[key]['900MHz'] = parseFloat(item.random_access_success_rate_pct);
        } else if (item.freq_band === '3500MHz') {
          dataByHour[key]['3500MHz'] = parseFloat(item.random_access_success_rate_pct);
        }
      }
    });

    return Object.values(dataByHour).sort((a, b) => a.timestamp - b.timestamp);
  };

  // Prepare UE Context Setup Success Rate chart data (hourly)
  const prepareUeContextSetupSuccessRateData = () => {
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
      
      if (item.ue_context_setup_success_rate_pct !== null && item.ue_context_setup_success_rate_pct !== undefined) {
        if (item.freq_band === '900MHz') {
          dataByHour[key]['900MHz'] = parseFloat(item.ue_context_setup_success_rate_pct);
        } else if (item.freq_band === '3500MHz') {
          dataByHour[key]['3500MHz'] = parseFloat(item.ue_context_setup_success_rate_pct);
        }
      }
    });

    return Object.values(dataByHour).sort((a, b) => a.timestamp - b.timestamp);
  };

  const partialCellAvailabilityData = preparePartialCellAvailabilityData();
  const randomAccessSuccessRateData = prepareRandomAccessSuccessRateData();
  const ueContextSetupSuccessRateData = prepareUeContextSetupSuccessRateData();
  const setupSuccessRateData = prepareSetupSuccessRateData();
  const interPsCellChangeData = prepareInterPsCellChangeData();
  const scgRetainabilityEndcData = prepareScgRetainabilityEndcData();
  // Hidden charts - not shown in main reports (available in NR Compare only)
  // const scgRetainabilityActiveData = prepareScgRetainabilityActiveData();
  // const scgRetainabilityOverallData = prepareScgRetainabilityOverallData();
  const peakRrcConnectedUsersData = preparePeakRrcConnectedUsersData();
  const avgRrcConnectedUsersData = prepareAvgRrcConnectedUsersData();

  // ============================================
  // Traffic & Integrity KPI Data Preparation Functions
  // ============================================

  // Generic function to prepare hourly data for Traffic & Integrity KPIs
  const prepareTrafficKpiData = (fieldName) => {
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
      
      if (item[fieldName] !== null && item[fieldName] !== undefined) {
        if (item.freq_band === '900MHz') {
          dataByHour[key]['900MHz'] = parseFloat(item[fieldName]);
        } else if (item.freq_band === '3500MHz') {
          dataByHour[key]['3500MHz'] = parseFloat(item[fieldName]);
        }
      }
    });

    return Object.values(dataByHour).sort((a, b) => a.timestamp - b.timestamp);
  };

  // Downlink KPIs
  const avgDlMacDrbThroughputData = prepareTrafficKpiData('avg_dl_mac_drb_throughput_mbps');
  const normalizedAvgDlMacCellThroughputTrafficData = prepareTrafficKpiData('normalized_avg_dl_mac_cell_throughput_traffic_mbps');
  const normalizedDlMacCellThroughputActualPdschData = prepareTrafficKpiData('normalized_dl_mac_cell_throughput_actual_pdsch_mbps');
  const pdschSlotUtilizationData = prepareTrafficKpiData('pdsch_slot_utilization_pct');
  const dlRbsymUtilizationData = prepareTrafficKpiData('dl_rbsym_utilization_pct');
  const percentageUnrestrictedVolumeDlData = prepareTrafficKpiData('percentage_unrestricted_volume_dl_pct');
  const userDataTrafficVolumeDlData = prepareTrafficKpiData('user_data_traffic_volume_dl_gb');

  // Uplink KPIs
  const avgUlMacUeThroughputData = prepareTrafficKpiData('avg_ul_mac_ue_throughput_mbps');
  const normalizedAvgUlMacCellThroughputSuccessfulPuschData = prepareTrafficKpiData('normalized_avg_ul_mac_cell_throughput_successful_pusch_mbps');
  const normalizedAvgUlMacCellThroughputActualPuschData = prepareTrafficKpiData('normalized_avg_ul_mac_cell_throughput_actual_pusch_mbps');
  const puschSlotUtilizationData = prepareTrafficKpiData('pusch_slot_utilization_pct');
  const ulRbsymUtilizationData = prepareTrafficKpiData('ul_rbsym_utilization_pct');
  const percentageUnrestrictedVolumeUlData = prepareTrafficKpiData('percentage_unrestricted_volume_ul_pct');
  const userDataTrafficVolumeUlData = prepareTrafficKpiData('user_data_traffic_volume_ul_gb');

  // Prepare Share of 5G Traffic Volume data (aggregated by date, DL + UL combined)
  const prepareShareOf5gTrafficVolumeData = () => {
    if (!kpiData || kpiData.length === 0) {
      return [];
    }

    const dataByDate = {};
    
    kpiData.forEach(item => {
      const dateKey = item.date_id;
      if (!dataByDate[dateKey]) {
        dataByDate[dateKey] = { 
          name: dateKey,
          '900MHz': 0, 
          '3500MHz': 0
        };
      }
      
      // Sum DL and UL traffic volumes for each frequency band
      const dlVolume = parseFloat(item.user_data_traffic_volume_dl_gb) || 0;
      const ulVolume = parseFloat(item.user_data_traffic_volume_ul_gb) || 0;
      const totalVolume = dlVolume + ulVolume;
      
      if (item.freq_band === '900MHz') {
        dataByDate[dateKey]['900MHz'] += totalVolume;
      } else if (item.freq_band === '3500MHz') {
        dataByDate[dateKey]['3500MHz'] += totalVolume;
      }
    });

    // Round values to 2 decimal places
    Object.values(dataByDate).forEach(item => {
      item['900MHz'] = parseFloat(item['900MHz'].toFixed(2));
      item['3500MHz'] = parseFloat(item['3500MHz'].toFixed(2));
    });

    return Object.values(dataByDate).sort((a, b) => new Date(a.name) - new Date(b.name));
  };

  const shareOf5gTrafficVolumeData = prepareShareOf5gTrafficVolumeData();

  // Prepare EN-DC LTE Traffic Volume data (daily)
  const prepareENDCTrafficVolumeData = () => {
    if (!endcTrafficData || endcTrafficData.length === 0) {
      return [];
    }

    return endcTrafficData.map(item => {
      const value = parseFloat(item.total_gb) || 0;
      return {
        name: item.date_id,
        'EN-DC Traffic': parseFloat(value.toFixed(2))
      };
    }).sort((a, b) => new Date(a.name) - new Date(b.name));
  };

  const endcTrafficVolumeData = prepareENDCTrafficVolumeData();

  // ============================================
  // TOP Sites Data Preparation Functions
  // ============================================
  
  // Prepare TOP Sites data - Total (all bands combined)
  const prepareTopSitesTotalData = () => {
    console.log('📊 weeklyTrafficData:', weeklyTrafficData?.length, 'records');
    console.log('📊 weeklyTrafficData sample:', weeklyTrafficData?.slice(0, 2));
    if (!weeklyTrafficData || weeklyTrafficData.length === 0) {
      return [];
    }

    const dataBySite = {};
    
    weeklyTrafficData.forEach(item => {
      const siteName = item.site_name;
      if (!dataBySite[siteName]) {
        dataBySite[siteName] = { 
          site_name: siteName,
          dl: 0, 
          ul: 0
        };
      }
      
      dataBySite[siteName].dl += parseFloat(item.user_data_traffic_volume_dl_gb) || 0;
      dataBySite[siteName].ul += parseFloat(item.user_data_traffic_volume_ul_gb) || 0;
    });

    // Convert to array, calculate total, sort by total descending, take top 20
    return Object.values(dataBySite)
      .map(item => ({
        ...item,
        dl: parseFloat(item.dl.toFixed(2)),
        ul: parseFloat(item.ul.toFixed(2)),
        total: parseFloat((item.dl + item.ul).toFixed(2))
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 20);
  };

  // Prepare TOP Sites data - TDD (3500MHz band)
  const prepareTopSitesTddData = () => {
    if (!weeklyTrafficData || weeklyTrafficData.length === 0) {
      return [];
    }

    const dataBySite = {};
    
    weeklyTrafficData.forEach(item => {
      // Only include 3500MHz (TDD) data
      if (item.freq_band !== '3500MHz') return;
      
      const siteName = item.site_name;
      if (!dataBySite[siteName]) {
        dataBySite[siteName] = { 
          site_name: siteName,
          dl: 0, 
          ul: 0
        };
      }
      
      dataBySite[siteName].dl += parseFloat(item.user_data_traffic_volume_dl_gb) || 0;
      dataBySite[siteName].ul += parseFloat(item.user_data_traffic_volume_ul_gb) || 0;
    });

    // Convert to array, calculate total, sort by total descending, take top 20
    return Object.values(dataBySite)
      .map(item => ({
        ...item,
        dl: parseFloat(item.dl.toFixed(2)),
        ul: parseFloat(item.ul.toFixed(2)),
        total: parseFloat((item.dl + item.ul).toFixed(2))
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 20);
  };

  // Prepare TOP Sites data - FDD (900MHz band)
  const prepareTopSitesFddData = () => {
    if (!weeklyTrafficData || weeklyTrafficData.length === 0) {
      return [];
    }

    const dataBySite = {};
    
    weeklyTrafficData.forEach(item => {
      // Only include 900MHz (FDD) data
      if (item.freq_band !== '900MHz') return;
      
      const siteName = item.site_name;
      if (!dataBySite[siteName]) {
        dataBySite[siteName] = { 
          site_name: siteName,
          dl: 0, 
          ul: 0
        };
      }
      
      dataBySite[siteName].dl += parseFloat(item.user_data_traffic_volume_dl_gb) || 0;
      dataBySite[siteName].ul += parseFloat(item.user_data_traffic_volume_ul_gb) || 0;
    });

    // Convert to array, calculate total, sort by total descending, take top 20
    return Object.values(dataBySite)
      .map(item => ({
        ...item,
        dl: parseFloat(item.dl.toFixed(2)),
        ul: parseFloat(item.ul.toFixed(2)),
        total: parseFloat((item.dl + item.ul).toFixed(2))
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 20);
  };

  const topSitesTotalData = prepareTopSitesTotalData();
  const topSitesTddData = prepareTopSitesTddData();
  const topSitesFddData = prepareTopSitesFddData();

  // Format function for TOP Sites charts
  const formatTrafficValue = (value) => {
    return value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value.toFixed(1);
  };

  // ============================================
  // Utility function to calculate nice rounded Y-axis max
  // ============================================
  const calculateNiceAxisMax = (data, dataKeys = ['900MHz', '3500MHz']) => {
    if (!data || data.length === 0) return 100;
    
    let max = 0;
    data.forEach(item => {
      dataKeys.forEach(key => {
        const val = item[key];
        if (val !== null && val !== undefined && !isNaN(val)) {
          max = Math.max(max, val);
        }
      });
    });
    
    if (max === 0) return 100;
    
    // Determine the order of magnitude and round up nicely
    const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
    const normalized = max / magnitude;
    
    let niceMax;
    if (normalized <= 1) {
      niceMax = magnitude;
    } else if (normalized <= 1.5) {
      niceMax = 1.5 * magnitude;
    } else if (normalized <= 2) {
      niceMax = 2 * magnitude;
    } else if (normalized <= 2.5) {
      niceMax = 2.5 * magnitude;
    } else if (normalized <= 3) {
      niceMax = 3 * magnitude;
    } else if (normalized <= 4) {
      niceMax = 4 * magnitude;
    } else if (normalized <= 5) {
      niceMax = 5 * magnitude;
    } else if (normalized <= 5.5) {
      niceMax = 5.5 * magnitude;
    } else if (normalized <= 6) {
      niceMax = 6 * magnitude;
    } else if (normalized <= 7) {
      niceMax = 7 * magnitude;
    } else if (normalized <= 8) {
      niceMax = 8 * magnitude;
    } else {
      niceMax = 10 * magnitude;
    }
    
    return niceMax;
  };

  // Pre-calculate nice Y-axis domains for Traffic KPIs (used in charts)
  const normalizedDlMacCellThroughputActualPdschYMax = calculateNiceAxisMax(normalizedDlMacCellThroughputActualPdschData);
  const avgUlMacUeThroughputYMax = calculateNiceAxisMax(avgUlMacUeThroughputData);
  const normalizedAvgUlMacCellThroughputSuccessfulPuschYMax = calculateNiceAxisMax(normalizedAvgUlMacCellThroughputSuccessfulPuschData);
  const normalizedAvgUlMacCellThroughputActualPuschYMax = calculateNiceAxisMax(normalizedAvgUlMacCellThroughputActualPuschData);

  // Calculate custom Y-axis ticks for EN-DC Setup Success Rate (min, middle, max with 1 decimal)
  const calculateSetupSuccessRateTicks = () => {
    if (!setupSuccessRateData || setupSuccessRateData.length === 0) return undefined;
    
    let min = Infinity;
    setupSuccessRateData.forEach(item => {
      const val1 = item['900MHz'];
      const val2 = item['3500MHz'];
      if (val1 !== null && val1 !== undefined && !isNaN(val1)) {
        min = Math.min(min, val1);
      }
      if (val2 !== null && val2 !== undefined && !isNaN(val2)) {
        min = Math.min(min, val2);
      }
    });
    
    if (min === Infinity) return undefined;
    
    const minTick = Math.floor(min) - 1;
    const maxTick = 100;
    const middleTick = (minTick + maxTick) / 2;
    
    // Format to 1 decimal place
    return [
      parseFloat(minTick.toFixed(1)),
      parseFloat(middleTick.toFixed(1)),
      parseFloat(maxTick.toFixed(1))
    ];
  };

  const setupSuccessRateTicks = calculateSetupSuccessRateTicks();

  // Calculate custom Y-axis ticks for EN-DC Inter-sgNodeB PSCell Change Success Rate (min rounded to 10, middle, max)
  const calculateInterPsCellChangeTicks = () => {
    if (!interPsCellChangeData || interPsCellChangeData.length === 0) return undefined;
    
    let min = Infinity;
    interPsCellChangeData.forEach(item => {
      const val1 = item['900MHz'];
      const val2 = item['3500MHz'];
      if (val1 !== null && val1 !== undefined && !isNaN(val1)) {
        min = Math.min(min, val1);
      }
      if (val2 !== null && val2 !== undefined && !isNaN(val2)) {
        min = Math.min(min, val2);
      }
    });
    
    if (min === Infinity) return undefined;
    
    // Round down to nearest 10
    const minTick = Math.floor(min / 10) * 10;
    const maxTick = 100.0;
    const middleTick = (minTick + maxTick) / 2;
    
    // Return exact numeric values formatted to 1 decimal
    return [
      Number(minTick.toFixed(1)),
      Number(middleTick.toFixed(1)),
      Number(maxTick.toFixed(1))
    ];
  };

  const interPsCellChangeTicks = calculateInterPsCellChangeTicks();

  // Helper function to check if chart data has any actual values
  const hasChartData = (data, dataKeys = []) => {
    if (!data || data.length === 0) return false;
    
    // If no dataKeys specified, check if any numeric values exist
    if (dataKeys.length === 0) {
      return data.some(item => 
        Object.values(item).some(val => 
          typeof val === 'number' && !isNaN(val) && val !== null
        )
      );
    }
    
    // Check if any of the specified dataKeys have values
    return data.some(item => 
      dataKeys.some(key => {
        const val = item[key];
        return val !== null && val !== undefined && !isNaN(val);
      })
    );
  };

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
        hideCustomDatesButton={true}
      />

      {(kpiLoading || weeklyTrafficLoading || endcTrafficLoading) && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>
            Loading NR data...
            {(kpiLoading && weeklyTrafficLoading && endcTrafficLoading) && ' (KPI, Traffic & EN-DC)'}
            {(kpiLoading && weeklyTrafficLoading && !endcTrafficLoading) && ' (KPI & Traffic)'}
            {(kpiLoading && !weeklyTrafficLoading && endcTrafficLoading) && ' (KPI & EN-DC)'}
            {(kpiLoading && !weeklyTrafficLoading && !endcTrafficLoading) && ' (KPI)'}
            {(!kpiLoading && weeklyTrafficLoading && endcTrafficLoading) && ' (Traffic & EN-DC)'}
            {(!kpiLoading && weeklyTrafficLoading && !endcTrafficLoading) && ' (Traffic)'}
            {(!kpiLoading && !weeklyTrafficLoading && endcTrafficLoading) && ' (EN-DC)'}
          </p>
        </div>
      )}

      {(kpiError || weeklyTrafficError || endcTrafficError) && (
        <div className="error-message">
          {kpiError && <p>Error loading KPI data: {kpiError}</p>}
          {weeklyTrafficError && <p>Error loading traffic data: {weeklyTrafficError}</p>}
          {endcTrafficError && <p>Error loading EN-DC traffic data: {endcTrafficError}</p>}
        </div>
      )}

      {/* KPI Section */}
      {visibleSections >= 1 && !kpiLoading && !weeklyTrafficLoading && !endcTrafficLoading && !kpiError && !weeklyTrafficError && !endcTrafficError && kpiData.length > 0 && (
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
              Cell availability, EN-DC setup and PSCell change success rates by frequency band
            </p>
          </div>

          {/* Partial Cell Availability and Random Access Success Rate - Side by side */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div>
              <ChartCard 
                title={getKpiDisplayName('partial_cell_availability_pct')} 
                description="Cell availability percentage by frequency band"
                onClick={() => hasChartData(partialCellAvailabilityData, ['900MHz', '3500MHz']) ? handleChartClick({  
                  title: getKpiDisplayName('partial_cell_availability_pct'),
                  data: partialCellAvailabilityData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: '%',
                  yAxisDomain: [90, 100]
                }) : null}
              >
                {hasChartData(partialCellAvailabilityData, ['900MHz', '3500MHz']) ? (
                  <KPILineChart 
                    data={partialCellAvailabilityData}
                    dataKeys={['900MHz', '3500MHz']}
                    colors={['#6b21a8', '#ec4899']}
                    yAxisLabel="%"
                    yAxisDomain={[90, 100]}
                  />
                ) : (
                  <NoDataWarning />
                )}
              </ChartCard>
            </div>

            <div>
              <ChartCard 
                title={getKpiDisplayName('random_access_success_rate_pct')} 
                description="Random access success rate by frequency band"
                onClick={() => hasChartData(randomAccessSuccessRateData, ['900MHz', '3500MHz']) ? handleChartClick({  
                  title: getKpiDisplayName('random_access_success_rate_pct'),
                  data: randomAccessSuccessRateData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: '%',
                  yAxisDomain: [40, 100],
                  yAxisTicks: [40, 60, 80, 100]
                }) : null}
              >
                {hasChartData(randomAccessSuccessRateData, ['900MHz', '3500MHz']) ? (
                  <KPILineChart 
                    data={randomAccessSuccessRateData}
                    dataKeys={['900MHz', '3500MHz']}
                    colors={['#6b21a8', '#ec4899']}
                    yAxisLabel="%"
                    yAxisDomain={[40, 100]}
                    yAxisTicks={[40, 60, 80, 100]}
                  />
                ) : (
                  <NoDataWarning />
                )}
              </ChartCard>
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div>
              <ChartCard 
                title={getKpiDisplayName('ue_context_setup_success_rate_pct')} 
                description="UE context setup success rate by frequency band"
                onClick={() => hasChartData(ueContextSetupSuccessRateData, ['900MHz', '3500MHz']) ? handleChartClick({  
                  title: getKpiDisplayName('ue_context_setup_success_rate_pct'),
                  data: ueContextSetupSuccessRateData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: '%',
                  yAxisDomain: [90, 100]
                }) : null}
              >
                {hasChartData(ueContextSetupSuccessRateData, ['900MHz', '3500MHz']) ? (
                  <KPILineChart 
                    data={ueContextSetupSuccessRateData}
                    dataKeys={['900MHz', '3500MHz']}
                    colors={['#6b21a8', '#ec4899']}
                    yAxisLabel="%"
                    yAxisDomain={[90, 100]}
                  />
                ) : (
                  <NoDataWarning />
                )}
              </ChartCard>
            </div>

            <div>
            <ChartCard 
              title={getKpiDisplayName('endc_setup_success_rate')} 
              description="5G connection establishment success rate by frequency band"
              onClick={() => hasChartData(setupSuccessRateData, ['900MHz', '3500MHz']) ? handleChartClick({
                title: getKpiDisplayName('endc_setup_success_rate'),
                data: setupSuccessRateData,
                dataKeys: ['900MHz', '3500MHz'],
                colors: ['#6b21a8', '#ec4899'],
                yAxisLabel: '%',
                yAxisDomain: ['autoFloorMinus1', 100],
                yAxisTicks: setupSuccessRateTicks
              }) : null}
            >
              {hasChartData(setupSuccessRateData, ['900MHz', '3500MHz']) ? (
                <KPILineChart 
                  data={setupSuccessRateData}
                  dataKeys={['900MHz', '3500MHz']}
                  colors={['#6b21a8', '#ec4899']}
                  yAxisLabel="%"
                  yAxisDomain={['autoFloorMinus1', 100]}
                  yAxisTicks={setupSuccessRateTicks}
                />
              ) : (
                <NoDataWarning />
              )}
            </ChartCard>
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div>
            <ChartCard 
              title={getKpiDisplayName('endc_inter_pscell_change_success_rate')} 
              description="5G inter-gNodeB PSCell change success rate by frequency band"
              onClick={() => hasChartData(interPsCellChangeData, ['900MHz', '3500MHz']) ? handleChartClick({
                title: getKpiDisplayName('endc_inter_pscell_change_success_rate'),
                data: interPsCellChangeData,
                dataKeys: ['900MHz', '3500MHz'],
                colors: ['#6b21a8', '#ec4899'],
                yAxisLabel: '%',
                yAxisDomain: interPsCellChangeTicks ? [interPsCellChangeTicks[0], 100] : [0, 100],
                yAxisTicks: interPsCellChangeTicks
              }) : null}
            >
              {hasChartData(interPsCellChangeData, ['900MHz', '3500MHz']) ? (
                <KPILineChart 
                  data={interPsCellChangeData}
                  dataKeys={['900MHz', '3500MHz']}
                  colors={['#6b21a8', '#ec4899']}
                  yAxisLabel="%"
                  yAxisDomain={interPsCellChangeTicks ? [interPsCellChangeTicks[0], 100] : [0, 100]}
                  yAxisTicks={interPsCellChangeTicks}
                />
              ) : (
                <NoDataWarning />
              )}
            </ChartCard>
            </div>

            <div>
            <ChartCard 
              title={getKpiDisplayName('scg_retainability_endc_connectivity')} 
              description="SCG retainability considering EN-DC connectivity by frequency band"
              onClick={() => hasChartData(scgRetainabilityEndcData, ['900MHz', '3500MHz']) ? handleChartClick({
                title: getKpiDisplayName('scg_retainability_endc_connectivity'),
                data: scgRetainabilityEndcData,
                dataKeys: ['900MHz', '3500MHz'],
                colors: ['#6b21a8', '#ec4899'],
                yAxisLabel: '%',
                yAxisDomain: [0, 8],
                yAxisTicks: [0, 2, 4, 6, 8]
              }) : null}
            >
              {hasChartData(scgRetainabilityEndcData, ['900MHz', '3500MHz']) ? (
                <KPILineChart 
                  data={scgRetainabilityEndcData}
                  dataKeys={['900MHz', '3500MHz']}
                  colors={['#6b21a8', '#ec4899']}
                  yAxisLabel="%"
                  yAxisDomain={[0, 8]}
                  yAxisTicks={[0, 2, 4, 6, 8]}
                />
              ) : (
                <NoDataWarning />
              )}
            </ChartCard>
            </div>
          </div>

          {/* HIDDEN: SCG Active Radio Resource Retainability and SCG Radio Resource Retainability 
              These KPIs are not shown in the main reports but available in NR Compare mode only
              Database fields: scg_retainability_active, scg_retainability_overall
          */}
          {/* <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div>
            <ChartCard 
              title={getKpiDisplayName('scg_retainability_active')} 
              description="SCG active radio resource retainability by frequency band"
              onClick={() => hasChartData(scgRetainabilityActiveData, ['900MHz', '3500MHz']) ? handleChartClick({
                title: getKpiDisplayName('scg_retainability_active'),
                data: scgRetainabilityActiveData,
                dataKeys: ['900MHz', '3500MHz'],
                colors: ['#6b21a8', '#ec4899'],
                yAxisLabel: '%',
                yAxisDomain: [0, 8],
                yAxisTicks: [0, 2, 4, 6, 8]
              }) : null}
            >
              {hasChartData(scgRetainabilityActiveData, ['900MHz', '3500MHz']) ? (
                <KPILineChart 
                  data={scgRetainabilityActiveData}
                  dataKeys={['900MHz', '3500MHz']}
                  colors={['#6b21a8', '#ec4899']}
                  yAxisLabel="%"
                  yAxisDomain={[0, 8]}
                  yAxisTicks={[0, 2, 4, 6, 8]}
                />
              ) : (
                <NoDataWarning />
              )}
            </ChartCard>
            </div>

            <div>
            <ChartCard 
              title={getKpiDisplayName('scg_retainability_overall')} 
              description="Overall SCG radio resource retainability by frequency band"
              onClick={() => hasChartData(scgRetainabilityOverallData, ['900MHz', '3500MHz']) ? handleChartClick({
                title: getKpiDisplayName('scg_retainability_overall'),
                data: scgRetainabilityOverallData,
                dataKeys: ['900MHz', '3500MHz'],
                colors: ['#6b21a8', '#ec4899'],
                yAxisLabel: '%',
                yAxisDomain: [0, 8],
                yAxisTicks: [0, 2, 4, 6, 8]
              }) : null}
            >
              {hasChartData(scgRetainabilityOverallData, ['900MHz', '3500MHz']) ? (
                <KPILineChart 
                  data={scgRetainabilityOverallData}
                  dataKeys={['900MHz', '3500MHz']}
                  colors={['#6b21a8', '#ec4899']}
                  yAxisLabel="%"
                  yAxisDomain={[0, 8]}
                  yAxisTicks={[0, 2, 4, 6, 8]}
                />
              ) : (
                <NoDataWarning />
              )}
            </ChartCard>
            </div>
          </div> */}

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div>
            <ChartCard 
              title={getKpiDisplayName('peak_rrc_connected_users')} 
              description="Peak number of NR EN-DC RRC connected users by frequency band"
              onClick={() => hasChartData(peakRrcConnectedUsersData, ['900MHz', '3500MHz']) ? handleChartClick({
                title: getKpiDisplayName('peak_rrc_connected_users'),
                data: peakRrcConnectedUsersData,
                dataKeys: ['900MHz', '3500MHz'],
                colors: ['#6b21a8', '#ec4899'],
                yAxisLabel: 'Users',
                chartType: 'stackedArea'
              }) : null}
            >
              {hasChartData(peakRrcConnectedUsersData, ['900MHz', '3500MHz']) ? (
                <NRRrcUsersStackedAreaChart 
                  data={peakRrcConnectedUsersData}
                  height={350}
                  title={getKpiDisplayName('peak_rrc_connected_users')}
                  yAxisDomain={[0, 12000]}
                  yAxisTicks={[0, 3000, 6000, 9000, 12000]}
                />
              ) : (
                <NoDataWarning />
              )}
            </ChartCard>
            </div>

            <div>
            <ChartCard 
              title={getKpiDisplayName('avg_rrc_connected_users')} 
              description="Average NR EN-DC RRC connected users by frequency band"
              onClick={() => hasChartData(avgRrcConnectedUsersData, ['900MHz', '3500MHz']) ? handleChartClick({
                title: getKpiDisplayName('avg_rrc_connected_users'),
                data: avgRrcConnectedUsersData,
                dataKeys: ['900MHz', '3500MHz'],
                colors: ['#6b21a8', '#ec4899'],
                yAxisLabel: 'Users',
                chartType: 'stackedArea'
              }) : null}
            >
              {hasChartData(avgRrcConnectedUsersData, ['900MHz', '3500MHz']) ? (
                <NRRrcUsersStackedAreaChart 
                  data={avgRrcConnectedUsersData}
                  height={350}
                  title={getKpiDisplayName('avg_rrc_connected_users')}
                  yAxisDomain={[0, 12000]}
                  yAxisTicks={[0, 3000, 6000, 9000, 12000]}
                />
              ) : (
                <NoDataWarning />
              )}
            </ChartCard>
            </div>
          </div>

          {/* ============================================ */}
          {/* Traffic & Integrity Section */}
          {/* ============================================ */}
          {visibleSections >= 2 && (
            <>
              <div className="content-header" style={{ marginTop: '3rem' }}>
                <h3 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '0.5rem' }}>
                  Traffic & Integrity
                </h3>
                <p className="content-subtitle" style={{ fontSize: '0.875rem' }}>
                  Throughput, utilization and traffic volume metrics by frequency band
                </p>
              </div>

              {/* Row 1: Average DL MAC DRB Throughput | Normalized Average DL MAC Cell Throughput Considering Traffic */}
              <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div>
              <ChartCard 
                title={getKpiDisplayName('avg_dl_mac_drb_throughput_mbps')} 
                description="Average downlink MAC DRB throughput by frequency band"
                onClick={() => hasChartData(avgDlMacDrbThroughputData, ['900MHz', '3500MHz']) ? handleChartClick({  
                  title: getKpiDisplayName('avg_dl_mac_drb_throughput_mbps'),
                  data: avgDlMacDrbThroughputData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: 'Mbps',
                  yAxisDomain: [0, 60000],
                  yAxisTicks: [0, 20000, 40000, 60000]
                }) : null}
              >
                {hasChartData(avgDlMacDrbThroughputData, ['900MHz', '3500MHz']) ? (
                  <KPILineChart 
                    data={avgDlMacDrbThroughputData}
                    dataKeys={['900MHz', '3500MHz']}
                    colors={['#6b21a8', '#ec4899']}
                    yAxisLabel="Mbps"
                    yAxisDomain={[0, 60000]}
                    yAxisTicks={[0, 20000, 40000, 60000]}
                  />
                ) : (
                  <NoDataWarning />
                )}
              </ChartCard>
            </div>

            <div>
              <ChartCard 
                title={getKpiDisplayName('avg_ul_mac_ue_throughput_mbps')} 
                description="Average uplink MAC UE throughput by frequency band"
                onClick={() => hasChartData(avgUlMacUeThroughputData, ['900MHz', '3500MHz']) ? handleChartClick({  
                  title: getKpiDisplayName('avg_ul_mac_ue_throughput_mbps'),
                  data: avgUlMacUeThroughputData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: 'Mbps',
                  yAxisDomain: [0, avgUlMacUeThroughputYMax]
                }) : null}
              >
                {hasChartData(avgUlMacUeThroughputData, ['900MHz', '3500MHz']) ? (
                  <KPILineChart 
                    data={avgUlMacUeThroughputData}
                    dataKeys={['900MHz', '3500MHz']}
                    colors={['#6b21a8', '#ec4899']}
                    yAxisLabel="Mbps"
                    yAxisDomain={[0, avgUlMacUeThroughputYMax]}
                  />
                ) : (
                  <NoDataWarning />
                )}
              </ChartCard>
            </div>
          </div>
            </>
          )}

          {/* Row 2: Normalized DL MAC Cell Throughput Traffic | Normalized UL Successful PUSCH */}
          {visibleSections >= 3 && (
            <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div>
              <ChartCard 
                title={getKpiDisplayName('normalized_avg_dl_mac_cell_throughput_traffic_mbps')} 
                description="Normalized average DL MAC cell throughput by frequency band"
                onClick={() => hasChartData(normalizedAvgDlMacCellThroughputTrafficData, ['900MHz', '3500MHz']) ? handleChartClick({  
                  title: getKpiDisplayName('normalized_avg_dl_mac_cell_throughput_traffic_mbps'),
                  data: normalizedAvgDlMacCellThroughputTrafficData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: 'Mbps',
                  yAxisDomain: [0, 16000]
                }) : null}
              >
                {hasChartData(normalizedAvgDlMacCellThroughputTrafficData, ['900MHz', '3500MHz']) ? (
                  <KPILineChart 
                    data={normalizedAvgDlMacCellThroughputTrafficData}
                    dataKeys={['900MHz', '3500MHz']}
                    colors={['#6b21a8', '#ec4899']}
                    yAxisLabel="Mbps"
                    yAxisDomain={[0, 16000]}
                  />
                ) : (
                  <NoDataWarning />
                )}
              </ChartCard>
            </div>

            <div>
              <ChartCard 
                title={getKpiDisplayName('normalized_avg_ul_mac_cell_throughput_successful_pusch_mbps')} 
                description="Normalized average UL MAC cell throughput for successful PUSCH slots"
                onClick={() => hasChartData(normalizedAvgUlMacCellThroughputSuccessfulPuschData, ['900MHz', '3500MHz']) ? handleChartClick({  
                  title: getKpiDisplayName('normalized_avg_ul_mac_cell_throughput_successful_pusch_mbps'),
                  data: normalizedAvgUlMacCellThroughputSuccessfulPuschData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: 'Mbps',
                  yAxisDomain: [0, normalizedAvgUlMacCellThroughputSuccessfulPuschYMax]
                }) : null}
              >
                {hasChartData(normalizedAvgUlMacCellThroughputSuccessfulPuschData, ['900MHz', '3500MHz']) ? (
                  <KPILineChart 
                    data={normalizedAvgUlMacCellThroughputSuccessfulPuschData}
                    dataKeys={['900MHz', '3500MHz']}
                    colors={['#6b21a8', '#ec4899']}
                    yAxisLabel="Mbps"
                    yAxisDomain={[0, normalizedAvgUlMacCellThroughputSuccessfulPuschYMax]}
                  />
                ) : (
                  <NoDataWarning />
                )}
              </ChartCard>
            </div>
          </div>
          )}

          {/* Row 3: Normalized DL MAC Cell Throughput Actual PDSCH | Normalized UL Actual PUSCH */}
          {visibleSections >= 4 && (
            <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div>
              <ChartCard 
                title={getKpiDisplayName('normalized_dl_mac_cell_throughput_actual_pdsch_mbps')} 
                description="Normalized DL MAC cell throughput for actual PDSCH slots"
                onClick={() => hasChartData(normalizedDlMacCellThroughputActualPdschData, ['900MHz', '3500MHz']) ? handleChartClick({  
                  title: getKpiDisplayName('normalized_dl_mac_cell_throughput_actual_pdsch_mbps'),
                  data: normalizedDlMacCellThroughputActualPdschData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: 'Mbps',
                  yAxisDomain: [0, normalizedDlMacCellThroughputActualPdschYMax]
                }) : null}
              >
                {hasChartData(normalizedDlMacCellThroughputActualPdschData, ['900MHz', '3500MHz']) ? (
                  <KPILineChart 
                    data={normalizedDlMacCellThroughputActualPdschData}
                    dataKeys={['900MHz', '3500MHz']}
                    colors={['#6b21a8', '#ec4899']}
                    yAxisLabel="Mbps"
                    yAxisDomain={[0, normalizedDlMacCellThroughputActualPdschYMax]}
                  />
                ) : (
                  <NoDataWarning />
                )}
              </ChartCard>
            </div>

            <div>
              <ChartCard 
                title={getKpiDisplayName('normalized_avg_ul_mac_cell_throughput_actual_pusch_mbps')} 
                description="Normalized average UL MAC cell throughput for actual PUSCH slots"
                onClick={() => hasChartData(normalizedAvgUlMacCellThroughputActualPuschData, ['900MHz', '3500MHz']) ? handleChartClick({  
                  title: getKpiDisplayName('normalized_avg_ul_mac_cell_throughput_actual_pusch_mbps'),
                  data: normalizedAvgUlMacCellThroughputActualPuschData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: 'Mbps',
                  yAxisDomain: [0, normalizedAvgUlMacCellThroughputActualPuschYMax]
                }) : null}
              >
                {hasChartData(normalizedAvgUlMacCellThroughputActualPuschData, ['900MHz', '3500MHz']) ? (
                  <KPILineChart 
                    data={normalizedAvgUlMacCellThroughputActualPuschData}
                    dataKeys={['900MHz', '3500MHz']}
                    colors={['#6b21a8', '#ec4899']}
                    yAxisLabel="Mbps"
                    yAxisDomain={[0, normalizedAvgUlMacCellThroughputActualPuschYMax]}
                  />
                ) : (
                  <NoDataWarning />
                )}
              </ChartCard>
            </div>
          </div>
          )}

          {/* Row 4: PDSCH Slot Utilization | PUSCH Slot Utilization */}
          {visibleSections >= 5 && (
            <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div>
              <ChartCard 
                title={getKpiDisplayName('pdsch_slot_utilization_pct')} 
                description="PDSCH slot utilization percentage by frequency band"
                onClick={() => hasChartData(pdschSlotUtilizationData, ['900MHz', '3500MHz']) ? handleChartClick({  
                  title: getKpiDisplayName('pdsch_slot_utilization_pct'),
                  data: pdschSlotUtilizationData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: '%',
                  yAxisDomain: [0, 100]
                }) : null}
              >
                {hasChartData(pdschSlotUtilizationData, ['900MHz', '3500MHz']) ? (
                  <KPILineChart 
                    data={pdschSlotUtilizationData}
                    dataKeys={['900MHz', '3500MHz']}
                    colors={['#6b21a8', '#ec4899']}
                    yAxisLabel="%"
                    yAxisDomain={[0, 100]}
                  />
                ) : (
                  <NoDataWarning />
                )}
              </ChartCard>
            </div>

            <div>
              <ChartCard 
                title={getKpiDisplayName('pusch_slot_utilization_pct')} 
                description="PUSCH slot utilization percentage by frequency band"
                onClick={() => hasChartData(puschSlotUtilizationData, ['900MHz', '3500MHz']) ? handleChartClick({  
                  title: getKpiDisplayName('pusch_slot_utilization_pct'),
                  data: puschSlotUtilizationData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: '%',
                  yAxisDomain: [0, 100]
                }) : null}
              >
                {hasChartData(puschSlotUtilizationData, ['900MHz', '3500MHz']) ? (
                  <KPILineChart 
                    data={puschSlotUtilizationData}
                    dataKeys={['900MHz', '3500MHz']}
                    colors={['#6b21a8', '#ec4899']}
                    yAxisLabel="%"
                    yAxisDomain={[0, 100]}
                  />
                ) : (
                  <NoDataWarning />
                )}
              </ChartCard>
            </div>
          </div>
          )}

          {/* Row 5: DL RBSym Utilization | UL RBSym Utilization */}
          {visibleSections >= 6 && (
            <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div>
              <ChartCard 
                title={getKpiDisplayName('dl_rbsym_utilization_pct')} 
                description="Downlink RBSym utilization percentage by frequency band"
                onClick={() => hasChartData(dlRbsymUtilizationData, ['900MHz', '3500MHz']) ? handleChartClick({  
                  title: getKpiDisplayName('dl_rbsym_utilization_pct'),
                  data: dlRbsymUtilizationData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: '%',
                  yAxisDomain: [0, 100]
                }) : null}
              >
                {hasChartData(dlRbsymUtilizationData, ['900MHz', '3500MHz']) ? (
                  <KPILineChart 
                    data={dlRbsymUtilizationData}
                    dataKeys={['900MHz', '3500MHz']}
                    colors={['#6b21a8', '#ec4899']}
                    yAxisLabel="%"
                    yAxisDomain={[0, 100]}
                  />
                ) : (
                  <NoDataWarning />
                )}
              </ChartCard>
            </div>

            <div>
              <ChartCard 
                title={getKpiDisplayName('ul_rbsym_utilization_pct')} 
                description="Uplink RBSym utilization percentage by frequency band"
                onClick={() => hasChartData(ulRbsymUtilizationData, ['900MHz', '3500MHz']) ? handleChartClick({  
                  title: getKpiDisplayName('ul_rbsym_utilization_pct'),
                  data: ulRbsymUtilizationData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: '%',
                  yAxisDomain: [0, 100]
                }) : null}
              >
                {hasChartData(ulRbsymUtilizationData, ['900MHz', '3500MHz']) ? (
                  <KPILineChart 
                    data={ulRbsymUtilizationData}
                    dataKeys={['900MHz', '3500MHz']}
                    colors={['#6b21a8', '#ec4899']}
                    yAxisLabel="%"
                    yAxisDomain={[0, 100]}
                  />
                ) : (
                  <NoDataWarning />
                )}
              </ChartCard>
            </div>
          </div>
          )}

          {/* Row 6: Percentage Unrestricted Volume DL | Percentage Unrestricted Volume UL */}
          {visibleSections >= 7 && (
            <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div>
              <ChartCard 
                title={getKpiDisplayName('percentage_unrestricted_volume_dl_pct')} 
                description="Percentage of unrestricted volume on downlink by frequency band"
                onClick={() => hasChartData(percentageUnrestrictedVolumeDlData, ['900MHz', '3500MHz']) ? handleChartClick({  
                  title: getKpiDisplayName('percentage_unrestricted_volume_dl_pct'),
                  data: percentageUnrestrictedVolumeDlData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: '%',
                  yAxisDomain: [0, 100]
                }) : null}
              >
                {hasChartData(percentageUnrestrictedVolumeDlData, ['900MHz', '3500MHz']) ? (
                  <KPILineChart 
                    data={percentageUnrestrictedVolumeDlData}
                    dataKeys={['900MHz', '3500MHz']}
                    colors={['#6b21a8', '#ec4899']}
                    yAxisLabel="%"
                    yAxisDomain={[0, 100]}
                  />
                ) : (
                  <NoDataWarning />
                )}
              </ChartCard>
            </div>

            <div>
              <ChartCard 
                title={getKpiDisplayName('percentage_unrestricted_volume_ul_pct')} 
                description="Percentage of unrestricted volume on uplink by frequency band"
                onClick={() => hasChartData(percentageUnrestrictedVolumeUlData, ['900MHz', '3500MHz']) ? handleChartClick({  
                  title: getKpiDisplayName('percentage_unrestricted_volume_ul_pct'),
                  data: percentageUnrestrictedVolumeUlData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: '%',
                  yAxisDomain: [0, 100]
                }) : null}
              >
                {hasChartData(percentageUnrestrictedVolumeUlData, ['900MHz', '3500MHz']) ? (
                  <KPILineChart 
                    data={percentageUnrestrictedVolumeUlData}
                    dataKeys={['900MHz', '3500MHz']}
                    colors={['#6b21a8', '#ec4899']}
                    yAxisLabel="%"
                    yAxisDomain={[0, 100]}
                  />
                ) : (
                  <NoDataWarning />
                )}
              </ChartCard>
            </div>
          </div>
          )}

          {/* Row 7: 5G User Data Traffic Volume DL | 5G User Data Traffic Volume UL */}
          {visibleSections >= 8 && (
            <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div>
              <ChartCard 
                title={getKpiDisplayName('user_data_traffic_volume_dl_gb')} 
                description="User data traffic volume on downlink by frequency band"
                onClick={() => hasChartData(userDataTrafficVolumeDlData, ['900MHz', '3500MHz']) ? handleChartClick({  
                  title: getKpiDisplayName('user_data_traffic_volume_dl_gb'),
                  data: userDataTrafficVolumeDlData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: 'GB',
                  yAxisDomain: [0, 800],
                  yAxisTicks: [0, 200, 400, 600, 800]
                }) : null}
              >
                {hasChartData(userDataTrafficVolumeDlData, ['900MHz', '3500MHz']) ? (
                  <KPILineChart
                    data={userDataTrafficVolumeDlData}
                    dataKeys={['900MHz', '3500MHz']}
                    colors={['#6b21a8', '#ec4899']}
                    yAxisLabel="GB"
                    yAxisDomain={[0, 800]}
                    yAxisTicks={[0, 200, 400, 600, 800]}
                  />
                ) : (
                  <NoDataWarning />
                )}
              </ChartCard>
            </div>

            <div>
              <ChartCard 
                title={getKpiDisplayName('user_data_traffic_volume_ul_gb')} 
                description="User data traffic volume on uplink by frequency band"
                onClick={() => hasChartData(userDataTrafficVolumeUlData, ['900MHz', '3500MHz']) ? handleChartClick({  
                  title: getKpiDisplayName('user_data_traffic_volume_ul_gb'),
                  data: userDataTrafficVolumeUlData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: 'GB',
                  yAxisDomain: [0, 80],
                  yAxisTicks: [0, 20, 40, 60, 80]
                }) : null}
              >
                {hasChartData(userDataTrafficVolumeUlData, ['900MHz', '3500MHz']) ? (
                  <KPILineChart 
                    data={userDataTrafficVolumeUlData}
                    dataKeys={['900MHz', '3500MHz']}
                    colors={['#6b21a8', '#ec4899']}
                    yAxisLabel="GB"
                    yAxisDomain={[0, 80]}
                    yAxisTicks={[0, 20, 40, 60, 80]}
                  />
                ) : (
                  <NoDataWarning />
                )}
              </ChartCard>
            </div>
          </div>
          )}

          {/* Row 8: Share of 5G Traffic Volume */}
          {visibleSections >= 9 && (
            <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div>
              <ChartCard 
                title="Share of 5G Traffic Volume (GB) per Frequency Band" 
                description="Total traffic volume (DL + UL) per frequency band aggregated by date"
                onClick={() => hasChartData(shareOf5gTrafficVolumeData, ['3500MHz', '900MHz']) ? handleChartClick({  
                  title: 'Share of 5G Traffic Volume (GB) per Frequency Band',
                  data: shareOf5gTrafficVolumeData,
                  dataKeys: ['3500MHz', '900MHz'],
                  colors: ['#2563eb', '#f97316'],
                  yAxisLabel: 'GB',
                  chartType: 'stackedBar'
                }) : null}
              >
                {hasChartData(shareOf5gTrafficVolumeData, ['3500MHz', '900MHz']) ? (
                  <StackedBarChart 
                    data={shareOf5gTrafficVolumeData}
                    dataKeys={['3500MHz', '900MHz']}
                    colors={['#2563eb', '#f97316']}
                    yAxisLabel="GB"
                    height={350}
                    yAxisDomain={[0, 16000]}
                    yAxisTicks={[0, 4000, 8000, 12000, 16000]}
                  />
                ) : (
                  <NoDataWarning />
                )}
              </ChartCard>
            </div>
            
            <div>
              <ChartCard 
                title={getKpiDisplayName('endc_total_traffic_volume_gb')} 
                description="Daily EN-DC traffic volume on LTE anchor cells"
                onClick={() => hasChartData(endcTrafficVolumeData, ['EN-DC Traffic']) ? handleChartClick({  
                  title: getKpiDisplayName('endc_total_traffic_volume_gb'),
                  data: endcTrafficVolumeData,
                  dataKeys: ['EN-DC Traffic'],
                  colors: ['#60a5fa'],
                  yAxisLabel: 'GB',
                  chartType: 'bar'
                }) : null}
              >
                {hasChartData(endcTrafficVolumeData, ['EN-DC Traffic']) ? (
                  <StackedBarChart 
                    data={endcTrafficVolumeData}
                    dataKeys={['EN-DC Traffic']}
                    colors={['#60a5fa']}
                    yAxisLabel="GB"
                    height={350}
                  />
                ) : (
                  <NoDataWarning />
                )}
              </ChartCard>
            </div>
          </div>
          )}

          {/* ============================================ */}
          {/* TOP Sites Section */}
          {/* ============================================ */}
          {visibleSections >= 10 && (
            <>
              <div className="content-header" style={{ marginTop: '3rem' }}>
                <h3 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '0.5rem' }}>
                  TOP Sites
                </h3>
                <p className="content-subtitle" style={{ fontSize: '0.875rem' }}>
                  Top 20 sites by traffic volume (DL + UL)
                </p>
              </div>

              {/* TOP Sites - All three in one row */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div className="top-sites-chart">
              <ChartCard 
                title="TOP Sites - Total (All Bands)" 
                description="Top 20 sites by total traffic volume across all frequency bands"
              >
                {weeklyTrafficLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                    Loading traffic data...
                  </div>
                ) : weeklyTrafficError ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>
                    Error loading traffic data: {weeklyTrafficError}
                  </div>
                ) : topSitesTotalData.length > 0 ? (
                  <HorizontalStackedBarChart 
                    data={topSitesTotalData}
                    dataKeys={['dl', 'ul']}
                    colors={['#3b82f6', '#22c55e']}
                    labels={['DL', 'UL']}
                    format={formatTrafficValue}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    No site traffic data available for the selected period
                  </div>
                )}
              </ChartCard>
            </div>

            <div className="top-sites-chart">
              <ChartCard 
                title="TOP Sites - TDD (3500MHz)" 
                description="Top 20 sites by traffic volume on 3500MHz (TDD) band"
              >
                {weeklyTrafficLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                    Loading...
                  </div>
                ) : weeklyTrafficError ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>
                    Error loading data
                  </div>
                ) : topSitesTddData.length > 0 ? (
                  <HorizontalStackedBarChart 
                    data={topSitesTddData}
                    dataKeys={['dl', 'ul']}
                    colors={['#2563eb', '#16a34a']}
                    labels={['DL', 'UL']}
                    format={formatTrafficValue}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    No TDD site traffic data available
                  </div>
                )}
              </ChartCard>
            </div>

            <div className="top-sites-chart">
              <ChartCard 
                title="TOP Sites - FDD (900MHz)" 
                description="Top 20 sites by traffic volume on 900MHz (FDD) band"
              >
                {weeklyTrafficLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                    Loading...
                  </div>
                ) : weeklyTrafficError ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>
                    Error loading data
                  </div>
                ) : topSitesFddData.length > 0 ? (
                  <HorizontalStackedBarChart 
                    data={topSitesFddData}
                    dataKeys={['dl', 'ul']}
                    colors={['#3b82f6', '#22c55e']}
                    labels={['DL', 'UL']}
                    format={formatTrafficValue}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    No FDD site traffic data available
                  </div>
                )}
              </ChartCard>
            </div>
          </div>
            </>
          )}
        </div>
      )}

      {/* Chart Modal for enlarged view */}
      {selectedChart && (
        <ChartModal
          isOpen={true}
          onClose={handleCloseModal}
          title={selectedChart.title}
          data={selectedChart.data}
          dataKeys={selectedChart.dataKeys}
          yAxisLabel={selectedChart.yAxisLabel}
          colors={selectedChart.colors}
          chartType={selectedChart.chartType || 'line'}
          yAxisDomain={selectedChart.yAxisDomain}
          yAxisTicks={selectedChart.yAxisTicks}
        />
      )}

      {!kpiLoading && !weeklyTrafficLoading && !endcTrafficLoading && !kpiError && !weeklyTrafficError && !endcTrafficError && kpiData.length === 0 && (
        <div className="no-data-message">
          <p>No NR data available</p>
          <p>Please import NR data using the sidebar or select a different date range.</p>
        </div>
      )}
    </div>
  );
};

export default NRReports;
