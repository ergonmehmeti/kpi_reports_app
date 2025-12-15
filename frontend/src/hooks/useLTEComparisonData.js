import { useState, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * LTE KPI definitions with database column names and display labels
 * Ordered to match main LTE view: Cell Availability, Accessibility, Traffic & Throughput, Mobility, Retainability
 */
export const LTE_KPI_OPTIONS = [
  // 1. Cell Availability KPIs
  { 
    id: 'cell_availability', 
    label: 'Cell Availability (%)', 
    column: 'cell_availability_pct',
    yAxisLabel: '%',
    category: 'Cell Availability KPIs'
  },
  { 
    id: 'cell_unavailability_fault', 
    label: 'Cell UnAvailability - Fault (%)', 
    column: 'cell_unavailability_fault_pct',
    yAxisLabel: '%',
    category: 'Cell Availability KPIs'
  },
  { 
    id: 'cell_unavailability_operation', 
    label: 'Cell UnAvailability - Operation (%)', 
    column: 'cell_unavailability_operation_pct',
    yAxisLabel: '%',
    category: 'Cell Availability KPIs'
  },
  
  // 2. Accessibility KPIs
  { 
    id: 'rrc_connection_success', 
    label: 'RRC Connection Success (%)', 
    column: 'rrc_connection_success_pct',
    yAxisLabel: '%',
    category: 'Accessibility KPIs'
  },
  { 
    id: 's1_connection_success', 
    label: 'S1 Connection Success (%)', 
    column: 's1_connection_success_pct',
    yAxisLabel: '%',
    category: 'Accessibility KPIs'
  },
  { 
    id: 'erab_establishment_success', 
    label: 'E-RAB Establishment Success (%)', 
    column: 'erab_only_establishment_success_pct',
    yAxisLabel: '%',
    category: 'Accessibility KPIs'
  },
  { 
    id: 'initial_erab_success', 
    label: 'Initial E-RAB Success (%)', 
    column: 'initial_erab_establishment_success_pct',
    yAxisLabel: '%',
    category: 'Accessibility KPIs'
  },
  
  // 3. Integrity KPIs - Throughput metrics
  { 
    id: 'dl_throughput_overall', 
    label: 'Avg DL PDCP UE Throughput Overall (Mbps)', 
    column: 'avg_dl_pdcp_ue_throughput_overall_mbps',
    yAxisLabel: 'Mbps',
    category: 'Integrity KPIs'
  },
  { 
    id: 'dl_throughput_ca', 
    label: 'Avg DL PDCP UE Throughput with CA (Mbps)', 
    column: 'avg_dl_pdcp_ue_throughput_ca_mbps',
    yAxisLabel: 'Mbps',
    category: 'Integrity KPIs'
  },
  { 
    id: 'ul_throughput_overall', 
    label: 'Avg UL PDCP UE Throughput Overall (Mbps)', 
    column: 'avg_ul_pdcp_ue_throughput_overall_mbps',
    yAxisLabel: 'Mbps',
    category: 'Integrity KPIs'
  },
  { 
    id: 'ul_throughput_ca', 
    label: 'Avg UL PDCP UE Throughput with CA (Mbps)', 
    column: 'avg_ul_pdcp_ue_throughput_ca_mbps',
    yAxisLabel: 'Mbps',
    category: 'Integrity KPIs'
  },
  { 
    id: 'dl_mac_throughput', 
    label: 'Avg DL MAC Cell Throughput (Mbps)', 
    column: 'avg_dl_mac_cell_throughput_mbps',
    yAxisLabel: 'Mbps',
    category: 'Integrity KPIs'
  },
  { 
    id: 'ul_mac_throughput', 
    label: 'Avg UL MAC Cell Throughput (Mbps)', 
    column: 'avg_ul_mac_cell_throughput_mbps',
    yAxisLabel: 'Mbps',
    category: 'Integrity KPIs'
  },
  { 
    id: 'downlink_latency', 
    label: 'Downlink Latency (ms)', 
    column: 'downlink_latency_ms',
    yAxisLabel: 'ms',
    category: 'Integrity KPIs'
  },
  { 
    id: 'uplink_packet_loss', 
    label: 'Uplink Packet Loss (%)', 
    column: 'uplink_packet_loss_pct',
    yAxisLabel: '%',
    category: 'Integrity KPIs'
  },
  
  // 4. Utilization KPIs - Volume and users
  { 
    id: 'dl_traffic_volume_ca', 
    label: 'DL PDCP Traffic Volume with CA (GB)', 
    column: 'dl_pdcp_traffic_volume_ca_gb',
    yAxisLabel: 'GB',
    category: 'Utilization KPIs'
  },
  { 
    id: 'dl_traffic_volume_without_ca', 
    label: 'DL PDCP Traffic Volume without CA (GB)', 
    column: 'dl_pdcp_traffic_volume_without_ca_gb',
    yAxisLabel: 'GB',
    category: 'Utilization KPIs'
  },
  { 
    id: 'dl_traffic_volume_overall', 
    label: 'DL PDCP Traffic Volume Overall (GB)', 
    column: 'dl_pdcp_traffic_volume_overall_gb',
    yAxisLabel: 'GB',
    category: 'Utilization KPIs'
  },
  { 
    id: 'ul_traffic_volume_overall', 
    label: 'UL PDCP Traffic Volume Overall (GB)', 
    column: 'ul_pdcp_traffic_volume_overall_gb',
    yAxisLabel: 'GB',
    category: 'Utilization KPIs'
  },
  { 
    id: 'ul_traffic_volume_ca', 
    label: 'UL PDCP Traffic Volume with CA (GB)', 
    column: 'ul_pdcp_traffic_volume_ca_gb',
    yAxisLabel: 'GB',
    category: 'Utilization KPIs'
  },
  { 
    id: 'dl_mac_traffic_volume', 
    label: 'DL MAC Traffic Volume (GB)', 
    column: 'dl_mac_traffic_volume_gb',
    yAxisLabel: 'GB',
    category: 'Utilization KPIs'
  },
  { 
    id: 'ul_mac_traffic_volume', 
    label: 'UL MAC Traffic Volume (GB)', 
    column: 'ul_mac_traffic_volume_gb',
    yAxisLabel: 'GB',
    category: 'Utilization KPIs'
  },
  { 
    id: 'dl_total_traffic_volume', 
    label: 'DL PDCP Total Traffic Volume (GB)', 
    column: 'dl_pdcp_total_traffic_volume_gb',
    yAxisLabel: 'GB',
    category: 'Utilization KPIs'
  },
  { 
    id: 'ul_total_traffic_volume', 
    label: 'UL PDCP Total Traffic Volume (GB)', 
    column: 'ul_pdcp_total_traffic_volume_gb',
    yAxisLabel: 'GB',
    category: 'Utilization KPIs'
  },
  { 
    id: 'connected_users_avg', 
    label: 'Connected LTE Users (Avg)', 
    column: 'connected_lte_users_avg',
    yAxisLabel: 'Users',
    category: 'Utilization KPIs'
  },
  { 
    id: 'connected_users_max', 
    label: 'Connected LTE Users (Max)', 
    column: 'connected_lte_users_max',
    yAxisLabel: 'Users',
    category: 'Utilization KPIs'
  },
  
  // 5. Mobility KPIs
  { 
    id: 'handover_success', 
    label: 'Handover Success Ratio (%)', 
    column: 'handover_success_ratio_pct',
    yAxisLabel: '%',
    category: 'Mobility KPIs'
  },
  { 
    id: 'handover_execution', 
    label: 'Handover Execution Success (%)', 
    column: 'handover_execution_success_pct',
    yAxisLabel: '%',
    category: 'Mobility KPIs'
  },
  { 
    id: 'handover_preparation', 
    label: 'Handover Preparation Success (%)', 
    column: 'handover_preparation_success_pct',
    yAxisLabel: '%',
    category: 'Mobility KPIs'
  },
  
  // 6. Retainability KPIs
  { 
    id: 'erab_drop_ratio', 
    label: 'E-RAB Drop Ratio Overall (%)', 
    column: 'erab_drop_ratio_overall_pct',
    yAxisLabel: '%',
    category: 'Retainability KPIs'
  },
  { 
    id: 'erab_drop_mme', 
    label: 'E-RAB Drop due to MME (%)', 
    column: 'erab_drop_mme_pct',
    yAxisLabel: '%',
    category: 'Retainability KPIs'
  },
  { 
    id: 'erab_drop_enb', 
    label: 'E-RAB Drop due to eNB (%)', 
    column: 'erab_drop_enb_pct',
    yAxisLabel: '%',
    category: 'Retainability KPIs'
  },
  { 
    id: 'erab_drops_per_hour', 
    label: 'E-RAB Drops per Hour (Overall)', 
    column: 'erab_drops_per_hour_overall',
    yAxisLabel: 'drops/hour',
    category: 'Retainability KPIs'
  },
  { 
    id: 'erab_drops_per_hour_mme', 
    label: 'E-RAB Drops per Hour due to MME', 
    column: 'erab_drops_per_hour_mme',
    yAxisLabel: 'drops/hour',
    category: 'Retainability KPIs'
  },
  { 
    id: 'erab_drops_per_hour_enb', 
    label: 'E-RAB Drops per Hour due to eNB', 
    column: 'erab_drops_per_hour_enb',
    yAxisLabel: 'drops/hour',
    category: 'Retainability KPIs'
  },
];

/**
 * Format hourly data for comparison with normalized day labels
 */
const formatComparisonKPI = (data, columnName, dataKeyName) => {
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.datetime);
    const dateB = new Date(b.datetime);
    return dateA - dateB;
  });

  const firstDate = sortedData.length > 0 ? new Date(sortedData[0].datetime) : null;
  
  return sortedData.map(item => {
    const itemDate = new Date(item.datetime);
    const dayDiff = Math.floor((itemDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;
    const dayNames = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayName = dayNames[dayDiff] || `Day${dayDiff}`;
    const hour = itemDate.getHours();
    
    return {
      name: `${dayName} ${hour}:00`,
      dayIndex: dayDiff,
      hour: hour,
      [dataKeyName]: parseFloat(item[columnName] || 0).toFixed(2),
    };
  });
};

/**
 * Merge two weeks' data into a single dataset for the chart
 */
const mergeWeeksData = (week1Data, week2Data, week1Key, week2Key) => {
  const merged = [];
  const maxLength = Math.max(week1Data.length, week2Data.length);

  for (let i = 0; i < maxLength; i++) {
    const w1 = week1Data[i] || {};
    const w2 = week2Data[i] || {};
    
    merged.push({
      name: w1.name || w2.name || `Point ${i}`,
      [week1Key]: w1[week1Key] !== undefined ? w1[week1Key] : null,
      [week2Key]: w2[week2Key] !== undefined ? w2[week2Key] : null,
    });
  }

  return merged;
};

/**
 * Format and merge a specific KPI for both weeks
 */
const formatAndMergeKPI = (week1Data, week2Data, columnName, week1Label, week2Label) => {
  const week1Formatted = formatComparisonKPI(week1Data, columnName, week1Label);
  const week2Formatted = formatComparisonKPI(week2Data, columnName, week2Label);
  return mergeWeeksData(week1Formatted, week2Formatted, week1Label, week2Label);
};

/**
 * Custom hook for fetching and comparing LTE KPI data between two weeks
 */
export const useLTEComparisonData = () => {
  const [comparisonData, setComparisonData] = useState({});
  const [siteTrafficComparison, setSiteTrafficComparison] = useState({ top20: [], bottom20: [] });
  const [frequencyComparison, setFrequencyComparison] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [week1Label, setWeek1Label] = useState('');
  const [week2Label, setWeek2Label] = useState('');

  const fetchComparisonData = useCallback(async (week1, week2, selectedKPIs, includeSiteTraffic = false, includeFrequency = false) => {
    if ((!selectedKPIs || selectedKPIs.length === 0) && !includeSiteTraffic && !includeFrequency) {
      setError('Please select at least one KPI to compare.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const week1Start = week1.monday.toISOString().split('T')[0];
      const week1End = week1.sunday.toISOString().split('T')[0];
      const week2Start = week2.monday.toISOString().split('T')[0];
      const week2End = week2.sunday.toISOString().split('T')[0];

      // Fetch KPI data for both weeks in parallel
      const requests = [
        axios.get(API_ENDPOINTS.lteKpi.data, { params: { startDate: week1Start, endDate: week1End } }),
        axios.get(API_ENDPOINTS.lteKpi.data, { params: { startDate: week2Start, endDate: week2End } }),
      ];

      // Also fetch site traffic data if requested
      if (includeSiteTraffic) {
        requests.push(
          axios.get(API_ENDPOINTS.lte.data, { params: { startDate: week1Start, endDate: week1End } }),
          axios.get(API_ENDPOINTS.lte.data, { params: { startDate: week2Start, endDate: week2End } })
        );
      }

      // Also fetch frequency data if requested
      if (includeFrequency) {
        requests.push(
          axios.get(API_ENDPOINTS.lteFrequency.data, { params: { startDate: week1Start, endDate: week1End } }),
          axios.get(API_ENDPOINTS.lteFrequency.data, { params: { startDate: week2Start, endDate: week2End } })
        );
      }

      const responses = await Promise.all(requests);
      const [week1Response, week2Response] = responses;

      const week1Data = week1Response.data?.data || [];
      const week2Data = week2Response.data?.data || [];

      // Check which week(s) have no data
      if (week1Data.length === 0 && week2Data.length === 0) {
        setError(`Nuk ka të dhëna për Javën ${week1.weekOfYear} dhe Javën ${week2.weekOfYear}. Zgjedhni javë tjetër për krahasim.`);
        return;
      }
      if (week1Data.length === 0) {
        setError(`Nuk ka të dhëna për Javën ${week1.weekOfYear}. Zgjedhni një javë tjetër për krahasim.`);
        return;
      }
      if (week2Data.length === 0) {
        setError(`Nuk ka të dhëna për Javën ${week2.weekOfYear}. Zgjedhni një javë tjetër për krahasim.`);
        return;
      }

      // Create labels for the weeks
      const w1Label = `Week ${week1.weekOfYear}`;
      const w2Label = `Week ${week2.weekOfYear}`;
      setWeek1Label(w1Label);
      setWeek2Label(w2Label);

      // Format and merge data for each selected KPI
      const newComparisonData = {};
      selectedKPIs.forEach(kpiId => {
        const kpiConfig = LTE_KPI_OPTIONS.find(k => k.id === kpiId);
        if (kpiConfig) {
          newComparisonData[kpiId] = formatAndMergeKPI(
            week1Data, 
            week2Data, 
            kpiConfig.column, 
            w1Label, 
            w2Label
          );
        }
      });

      setComparisonData(newComparisonData);

      // Process site traffic comparison if requested
      let siteResponseIndex = 2;
      if (includeSiteTraffic && responses.length >= siteResponseIndex + 2) {
        const week1SiteData = responses[siteResponseIndex].data?.data || [];
        const week2SiteData = responses[siteResponseIndex + 1].data?.data || [];
        siteResponseIndex += 2;
        
        // Aggregate traffic per site for each week
        const aggregateSiteTraffic = (rawData) => {
          const siteTraffic = {};
          rawData.forEach(record => {
            const site = record.site_name;
            if (!siteTraffic[site]) {
              siteTraffic[site] = { site_name: site, total_traffic_gb: 0 };
            }
            siteTraffic[site].total_traffic_gb += parseFloat(record.total_traffic_gb || 0);
          });
          return siteTraffic;
        };

        const week1Sites = aggregateSiteTraffic(week1SiteData);
        const week2Sites = aggregateSiteTraffic(week2SiteData);
        
        // Get all unique sites
        const allSites = new Set([...Object.keys(week1Sites), ...Object.keys(week2Sites)]);
        
        // Create comparison data for sites
        const siteComparison = Array.from(allSites).map(site => ({
          site_name: site,
          week1_traffic: week1Sites[site]?.total_traffic_gb || 0,
          week2_traffic: week2Sites[site]?.total_traffic_gb || 0,
          difference: (week2Sites[site]?.total_traffic_gb || 0) - (week1Sites[site]?.total_traffic_gb || 0),
        }));

        // Sort by week2 traffic and get top/bottom 20
        const sortedByWeek2 = [...siteComparison].sort((a, b) => b.week2_traffic - a.week2_traffic);
        
        setSiteTrafficComparison({
          top20: sortedByWeek2.slice(0, 20),
          bottom20: sortedByWeek2.slice(-20).reverse(),
        });
      }

      // Process frequency band comparison if requested
      if (includeFrequency) {
        const freqResponseIndex = includeSiteTraffic ? 4 : 2;
        if (responses.length >= freqResponseIndex + 2) {
          const week1FreqData = responses[freqResponseIndex].data?.data || [];
          const week2FreqData = responses[freqResponseIndex + 1].data?.data || [];

          // Frequency band mapping (earfcndl -> band name)
          const FREQUENCY_BANDS = {
            '500': '500 - LTE2100',
            '1799': '1799 - LTE1800',
            '3550': '3550 - LTE900',
            '6400': '6400 - LTE800'
          };

          // Process frequency data to create time-series per band
          // Group by earfcndl and normalize time to day of week + hour
          const processFrequencyTimeSeries = (rawData) => {
            const bandTimeSeries = {};
            
            rawData.forEach(record => {
              const earfcndl = String(record.earfcndl);
              const bandName = FREQUENCY_BANDS[earfcndl] || earfcndl;
              const datetime = new Date(record.datetime);
              
              // Create a normalized time key (day of week + hour)
              const dayOfWeek = datetime.getDay(); // 0-6
              const hour = datetime.getHours();
              const timeKey = `${dayOfWeek}-${hour.toString().padStart(2, '0')}`;
              
              if (!bandTimeSeries[bandName]) {
                bandTimeSeries[bandName] = {};
              }
              
              if (!bandTimeSeries[bandName][timeKey]) {
                bandTimeSeries[bandName][timeKey] = {
                  dayOfWeek,
                  hour,
                  traffic: 0
                };
              }
              
              bandTimeSeries[bandName][timeKey].traffic += parseFloat(record.total_traffic_gb || 0);
            });
            
            return bandTimeSeries;
          };

          const week1Bands = processFrequencyTimeSeries(week1FreqData);
          const week2Bands = processFrequencyTimeSeries(week2FreqData);

          // Get all unique bands
          const allBands = new Set([...Object.keys(week1Bands), ...Object.keys(week2Bands)]);
          
          // Create comparison data structure for each band
          const bandComparisons = {};
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          
          allBands.forEach(band => {
            const week1Data = week1Bands[band] || {};
            const week2Data = week2Bands[band] || {};
            
            // Get all unique time points
            const allTimeKeys = new Set([...Object.keys(week1Data), ...Object.keys(week2Data)]);
            
            // Convert to array and sort by day then hour
            const sortedTimeKeys = Array.from(allTimeKeys).sort((a, b) => {
              const [dayA, hourA] = a.split('-').map(Number);
              const [dayB, hourB] = b.split('-').map(Number);
              if (dayA !== dayB) return dayA - dayB;
              return hourA - hourB;
            });
            
            // Create merged data for chart
            const chartData = sortedTimeKeys.map(timeKey => {
              const [day, hour] = timeKey.split('-').map(Number);
              return {
                time: `${dayNames[day]} ${hour}:00`,
                timeKey,
                week1: week1Data[timeKey]?.traffic || 0,
                week2: week2Data[timeKey]?.traffic || 0,
              };
            });
            
            bandComparisons[band] = chartData;
          });

          setFrequencyComparison(bandComparisons);
        }
      }

    } catch (err) {
      console.error('Error fetching LTE comparison data:', err);
      setError('Failed to load comparison data. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    comparisonData,
    siteTrafficComparison,
    frequencyComparison,
    loading,
    error,
    fetchComparisonData,
    week1Label,
    week2Label,
  };
};
