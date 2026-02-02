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
  
  // Local state for date range
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showWeekSelector, setShowWeekSelector] = useState(true);
  
  // Comparison mode state
  const [comparisonMode, setComparisonMode] = useState(false);

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

  // Initialize dates from selected week
  useEffect(() => {
    if (selectedWeek) {
      setStartDate(selectedWeek.monday.toISOString().split('T')[0]);
      setEndDate(selectedWeek.sunday.toISOString().split('T')[0]);
    }
  }, [selectedWeek]);

  const loadData = useCallback(async () => {
    try {
      await Promise.all([
        fetchKPIData(startDate, endDate),
        fetchWeeklyTrafficData(startDate, endDate)
      ]);
    } catch (error) {
      console.error('Error loading NR data:', error);
    }
  }, [startDate, endDate, fetchKPIData, fetchWeeklyTrafficData]);

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
  const scgRetainabilityActiveData = prepareScgRetainabilityActiveData();
  const scgRetainabilityOverallData = prepareScgRetainabilityOverallData();
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

  // Pre-calculate nice Y-axis domains for Traffic KPIs
  const avgDlMacDrbThroughputYMax = calculateNiceAxisMax(avgDlMacDrbThroughputData);
  const normalizedAvgDlMacCellThroughputTrafficYMax = calculateNiceAxisMax(normalizedAvgDlMacCellThroughputTrafficData);
  const normalizedDlMacCellThroughputActualPdschYMax = calculateNiceAxisMax(normalizedDlMacCellThroughputActualPdschData);
  const userDataTrafficVolumeDlYMax = calculateNiceAxisMax(userDataTrafficVolumeDlData);
  const avgUlMacUeThroughputYMax = calculateNiceAxisMax(avgUlMacUeThroughputData);
  const normalizedAvgUlMacCellThroughputSuccessfulPuschYMax = calculateNiceAxisMax(normalizedAvgUlMacCellThroughputSuccessfulPuschData);
  const normalizedAvgUlMacCellThroughputActualPuschYMax = calculateNiceAxisMax(normalizedAvgUlMacCellThroughputActualPuschData);
  const userDataTrafficVolumeUlYMax = calculateNiceAxisMax(userDataTrafficVolumeUlData);

  // Pre-calculate nice Y-axis domains for Accessibility & Mobility KPIs
  const scgRetainabilityEndcYMax = calculateNiceAxisMax(scgRetainabilityEndcData);
  const scgRetainabilityActiveYMax = calculateNiceAxisMax(scgRetainabilityActiveData);
  const scgRetainabilityOverallYMax = calculateNiceAxisMax(scgRetainabilityOverallData);

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

      {(kpiLoading || weeklyTrafficLoading) && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>
            Loading NR data...
            {kpiLoading && weeklyTrafficLoading && ' (KPI & Traffic)'}
            {kpiLoading && !weeklyTrafficLoading && ' (KPI)'}
            {!kpiLoading && weeklyTrafficLoading && ' (Traffic)'}
          </p>
        </div>
      )}

      {(kpiError || weeklyTrafficError) && (
        <div className="error-message">
          {kpiError && <p>Error loading KPI data: {kpiError}</p>}
          {weeklyTrafficError && <p>Error loading traffic data: {weeklyTrafficError}</p>}
        </div>
      )}

      {!kpiLoading && !weeklyTrafficLoading && !kpiError && !weeklyTrafficError && kpiData.length > 0 && (
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
                title="Partial Cell Availability for gNodeB Cell (%)" 
                description="Cell availability percentage by frequency band"
                onClick={() => handleChartClick({  
                  title: 'Partial Cell Availability for gNodeB Cell (%)',
                  data: partialCellAvailabilityData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: '%',
                  yAxisDomain: [90, 100]
                })}
              >
                <KPILineChart 
                  data={partialCellAvailabilityData}
                  dataKeys={['900MHz', '3500MHz']}
                  colors={['#6b21a8', '#ec4899']}
                  yAxisLabel="%"
                  yAxisDomain={[90, 100]}
                />
              </ChartCard>
            </div>

            <div>
              <ChartCard 
                title="Random Access Success Rate (%)" 
                description="Random access success rate by frequency band"
                onClick={() => handleChartClick({  
                  title: 'Random Access Success Rate (%)',
                  data: randomAccessSuccessRateData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: '%',
                  yAxisDomain: [90, 100]
                })}
              >
                <KPILineChart 
                  data={randomAccessSuccessRateData}
                  dataKeys={['900MHz', '3500MHz']}
                  colors={['#6b21a8', '#ec4899']}
                  yAxisLabel="%"
                  yAxisDomain={[90, 100]}
                />
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
                title="UE Context Setup Success Rate (%)" 
                description="UE context setup success rate by frequency band"
                onClick={() => handleChartClick({  
                  title: 'UE Context Setup Success Rate (%)',
                  data: ueContextSetupSuccessRateData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: '%',
                  yAxisDomain: [90, 100]
                })}
              >
                <KPILineChart 
                  data={ueContextSetupSuccessRateData}
                  dataKeys={['900MHz', '3500MHz']}
                  colors={['#6b21a8', '#ec4899']}
                  yAxisLabel="%"
                  yAxisDomain={[90, 100]}
                />
              </ChartCard>
            </div>

            <div>
            <ChartCard 
              title="EN-DC Setup Success Rate (%)" 
              description="5G connection establishment success rate by frequency band"
              onClick={() => handleChartClick({
                title: 'EN-DC Setup Success Rate (%)',
                data: setupSuccessRateData,
                dataKeys: ['900MHz', '3500MHz'],
                colors: ['#6b21a8', '#ec4899'],
                yAxisLabel: '%',
                yAxisDomain: ['autoFloorMinus1', 100],
                yAxisTicks: setupSuccessRateTicks
              })}
            >
              <KPILineChart 
                data={setupSuccessRateData}
                dataKeys={['900MHz', '3500MHz']}
                colors={['#6b21a8', '#ec4899']}
                yAxisLabel="%"
                yAxisDomain={['autoFloorMinus1', 100]}
                yAxisTicks={setupSuccessRateTicks}
              />
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
              title="EN-DC Inter-sgNodeB PSCell Change Success Rate (%)" 
              description="5G inter-gNodeB PSCell change success rate by frequency band"
              onClick={() => handleChartClick({
                title: 'EN-DC Inter-sgNodeB PSCell Change Success Rate (%)',
                data: interPsCellChangeData,
                dataKeys: ['900MHz', '3500MHz'],
                colors: ['#6b21a8', '#ec4899'],
                yAxisLabel: '%',
                yAxisDomain: interPsCellChangeTicks ? [interPsCellChangeTicks[0], 100] : [0, 100],
                yAxisTicks: interPsCellChangeTicks
              })}
            >
              <KPILineChart 
                data={interPsCellChangeData}
                dataKeys={['900MHz', '3500MHz']}
                colors={['#6b21a8', '#ec4899']}
                yAxisLabel="%"
                yAxisDomain={interPsCellChangeTicks ? [interPsCellChangeTicks[0], 100] : [0, 100]}
                yAxisTicks={interPsCellChangeTicks}
              />
            </ChartCard>
            </div>

            <div>
            <ChartCard 
              title="SCG Active Radio Resource Retainability considering EN-DC connectivity (%)" 
              description="SCG retainability considering EN-DC connectivity by frequency band"
              onClick={() => handleChartClick({
                title: 'SCG Active Radio Resource Retainability considering EN-DC connectivity (%)',
                data: scgRetainabilityEndcData,
                dataKeys: ['900MHz', '3500MHz'],
                colors: ['#6b21a8', '#ec4899'],
                yAxisLabel: '%',
                yAxisDomain: [0, scgRetainabilityEndcYMax]
              })}
            >
              <KPILineChart 
                data={scgRetainabilityEndcData}
                dataKeys={['900MHz', '3500MHz']}
                colors={['#6b21a8', '#ec4899']}
                yAxisLabel="%"
                yAxisDomain={[0, scgRetainabilityEndcYMax]}
              />
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
              title="SCG Active Radio Resource Retainability (%)" 
              description="SCG active radio resource retainability by frequency band"
              onClick={() => handleChartClick({
                title: 'SCG Active Radio Resource Retainability (%)',
                data: scgRetainabilityActiveData,
                dataKeys: ['900MHz', '3500MHz'],
                colors: ['#6b21a8', '#ec4899'],
                yAxisLabel: '%',
                yAxisDomain: [0, scgRetainabilityActiveYMax]
              })}
            >
              <KPILineChart 
                data={scgRetainabilityActiveData}
                dataKeys={['900MHz', '3500MHz']}
                colors={['#6b21a8', '#ec4899']}
                yAxisLabel="%"
                yAxisDomain={[0, scgRetainabilityActiveYMax]}
              />
            </ChartCard>
            </div>

            <div>
            <ChartCard 
              title="SCG Radio Resource Retainability (%)" 
              description="Overall SCG radio resource retainability by frequency band"
              onClick={() => handleChartClick({
                title: 'SCG Radio Resource Retainability (%)',
                data: scgRetainabilityOverallData,
                dataKeys: ['900MHz', '3500MHz'],
                colors: ['#6b21a8', '#ec4899'],
                yAxisLabel: '%',
                yAxisDomain: [0, scgRetainabilityOverallYMax]
              })}
            >
              <KPILineChart 
                data={scgRetainabilityOverallData}
                dataKeys={['900MHz', '3500MHz']}
                colors={['#6b21a8', '#ec4899']}
                yAxisLabel="%"
                yAxisDomain={[0, scgRetainabilityOverallYMax]}
              />
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
              title="Peak RRC Connected Users" 
              description="Peak number of NR EN-DC RRC connected users by frequency band"
              onClick={() => handleChartClick({
                title: 'Peak RRC Connected Users',
                data: peakRrcConnectedUsersData,
                dataKeys: ['900MHz', '3500MHz'],
                colors: ['#6b21a8', '#ec4899'],
                yAxisLabel: 'Users',
                chartType: 'stackedArea'
              })}
            >
              <NRRrcUsersStackedAreaChart 
                data={peakRrcConnectedUsersData}
                height={350}
                title="Peak RRC Connected Users"
              />
            </ChartCard>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <ChartCard 
              title="Average RRC Connected Users" 
              description="Average NR EN-DC RRC connected users by frequency band"
              onClick={() => handleChartClick({
                title: 'Average RRC Connected Users',
                data: avgRrcConnectedUsersData,
                dataKeys: ['900MHz', '3500MHz'],
                colors: ['#6b21a8', '#ec4899'],
                yAxisLabel: 'Users',
                chartType: 'stackedArea'
              })}
            >
              <NRRrcUsersStackedAreaChart 
                data={avgRrcConnectedUsersData}
                height={350}
                title="Average RRC Connected Users"
              />
            </ChartCard>
          </div>

          {/* ============================================ */}
          {/* Traffic & Integrity Section */}
          {/* ============================================ */}
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
                title="Average DL MAC DRB Throughput (Mbps)" 
                description="Average downlink MAC DRB throughput by frequency band"
                onClick={() => handleChartClick({  
                  title: 'Average DL MAC DRB Throughput (Mbps)',
                  data: avgDlMacDrbThroughputData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: 'Mbps',
                  yAxisDomain: [0, avgDlMacDrbThroughputYMax]
                })}
              >
                <KPILineChart 
                  data={avgDlMacDrbThroughputData}
                  dataKeys={['900MHz', '3500MHz']}
                  colors={['#6b21a8', '#ec4899']}
                  yAxisLabel="Mbps"
                  yAxisDomain={[0, avgDlMacDrbThroughputYMax]}
                />
              </ChartCard>
            </div>

            <div>
              <ChartCard 
                title="Normalized Average DL MAC Cell Throughput Considering Traffic (Mbps)" 
                description="Normalized average DL MAC cell throughput by frequency band"
                onClick={() => handleChartClick({  
                  title: 'Normalized Average DL MAC Cell Throughput Considering Traffic (Mbps)',
                  data: normalizedAvgDlMacCellThroughputTrafficData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: 'Mbps',
                  yAxisDomain: [0, normalizedAvgDlMacCellThroughputTrafficYMax]
                })}
              >
                <KPILineChart 
                  data={normalizedAvgDlMacCellThroughputTrafficData}
                  dataKeys={['900MHz', '3500MHz']}
                  colors={['#6b21a8', '#ec4899']}
                  yAxisLabel="Mbps"
                  yAxisDomain={[0, normalizedAvgDlMacCellThroughputTrafficYMax]}
                />
              </ChartCard>
            </div>
          </div>

          {/* Row 2: Normalized DL MAC Cell Throughput Actual PDSCH | PDSCH Slot Utilization */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div>
              <ChartCard 
                title="Normalized DL MAC Cell Throughput Captured in gNodeB Considering Actual PDSCH Slot Only (Mbps)" 
                description="Normalized DL MAC cell throughput for actual PDSCH slots"
                onClick={() => handleChartClick({  
                  title: 'Normalized DL MAC Cell Throughput Captured in gNodeB Considering Actual PDSCH Slot Only (Mbps)',
                  data: normalizedDlMacCellThroughputActualPdschData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: 'Mbps',
                  yAxisDomain: [0, normalizedDlMacCellThroughputActualPdschYMax]
                })}
              >
                <KPILineChart 
                  data={normalizedDlMacCellThroughputActualPdschData}
                  dataKeys={['900MHz', '3500MHz']}
                  colors={['#6b21a8', '#ec4899']}
                  yAxisLabel="Mbps"
                  yAxisDomain={[0, normalizedDlMacCellThroughputActualPdschYMax]}
                />
              </ChartCard>
            </div>

            <div>
              <ChartCard 
                title="PDSCH Slot Utilization (%)" 
                description="PDSCH slot utilization percentage by frequency band"
                onClick={() => handleChartClick({  
                  title: 'PDSCH Slot Utilization (%)',
                  data: pdschSlotUtilizationData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: '%',
                  yAxisDomain: [0, 100]
                })}
              >
                <KPILineChart 
                  data={pdschSlotUtilizationData}
                  dataKeys={['900MHz', '3500MHz']}
                  colors={['#6b21a8', '#ec4899']}
                  yAxisLabel="%"
                  yAxisDomain={[0, 100]}
                />
              </ChartCard>
            </div>
          </div>

          {/* Row 3: DL RBSym Utilization | Percentage Unrestricted Volume DL */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div>
              <ChartCard 
                title="DL RBSym Utilization (%)" 
                description="Downlink RBSym utilization percentage by frequency band"
                onClick={() => handleChartClick({  
                  title: 'DL RBSym Utilization (%)',
                  data: dlRbsymUtilizationData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: '%',
                  yAxisDomain: [0, 100]
                })}
              >
                <KPILineChart 
                  data={dlRbsymUtilizationData}
                  dataKeys={['900MHz', '3500MHz']}
                  colors={['#6b21a8', '#ec4899']}
                  yAxisLabel="%"
                  yAxisDomain={[0, 100]}
                />
              </ChartCard>
            </div>

            <div>
              <ChartCard 
                title="Percentage Unrestricted Volume DL (%)" 
                description="Percentage of unrestricted volume on downlink by frequency band"
                onClick={() => handleChartClick({  
                  title: 'Percentage Unrestricted Volume DL (%)',
                  data: percentageUnrestrictedVolumeDlData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: '%',
                  yAxisDomain: [0, 100]
                })}
              >
                <KPILineChart 
                  data={percentageUnrestrictedVolumeDlData}
                  dataKeys={['900MHz', '3500MHz']}
                  colors={['#6b21a8', '#ec4899']}
                  yAxisLabel="%"
                  yAxisDomain={[0, 100]}
                />
              </ChartCard>
            </div>
          </div>

          {/* Row 4: 5G User Data Traffic Volume DL | Average UL MAC UE Throughput */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div>
              <ChartCard 
                title="5G User Data Traffic Volume on Downlink (GB)" 
                description="User data traffic volume on downlink by frequency band"
                onClick={() => handleChartClick({  
                  title: '5G User Data Traffic Volume on Downlink (GB)',
                  data: userDataTrafficVolumeDlData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: 'GB',
                  yAxisDomain: [0, userDataTrafficVolumeDlYMax]
                })}
              >
                <KPILineChart 
                  data={userDataTrafficVolumeDlData}
                  dataKeys={['900MHz', '3500MHz']}
                  colors={['#6b21a8', '#ec4899']}
                  yAxisLabel="GB"
                  yAxisDomain={[0, userDataTrafficVolumeDlYMax]}
                />
              </ChartCard>
            </div>

            <div>
              <ChartCard 
                title="Average UL MAC UE Throughput (Mbps)" 
                description="Average uplink MAC UE throughput by frequency band"
                onClick={() => handleChartClick({  
                  title: 'Average UL MAC UE Throughput (Mbps)',
                  data: avgUlMacUeThroughputData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: 'Mbps',
                  yAxisDomain: [0, avgUlMacUeThroughputYMax]
                })}
              >
                <KPILineChart 
                  data={avgUlMacUeThroughputData}
                  dataKeys={['900MHz', '3500MHz']}
                  colors={['#6b21a8', '#ec4899']}
                  yAxisLabel="Mbps"
                  yAxisDomain={[0, avgUlMacUeThroughputYMax]}
                />
              </ChartCard>
            </div>
          </div>

          {/* Row 5: Normalized UL MAC Cell Throughput Successful PUSCH | Normalized UL MAC Cell Throughput Actual PUSCH */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div>
              <ChartCard 
                title="Normalized Average UL MAC Cell Throughput Captured in gNodeB Considering Successful PUSCH Slot Only (Mbps)" 
                description="Normalized average UL MAC cell throughput for successful PUSCH slots"
                onClick={() => handleChartClick({  
                  title: 'Normalized Average UL MAC Cell Throughput Captured in gNodeB Considering Successful PUSCH Slot Only (Mbps)',
                  data: normalizedAvgUlMacCellThroughputSuccessfulPuschData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: 'Mbps',
                  yAxisDomain: [0, normalizedAvgUlMacCellThroughputSuccessfulPuschYMax]
                })}
              >
                <KPILineChart 
                  data={normalizedAvgUlMacCellThroughputSuccessfulPuschData}
                  dataKeys={['900MHz', '3500MHz']}
                  colors={['#6b21a8', '#ec4899']}
                  yAxisLabel="Mbps"
                  yAxisDomain={[0, normalizedAvgUlMacCellThroughputSuccessfulPuschYMax]}
                />
              </ChartCard>
            </div>

            <div>
              <ChartCard 
                title="Normalized Average UL MAC Cell Throughput Captured in gNodeB Considering Actual PUSCH Slot Only (Mbps)" 
                description="Normalized average UL MAC cell throughput for actual PUSCH slots"
                onClick={() => handleChartClick({  
                  title: 'Normalized Average UL MAC Cell Throughput Captured in gNodeB Considering Actual PUSCH Slot Only (Mbps)',
                  data: normalizedAvgUlMacCellThroughputActualPuschData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: 'Mbps',
                  yAxisDomain: [0, normalizedAvgUlMacCellThroughputActualPuschYMax]
                })}
              >
                <KPILineChart 
                  data={normalizedAvgUlMacCellThroughputActualPuschData}
                  dataKeys={['900MHz', '3500MHz']}
                  colors={['#6b21a8', '#ec4899']}
                  yAxisLabel="Mbps"
                  yAxisDomain={[0, normalizedAvgUlMacCellThroughputActualPuschYMax]}
                />
              </ChartCard>
            </div>
          </div>

          {/* Row 6: PUSCH Slot Utilization | UL RBSym Utilization */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div>
              <ChartCard 
                title="PUSCH Slot Utilization (%)" 
                description="PUSCH slot utilization percentage by frequency band"
                onClick={() => handleChartClick({  
                  title: 'PUSCH Slot Utilization (%)',
                  data: puschSlotUtilizationData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: '%',
                  yAxisDomain: [0, 100]
                })}
              >
                <KPILineChart 
                  data={puschSlotUtilizationData}
                  dataKeys={['900MHz', '3500MHz']}
                  colors={['#6b21a8', '#ec4899']}
                  yAxisLabel="%"
                  yAxisDomain={[0, 100]}
                />
              </ChartCard>
            </div>

            <div>
              <ChartCard 
                title="UL RBSym Utilization (%)" 
                description="Uplink RBSym utilization percentage by frequency band"
                onClick={() => handleChartClick({  
                  title: 'UL RBSym Utilization (%)',
                  data: ulRbsymUtilizationData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: '%',
                  yAxisDomain: [0, 100]
                })}
              >
                <KPILineChart 
                  data={ulRbsymUtilizationData}
                  dataKeys={['900MHz', '3500MHz']}
                  colors={['#6b21a8', '#ec4899']}
                  yAxisLabel="%"
                  yAxisDomain={[0, 100]}
                />
              </ChartCard>
            </div>
          </div>

          {/* Row 7: Percentage Unrestricted Volume UL | 5G User Data Traffic Volume UL */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div>
              <ChartCard 
                title="Percentage Unrestricted Volume UL (%)" 
                description="Percentage of unrestricted volume on uplink by frequency band"
                onClick={() => handleChartClick({  
                  title: 'Percentage Unrestricted Volume UL (%)',
                  data: percentageUnrestrictedVolumeUlData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: '%',
                  yAxisDomain: [0, 100]
                })}
              >
                <KPILineChart 
                  data={percentageUnrestrictedVolumeUlData}
                  dataKeys={['900MHz', '3500MHz']}
                  colors={['#6b21a8', '#ec4899']}
                  yAxisLabel="%"
                  yAxisDomain={[0, 100]}
                />
              </ChartCard>
            </div>

            <div>
              <ChartCard 
                title="5G User Data Traffic Volume on Uplink (GB)" 
                description="User data traffic volume on uplink by frequency band"
                onClick={() => handleChartClick({  
                  title: '5G User Data Traffic Volume on Uplink (GB)',
                  data: userDataTrafficVolumeUlData,
                  dataKeys: ['900MHz', '3500MHz'],
                  colors: ['#6b21a8', '#ec4899'],
                  yAxisLabel: 'GB',
                  yAxisDomain: [0, userDataTrafficVolumeUlYMax]
                })}
              >
                <KPILineChart 
                  data={userDataTrafficVolumeUlData}
                  dataKeys={['900MHz', '3500MHz']}
                  colors={['#6b21a8', '#ec4899']}
                  yAxisLabel="GB"
                  yAxisDomain={[0, userDataTrafficVolumeUlYMax]}
                />
              </ChartCard>
            </div>
          </div>

          {/* Row 8: Share of 5G Traffic Volume */}
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
                onClick={() => handleChartClick({  
                  title: 'Share of 5G Traffic Volume (GB) per Frequency Band',
                  data: shareOf5gTrafficVolumeData,
                  dataKeys: ['3500MHz', '900MHz'],
                  colors: ['#2563eb', '#f97316'],
                  yAxisLabel: 'GB',
                  chartType: 'stackedBar'
                })}
              >
                <StackedBarChart 
                  data={shareOf5gTrafficVolumeData}
                  dataKeys={['3500MHz', '900MHz']}
                  colors={['#2563eb', '#f97316']}
                  yAxisLabel="GB"
                  height={350}
                />
              </ChartCard>
            </div>
          </div>

          {/* ============================================ */}
          {/* TOP Sites Section */}
          {/* ============================================ */}
          <div className="content-header" style={{ marginTop: '3rem' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#1f2937', marginBottom: '0.5rem' }}>
              TOP Sites
            </h3>
            <p className="content-subtitle" style={{ fontSize: '0.875rem' }}>
              Top 20 sites by traffic volume (DL + UL)
            </p>
          </div>

          {/* TOP Sites - Total */}
          <div style={{ marginTop: '1.5rem' }}>
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

          {/* TOP Sites - TDD and FDD side by side */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div>
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

            <div>
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
                    colors={['#f97316', '#eab308']}
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

      {!kpiLoading && !weeklyTrafficLoading && !kpiError && !weeklyTrafficError && kpiData.length === 0 && (
        <div className="no-data-message">
          <p>No NR data available</p>
          <p>Please import NR data using the sidebar or select a different date range.</p>
        </div>
      )}
    </div>
  );
};

export default NRReports;
