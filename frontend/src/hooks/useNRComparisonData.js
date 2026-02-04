import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * NR KPI definitions with database column names and display labels
 * Organized in 3 sections matching NRReports.js
 */
export const NR_KPI_OPTIONS = [
  // =============================================
  // Section 1: 5G NR Accessibility & Mobility KPI's
  // =============================================
  { 
    id: 'partial_cell_availability_pct', 
    label: 'Partial Cell Availability for gNodeB Cell (%)', 
    column: 'partial_cell_availability_pct',
    yAxisLabel: '%',
    category: '5G NR Accessibility & Mobility KPIs'
  },
  { 
    id: 'random_access_success_rate_pct', 
    label: 'Random Access Success Rate (%)', 
    column: 'random_access_success_rate_pct',
    yAxisLabel: '%',
    category: '5G NR Accessibility & Mobility KPIs'
  },
  { 
    id: 'ue_context_setup_success_rate_pct', 
    label: 'UE Context Setup Success Rate (%)', 
    column: 'ue_context_setup_success_rate_pct',
    yAxisLabel: '%',
    category: '5G NR Accessibility & Mobility KPIs'
  },
  { 
    id: 'endc_setup_success_rate', 
    label: 'EN-DC Setup Success Rate (%)', 
    column: 'endc_setup_success_rate',
    yAxisLabel: '%',
    category: '5G NR Accessibility & Mobility KPIs'
  },
  { 
    id: 'endc_inter_pscell_change_success_rate', 
    label: 'EN-DC Inter-sgNodeB PSCell Change Success Rate (%)', 
    column: 'endc_inter_pscell_change_success_rate',
    yAxisLabel: '%',
    category: '5G NR Accessibility & Mobility KPIs'
  },
  { 
    id: 'scg_retainability_endc_connectivity', 
    label: 'SCG Active Radio Resource Retainability considering EN-DC connectivity (%)', 
    column: 'scg_retainability_endc_connectivity',
    yAxisLabel: '%',
    category: '5G NR Accessibility & Mobility KPIs'
  },
  { 
    id: 'scg_retainability_active', 
    label: 'SCG Active Radio Resource Retainability (%)', 
    column: 'scg_retainability_active',
    yAxisLabel: '%',
    category: '5G NR Accessibility & Mobility KPIs'
  },
  { 
    id: 'scg_retainability_overall', 
    label: 'SCG Radio Resource Retainability (%)', 
    column: 'scg_retainability_overall',
    yAxisLabel: '%',
    category: '5G NR Accessibility & Mobility KPIs'
  },
  { 
    id: 'peak_rrc_connected_users', 
    label: 'Peak RRC Connected Users', 
    column: 'peak_rrc_connected_users',
    yAxisLabel: 'Users',
    category: '5G NR Accessibility & Mobility KPIs'
  },
  { 
    id: 'avg_rrc_connected_users', 
    label: 'Average RRC Connected Users', 
    column: 'avg_rrc_connected_users',
    yAxisLabel: 'Users',
    category: '5G NR Accessibility & Mobility KPIs'
  },

  // =============================================
  // Section 2: Traffic & Integrity
  // =============================================
  { 
    id: 'avg_dl_mac_drb_throughput_mbps', 
    label: 'Average DL MAC DRB Throughput (Mbps)', 
    column: 'avg_dl_mac_drb_throughput_mbps',
    yAxisLabel: 'Mbps',
    category: 'Traffic & Integrity'
  },
  { 
    id: 'normalized_avg_dl_mac_cell_throughput_traffic_mbps', 
    label: 'Normalized Average DL MAC Cell Throughput Considering Traffic (Mbps)', 
    column: 'normalized_avg_dl_mac_cell_throughput_traffic_mbps',
    yAxisLabel: 'Mbps',
    category: 'Traffic & Integrity'
  },
  { 
    id: 'normalized_dl_mac_cell_throughput_actual_pdsch_mbps', 
    label: 'Normalized DL MAC Cell Throughput Considering Actual PDSCH Slot Only (Mbps)', 
    column: 'normalized_dl_mac_cell_throughput_actual_pdsch_mbps',
    yAxisLabel: 'Mbps',
    category: 'Traffic & Integrity'
  },
  { 
    id: 'pdsch_slot_utilization_pct', 
    label: 'PDSCH Slot Utilization (%)', 
    column: 'pdsch_slot_utilization_pct',
    yAxisLabel: '%',
    category: 'Traffic & Integrity'
  },
  { 
    id: 'dl_rbsym_utilization_pct', 
    label: 'DL RBSym Utilization (%)', 
    column: 'dl_rbsym_utilization_pct',
    yAxisLabel: '%',
    category: 'Traffic & Integrity'
  },
  { 
    id: 'percentage_unrestricted_volume_dl_pct', 
    label: 'Percentage Unrestricted Volume DL (%)', 
    column: 'percentage_unrestricted_volume_dl_pct',
    yAxisLabel: '%',
    category: 'Traffic & Integrity'
  },
  { 
    id: 'user_data_traffic_volume_dl_gb', 
    label: '5G User Data Traffic Volume on Downlink (GB)', 
    column: 'user_data_traffic_volume_dl_gb',
    yAxisLabel: 'GB',
    category: 'Traffic & Integrity'
  },
  { 
    id: 'avg_ul_mac_ue_throughput_mbps', 
    label: 'Average UL MAC UE Throughput (Mbps)', 
    column: 'avg_ul_mac_ue_throughput_mbps',
    yAxisLabel: 'Mbps',
    category: 'Traffic & Integrity'
  },
  { 
    id: 'normalized_avg_ul_mac_cell_throughput_successful_pusch_mbps', 
    label: 'Normalized Average UL MAC Cell Throughput Considering Successful PUSCH Slot Only (Mbps)', 
    column: 'normalized_avg_ul_mac_cell_throughput_successful_pusch_mbps',
    yAxisLabel: 'Mbps',
    category: 'Traffic & Integrity'
  },
  { 
    id: 'normalized_avg_ul_mac_cell_throughput_actual_pusch_mbps', 
    label: 'Normalized Average UL MAC Cell Throughput Considering Actual PUSCH Slot Only (Mbps)', 
    column: 'normalized_avg_ul_mac_cell_throughput_actual_pusch_mbps',
    yAxisLabel: 'Mbps',
    category: 'Traffic & Integrity'
  },
  { 
    id: 'pusch_slot_utilization_pct', 
    label: 'PUSCH Slot Utilization (%)', 
    column: 'pusch_slot_utilization_pct',
    yAxisLabel: '%',
    category: 'Traffic & Integrity'
  },
  { 
    id: 'ul_rbsym_utilization_pct', 
    label: 'UL RBSym Utilization (%)', 
    column: 'ul_rbsym_utilization_pct',
    yAxisLabel: '%',
    category: 'Traffic & Integrity'
  },
  { 
    id: 'percentage_unrestricted_volume_ul_pct', 
    label: 'Percentage Unrestricted Volume UL (%)', 
    column: 'percentage_unrestricted_volume_ul_pct',
    yAxisLabel: '%',
    category: 'Traffic & Integrity'
  },
  { 
    id: 'user_data_traffic_volume_ul_gb', 
    label: '5G User Data Traffic Volume on Uplink (GB)', 
    column: 'user_data_traffic_volume_ul_gb',
    yAxisLabel: 'GB',
    category: 'Traffic & Integrity'
  },
  { 
    id: 'share_5g_traffic_volume', 
    label: 'Share of 5G Traffic Volume (GB) per Frequency Band', 
    column: 'share_5g_traffic_volume',
    yAxisLabel: 'GB',
    category: 'Traffic & Integrity'
  },
  { 
    id: 'endc_lte_traffic', 
    label: 'Amount of Traffic (GB) generated by 5G Users on LTE RAN', 
    column: 'total_gb',
    yAxisLabel: 'GB',
    category: 'Traffic & Integrity'
  },

  // =============================================
  // Section 3: TOP Sites
  // ==============================================
  { 
    id: 'top_sites_total', 
    label: 'TOP Sites - Total (All Bands)', 
    column: 'top_sites_total',
    yAxisLabel: 'GB',
    category: 'TOP Sites'
  },
  { 
    id: 'top_sites_tdd', 
    label: 'TOP Sites - TDD (3500MHz)', 
    column: 'top_sites_tdd',
    yAxisLabel: 'GB',
    category: 'TOP Sites'
  },
  { 
    id: 'top_sites_fdd', 
    label: 'TOP Sites - FDD (900MHz)', 
    column: 'top_sites_fdd',
    yAxisLabel: 'GB',
    category: 'TOP Sites'
  },
];

/**
 * Get auth header with token
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Format hourly data for comparison with normalized day labels
 */
const formatComparisonData = (data, columnName, freqBand, week1Label, week2Label, isWeek1) => {
  // Filter data for the specific frequency band
  const filteredData = data.filter(item => item.freq_band === freqBand);
  
  // Sort by date and hour
  const sortedData = [...filteredData].sort((a, b) => {
    const dateA = new Date(`${a.date_id}T${String(a.hour_id).padStart(2, '0')}:00:00`);
    const dateB = new Date(`${b.date_id}T${String(b.hour_id).padStart(2, '0')}:00:00`);
    return dateA - dateB;
  });

  const firstDate = sortedData.length > 0 ? new Date(sortedData[0].date_id) : null;
  
  return sortedData.map(item => {
    const itemDate = new Date(item.date_id);
    const dayDiff = Math.floor((itemDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;
    const dayNames = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayName = dayNames[dayDiff] || `Day${dayDiff}`;
    const hourStr = String(item.hour_id).padStart(2, '0');
    
    const result = {
      name: `${dayName} ${hourStr}:00`,
      dayIndex: dayDiff,
      hour: item.hour_id
    };
    
    // Add value with week label as key
    const value = parseFloat(item[columnName]);
    if (isWeek1) {
      result[week1Label] = isNaN(value) ? null : value;
    } else {
      result[week2Label] = isNaN(value) ? null : value;
    }
    
    return result;
  });
};

/**
 * Merge week1 and week2 data into single array for chart
 */
const mergeWeekData = (week1Data, week2Data, week1Label, week2Label) => {
  // Create a map for week1 data by name (day + hour)
  const dataMap = {};
  
  week1Data.forEach(item => {
    dataMap[item.name] = { ...item };
  });
  
  // Merge week2 data
  week2Data.forEach(item => {
    if (dataMap[item.name]) {
      dataMap[item.name][week2Label] = item[week2Label];
    } else {
      dataMap[item.name] = { ...item };
    }
  });
  
  // Sort by day index and hour
  return Object.values(dataMap).sort((a, b) => {
    if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
    return a.hour - b.hour;
  });
};

/**
 * Custom hook for NR comparison data
 */
export const useNRComparisonData = () => {
  const [comparisonData, setComparisonData] = useState({});
  const [siteTrafficComparison, setSiteTrafficComparison] = useState({ top20: [], bottom20: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [week1Label, setWeek1Label] = useState('');
  const [week2Label, setWeek2Label] = useState('');

  const fetchComparisonData = useCallback(async (week1, week2, selectedKPIs, includeSiteTraffic = false) => {
    console.log('fetchComparisonData called with:', { week1, week2, selectedKPIs, includeSiteTraffic });
    
    if (!week1 || !week2 || (selectedKPIs.length === 0 && !includeSiteTraffic)) {
      console.log('Early return - conditions not met');
      setComparisonData({});
      setSiteTrafficComparison({ top20: [], bottom20: [] });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Set week labels
      const w1Label = week1.label || 'Week 1';
      const w2Label = week2.label || 'Week 2';
      setWeek1Label(w1Label);
      setWeek2Label(w2Label);

      // Fetch data for both weeks
      const week1Start = week1.monday.toISOString().split('T')[0];
      const week1End = week1.sunday.toISOString().split('T')[0];
      const week2Start = week2.monday.toISOString().split('T')[0];
      const week2End = week2.sunday.toISOString().split('T')[0];

      // Determine which endpoints to call based on selected KPIs
      // KPIs from nr_kpi_data table (EN-DC related and RRC connected users)
      const nrKpiDataColumns = ['endc_setup_success_rate', 'endc_inter_pscell_change_success_rate', 
        'scg_retainability_endc_connectivity', 'scg_retainability_active', 'scg_retainability_overall',
        'peak_rrc_connected_users', 'avg_rrc_connected_users'];
      
      // EN-DC LTE Traffic KPI (separate endpoint)
      const needsEndcLteTraffic = selectedKPIs.includes('endc_lte_traffic');
      
      // KPIs from nr_kpi_hourly_by_band table (cell level KPIs)
      const nrCellKpiColumns = ['partial_cell_availability_pct', 'random_access_success_rate_pct', 
        'ue_context_setup_success_rate_pct',
        'avg_dl_mac_drb_throughput_mbps', 'normalized_avg_dl_mac_cell_throughput_traffic_mbps',
        'normalized_dl_mac_cell_throughput_actual_pdsch_mbps', 'pdsch_slot_utilization_pct',
        'dl_rbsym_utilization_pct', 'percentage_unrestricted_volume_dl_pct', 'user_data_traffic_volume_dl_gb',
        'avg_ul_mac_ue_throughput_mbps', 'normalized_avg_ul_mac_cell_throughput_successful_pusch_mbps',
        'normalized_avg_ul_mac_cell_throughput_actual_pusch_mbps', 'pusch_slot_utilization_pct',
        'ul_rbsym_utilization_pct', 'percentage_unrestricted_volume_ul_pct', 'user_data_traffic_volume_ul_gb',
        'share_5g_traffic_volume'];

      // TOP Sites KPIs (need site traffic data)
      const topSitesKpiColumns = ['top_sites_total', 'top_sites_tdd', 'top_sites_fdd'];

      const needsNrKpiData = selectedKPIs.some(kpi => nrKpiDataColumns.includes(kpi));
      const needsNrCellKpiData = selectedKPIs.some(kpi => nrCellKpiColumns.includes(kpi));
      const needsTopSitesData = selectedKPIs.some(kpi => topSitesKpiColumns.includes(kpi));
      
      // Site traffic is needed for site traffic comparison OR for TOP Sites KPIs
      const needsSiteTrafficData = includeSiteTraffic || needsTopSitesData;

      // Build promises array
      const promises = [];
      
      if (needsNrKpiData) {
        promises.push(
          axios.get(API_ENDPOINTS.nr.data, {
            params: { startDate: week1Start, endDate: week1End },
            headers: getAuthHeaders()
          }),
          axios.get(API_ENDPOINTS.nr.data, {
            params: { startDate: week2Start, endDate: week2End },
            headers: getAuthHeaders()
          })
        );
      }
      
      if (needsNrCellKpiData) {
        promises.push(
          axios.get(API_ENDPOINTS.nrCell.kpiHourly, {
            params: { startDate: week1Start, endDate: week1End },
            headers: getAuthHeaders()
          }),
          axios.get(API_ENDPOINTS.nrCell.kpiHourly, {
            params: { startDate: week2Start, endDate: week2End },
            headers: getAuthHeaders()
          })
        );
      }

      if (needsEndcLteTraffic) {
        promises.push(
          axios.get(API_ENDPOINTS.endcLte.trafficByDate, {
            params: { startDate: week1Start, endDate: week1End },
            headers: getAuthHeaders()
          }),
          axios.get(API_ENDPOINTS.endcLte.trafficByDate, {
            params: { startDate: week2Start, endDate: week2End },
            headers: getAuthHeaders()
          })
        );
      }

      if (needsSiteTrafficData) {
        promises.push(
          axios.get(API_ENDPOINTS.nrCell.trafficWeekly, {
            params: { startDate: week1Start, endDate: week1End },
            headers: getAuthHeaders()
          }),
          axios.get(API_ENDPOINTS.nrCell.trafficWeekly, {
            params: { startDate: week2Start, endDate: week2End },
            headers: getAuthHeaders()
          })
        );
        console.log('Site traffic URLs:', { 
          endpoint: API_ENDPOINTS.nrCell.trafficWeekly,
          week1: { startDate: week1Start, endDate: week1End },
          week2: { startDate: week2Start, endDate: week2End }
        });
      }

      console.log('Total promises:', promises.length, { needsNrKpiData, needsNrCellKpiData, needsEndcLteTraffic, needsSiteTrafficData });
      const responses = await Promise.all(promises);
      console.log('Responses received:', responses.length, responses.map(r => ({ status: r.status, dataLength: r.data?.data?.length })));

      // Extract data from responses
      let week1NrKpiData = [];
      let week2NrKpiData = [];
      let week1NrCellKpiData = [];
      let week2NrCellKpiData = [];
      let week1EndcTrafficData = [];
      let week2EndcTrafficData = [];
      let week1SiteTrafficData = [];
      let week2SiteTrafficData = [];
      
      let responseIndex = 0;
      if (needsNrKpiData) {
        week1NrKpiData = responses[responseIndex++]?.data?.data || [];
        week2NrKpiData = responses[responseIndex++]?.data?.data || [];
      }
      if (needsNrCellKpiData) {
        week1NrCellKpiData = responses[responseIndex++]?.data?.data || [];
        week2NrCellKpiData = responses[responseIndex++]?.data?.data || [];
      }
      if (needsEndcLteTraffic) {
        week1EndcTrafficData = responses[responseIndex++]?.data?.data || [];
        week2EndcTrafficData = responses[responseIndex++]?.data?.data || [];
      }
      if (needsSiteTrafficData) {
        week1SiteTrafficData = responses[responseIndex++]?.data?.data || [];
        week2SiteTrafficData = responses[responseIndex++]?.data?.data || [];
      }

      // Process site traffic comparison if includeSiteTraffic checkbox is checked OR if TOP Sites KPIs are selected
      if (needsSiteTrafficData) {
        console.log('Site traffic data received:', { week1SiteTrafficData, week2SiteTrafficData });
        
        // Aggregate traffic per site for each week
        const aggregateSiteTraffic = (rawData) => {
          const siteTraffic = {};
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
            siteTraffic[site].dl_traffic_gb += parseFloat(record.user_data_traffic_volume_dl_gb || 0);
            siteTraffic[site].ul_traffic_gb += parseFloat(record.user_data_traffic_volume_ul_gb || 0);
            siteTraffic[site].total_traffic_gb += parseFloat(record.total_traffic_volume_gb || 0);
          });
          return siteTraffic;
        };

        const week1Sites = aggregateSiteTraffic(week1SiteTrafficData);
        const week2Sites = aggregateSiteTraffic(week2SiteTrafficData);
        
        // Get all unique sites
        const allSites = new Set([...Object.keys(week1Sites), ...Object.keys(week2Sites)]);
        
        // Create comparison data for sites
        const siteComparison = Array.from(allSites).map(site => ({
          site_name: site,
          week1_traffic: week1Sites[site]?.total_traffic_gb || 0,
          week2_traffic: week2Sites[site]?.total_traffic_gb || 0,
          week1_dl: week1Sites[site]?.dl_traffic_gb || 0,
          week1_ul: week1Sites[site]?.ul_traffic_gb || 0,
          week2_dl: week2Sites[site]?.dl_traffic_gb || 0,
          week2_ul: week2Sites[site]?.ul_traffic_gb || 0,
          difference: (week2Sites[site]?.total_traffic_gb || 0) - (week1Sites[site]?.total_traffic_gb || 0),
        }));

        // Sort by week1 traffic and get top/bottom 20
        const sortedByWeek1 = [...siteComparison].sort((a, b) => b.week1_traffic - a.week1_traffic);
        
        setSiteTrafficComparison({
          top20: sortedByWeek1.slice(0, 20),
          bottom20: sortedByWeek1.slice(-20).reverse(),
        });
        
        console.log('Site traffic comparison set:', {
          top20: sortedByWeek1.slice(0, 20),
          bottom20: sortedByWeek1.slice(-20).reverse(),
        });
      }

      // Process data for each selected KPI and frequency band
      const processedData = {};

      selectedKPIs.forEach(kpiId => {
        const kpiConfig = NR_KPI_OPTIONS.find(k => k.id === kpiId);
        if (!kpiConfig) return;

        // Special handling for share_5g_traffic_volume (calculated field: DL + UL)
        if (kpiId === 'share_5g_traffic_volume') {
          // This KPI aggregates by date (not hourly) and sums DL + UL traffic
          const calculateShareTrafficData = (data, weekLabel, isWeek1) => {
            const dataByDate = {};
            
            data.forEach(item => {
              const dateKey = item.date_id;
              const freqBand = item.freq_band;
              
              if (!dataByDate[dateKey]) {
                dataByDate[dateKey] = { 
                  name: dateKey,
                  '900MHz': 0, 
                  '3500MHz': 0
                };
              }
              
              const dlVolume = parseFloat(item.user_data_traffic_volume_dl_gb) || 0;
              const ulVolume = parseFloat(item.user_data_traffic_volume_ul_gb) || 0;
              const totalVolume = dlVolume + ulVolume;
              
              if (freqBand === '900MHz') {
                dataByDate[dateKey]['900MHz'] += totalVolume;
              } else if (freqBand === '3500MHz') {
                dataByDate[dateKey]['3500MHz'] += totalVolume;
              }
            });
            
            // Round and format values
            return Object.values(dataByDate)
              .sort((a, b) => new Date(a.name) - new Date(b.name))
              .map((item, index) => {
                const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                const dayName = dayNames[index] || `Day${index + 1}`;
                return {
                  name: dayName,
                  dayIndex: index + 1,
                  [weekLabel]: {
                    '900MHz': parseFloat(item['900MHz'].toFixed(2)),
                    '3500MHz': parseFloat(item['3500MHz'].toFixed(2))
                  }
                };
              });
          };

          const week1ShareData = calculateShareTrafficData(week1NrCellKpiData, w1Label, true);
          const week2ShareData = calculateShareTrafficData(week2NrCellKpiData, w2Label, false);

          // Merge week data for each frequency band
          const mergeShareData = (freqBand) => {
            const merged = [];
            const maxLength = Math.max(week1ShareData.length, week2ShareData.length);
            
            for (let i = 0; i < maxLength; i++) {
              const w1 = week1ShareData[i];
              const w2 = week2ShareData[i];
              
              merged.push({
                name: w1?.name || w2?.name || `Day${i + 1}`,
                dayIndex: i + 1,
                [w1Label]: w1?.[w1Label]?.[freqBand] ?? null,
                [w2Label]: w2?.[w2Label]?.[freqBand] ?? null
              });
            }
            
            return merged;
          };

          processedData[kpiId] = {
            '900MHz': mergeShareData('900MHz'),
            '3500MHz': mergeShareData('3500MHz')
          };
          return;
        }

        // Special handling for endc_lte_traffic (daily EN-DC traffic, single line - no frequency bands)
        if (kpiId === 'endc_lte_traffic') {
          const formatEndcTrafficData = (data, weekLabel) => {
            return data
              .sort((a, b) => new Date(a.date_id) - new Date(b.date_id))
              .map((item, index) => {
                const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                const dayName = dayNames[index] || `Day${index + 1}`;
                return {
                  name: dayName,
                  dayIndex: index + 1,
                  [weekLabel]: parseFloat(item.total_gb) || 0
                };
              });
          };

          const week1Formatted = formatEndcTrafficData(week1EndcTrafficData, w1Label);
          const week2Formatted = formatEndcTrafficData(week2EndcTrafficData, w2Label);

          // Merge the data
          const merged = [];
          const maxLength = Math.max(week1Formatted.length, week2Formatted.length);
          
          for (let i = 0; i < maxLength; i++) {
            const w1 = week1Formatted[i];
            const w2 = week2Formatted[i];
            
            merged.push({
              name: w1?.name || w2?.name || `Day${i + 1}`,
              dayIndex: i + 1,
              [w1Label]: w1?.[w1Label] ?? null,
              [w2Label]: w2?.[w2Label] ?? null
            });
          }

          // EN-DC traffic doesn't have frequency bands, use 'all' as a single key
          processedData[kpiId] = {
            'all': merged
          };
          return;
        }

        // Special handling for TOP Sites KPIs (horizontal bar chart showing top 20 sites)
        if (kpiId === 'top_sites_total' || kpiId === 'top_sites_tdd' || kpiId === 'top_sites_fdd') {
          // Aggregate site traffic data for each week
          const aggregateSiteData = (rawData, freqFilter = null) => {
            const dataBySite = {};
            
            rawData.forEach(item => {
              // Filter by frequency band if specified
              if (freqFilter && item.freq_band !== freqFilter) return;
              
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

            // Convert to array, calculate total, sort by total descending
            return Object.values(dataBySite)
              .map(item => ({
                site_name: item.site_name,
                dl: parseFloat(item.dl.toFixed(2)),
                ul: parseFloat(item.ul.toFixed(2)),
                total: parseFloat((item.dl + item.ul).toFixed(2))
              }))
              .sort((a, b) => b.total - a.total)
              .slice(0, 20);
          };

          // Determine frequency filter based on KPI type
          let freqFilter = null;
          if (kpiId === 'top_sites_tdd') freqFilter = '3500MHz';
          if (kpiId === 'top_sites_fdd') freqFilter = '900MHz';

          const week1TopSites = aggregateSiteData(week1SiteTrafficData, freqFilter);
          const week2TopSites = aggregateSiteData(week2SiteTrafficData, freqFilter);

          // Create comparison data: for each site in week1's top 20, show week1 and week2 values
          const comparisonData = week1TopSites.map(site => {
            const week2Site = week2TopSites.find(s => s.site_name === site.site_name);
            return {
              site_name: site.site_name,
              [w1Label]: site.total,
              [w2Label]: week2Site?.total || 0,
              week1_dl: site.dl,
              week1_ul: site.ul,
              week2_dl: week2Site?.dl || 0,
              week2_ul: week2Site?.ul || 0,
            };
          });

          // Store as 'sites' type for special rendering
          processedData[kpiId] = {
            'sites': comparisonData,
            week1Label: w1Label,
            week2Label: w2Label
          };
          return;
        }

        // Determine which data source to use
        const isNrKpiData = nrKpiDataColumns.includes(kpiId);
        const week1Data = isNrKpiData ? week1NrKpiData : week1NrCellKpiData;
        const week2Data = isNrKpiData ? week2NrKpiData : week2NrCellKpiData;

        // Process for 900MHz
        const week1Data900 = formatComparisonData(week1Data, kpiConfig.column, '900MHz', w1Label, w2Label, true);
        const week2Data900 = formatComparisonData(week2Data, kpiConfig.column, '900MHz', w1Label, w2Label, false);
        const merged900 = mergeWeekData(week1Data900, week2Data900, w1Label, w2Label);

        // Process for 3500MHz
        const week1Data3500 = formatComparisonData(week1Data, kpiConfig.column, '3500MHz', w1Label, w2Label, true);
        const week2Data3500 = formatComparisonData(week2Data, kpiConfig.column, '3500MHz', w1Label, w2Label, false);
        const merged3500 = mergeWeekData(week1Data3500, week2Data3500, w1Label, w2Label);

        processedData[kpiId] = {
          '900MHz': merged900,
          '3500MHz': merged3500
        };
      });

      setComparisonData(processedData);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
      console.error('Error fetching NR comparison data:', errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    comparisonData,
    loading,
    error,
    fetchComparisonData,
    week1Label,
    week2Label
  };
};
