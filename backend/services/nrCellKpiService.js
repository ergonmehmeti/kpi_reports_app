import pool from '../db/pool.js';

/**
 * Parse date from Excel serial number or MM/DD/YYYY format
 */
function parseDate(dateValue) {
  if (!dateValue && dateValue !== 0) return null;

  // Handle Excel serial number (numeric)
  if (typeof dateValue === 'number' || !isNaN(Number(dateValue))) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const days = Number(dateValue);
    const jsDate = new Date(excelEpoch.getTime() + days * 86400000);
    return jsDate.toISOString().substring(0, 10); // YYYY-MM-DD
  }

  // Handle MM/DD/YYYY or M/D/YYYY format
  const dateMatch = String(dateValue).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dateMatch) {
    const [, month, day, year] = dateMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return null;
}

/**
 * Extract site name from cell name (e.g., abria_N09_1 -> abria, pr_abc_N09_1 -> pr_abc)
 */
function extractSiteName(cellName) {
  if (!cellName) return null;
  const cellStr = String(cellName);
  const match = cellStr.match(/^(.*)_N\d{2,3}_.+$/i);
  if (match && match[1]) {
    return match[1];
  }
  const parts = cellStr.split('_');
  return parts[0] || null;
}

/**
 * Determine frequency band from cell name
 * N09 = 900MHz, N35 = 3500MHz, etc.
 */
function determineFreqBand(cellName) {
  if (!cellName) return 'Unknown';
  const cellStr = String(cellName).toUpperCase();
  if (cellStr.includes('_N09_')) return '900MHz';
  if (cellStr.includes('_N35_')) return '3500MHz';
  if (cellStr.includes('_N78_')) return '3500MHz'; // Alternative notation
  return 'Unknown';
}

/**
 * Get ISO week number and week start date (Monday)
 */
function getWeekInfo(dateStr) {
  const date = new Date(dateStr + 'T12:00:00'); // Add time to avoid timezone issues
  const tempDate = new Date(date.getTime());
  tempDate.setHours(0, 0, 0, 0);
  tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
  const week1 = new Date(tempDate.getFullYear(), 0, 4);
  const weekNumber = 1 + Math.round(((tempDate - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  
  // Get Monday of the week (getDay(): 0=Sunday, 1=Monday, ..., 6=Saturday)
  const weekStart = new Date(date.getTime());
  const day = weekStart.getDay();
  const diff = day === 0 ? -6 : 1 - day; // If Sunday (0), go back 6 days; else go to Monday
  weekStart.setDate(weekStart.getDate() + diff);
  
  // Format as YYYY-MM-DD without timezone conversion
  const year = weekStart.getFullYear();
  const month = String(weekStart.getMonth() + 1).padStart(2, '0');
  const dayOfMonth = String(weekStart.getDate()).padStart(2, '0');
  const weekStartDate = `${year}-${month}-${dayOfMonth}`;
  
  return {
    weekNumber,
    year: tempDate.getFullYear(),
    weekStartDate
  };
}

/**
 * Process raw NR Cell CSV data and calculate KPIs
 * @param {Array} rawRecords - Raw CSV records from pm_DC_E_NR_NRCELLDU_HOUR
 * @returns {Object} { hourlyKpis, weeklyTraffic }
 */
export const processRawDataToKpis = (rawRecords) => {
  // Group by date_id, hour_id, and freq_band for hourly KPIs
  const hourlyGroups = {};
  
  // Group by week, site_name, and freq_band for weekly traffic
  const weeklyGroups = {};
  
  rawRecords.forEach(record => {
    const dateId = parseDate(record.DATE_ID);
    const hourId = parseInt(record.HOUR_ID);
    
    // Skip invalid records
    if (!dateId || isNaN(hourId)) {
      console.warn('Skipping invalid record:', { DATE_ID: record.DATE_ID, HOUR_ID: record.HOUR_ID });
      return;
    }
    
    const cellName = record.NRCellDU || '';
    const siteName = record.NR_NAME || extractSiteName(cellName);
    const freqBand = determineFreqBand(cellName);
    const band = record.BAND || freqBand;
    
    // Hourly aggregation key
    const hourlyKey = `${dateId}_${hourId}_${band}`;
    
    if (!hourlyGroups[hourlyKey]) {
      hourlyGroups[hourlyKey] = {
        dateId,
        hourId,
        freqBand: band,
        // Downlink counters
        pmMacVolDlDrb: 0,
        pmMacVolDlDrbOverlapLastSlot: 0,
        pmMacTimeDlDrb: 0,
        pmMacOverlapTimeDlDrbExtScell: 0,
        pmMacVolDl: 0,
        pmPdschSchedActivity: 0,
        pmPdschAvailTime: 0,
        pmMacRbSymUsedPdschTypeA: 0,
        pmMacRbSymUsedPdschTypeB: 0,
        pmMacRbSymUsedPdcchTypeA: 0,
        pmMacRbSymUsedPdcchTypeB: 0,
        pmMacRbSymUsedPdschTypeABroadcasting: 0,
        pmMacRbSymCsiRs: 0,
        pmMacRbSymAvailDl: 0,
        pmMacVolDlDrbSingleBurst: 0,
        pmMacVolDlDrbSingleSlotShortBurst: 0,
        pmMacVolDlDrbLastSlot: 0,
        // Uplink counters
        pmMacVolUlResUe: 0,
        pmMacTimeUlResUe: 0,
        pmMacVolUl: 0,
        pmPuschSchedActivity: 0,
        pmPuschAvailTime: 0,
        pmMacRbSymUsedPuschTypeA: 0,
        pmMacRbSymUsedPuschTypeB: 0,
        pmMacRbSymAvailUl: 0,
        pmMacVolUlUnresUe: 0,
        pmMacVolUlUeLastSlot: 0,
        pmMacVolUlResUeLate: 0,
        // Cell performance counters
        pmCellDowntimeAuto: 0,
        pmCellDowntimeMan: 0,
        periodDuration: 0,
        pmUeCtxtSetupAtt: 0,
        pmUeCtxtSetupSucc: 0,
        pmRadioRacbAttMsg2: 0,
        pmRadioRacbSuccMsg3: 0,
      };
    }
    
    // Aggregate counters (SUM)
    const hGroup = hourlyGroups[hourlyKey];
    hGroup.pmMacVolDlDrb += parseFloat(record.PMMACVOLDLDRB || 0);
    hGroup.pmMacVolDlDrbOverlapLastSlot += parseFloat(record.PMMACVOLDLDRBOVERLAPLASTSLOT || 0);
    hGroup.pmMacTimeDlDrb += parseFloat(record.PMMACTIMEDLDRB || 0);
    hGroup.pmMacOverlapTimeDlDrbExtScell += parseFloat(record.PMMACOVERLAPTIMEDLDRBEXTSCELL || 0);
    hGroup.pmMacVolDl += parseFloat(record.PMMACVOLDL || 0);
    hGroup.pmPdschSchedActivity += parseFloat(record.PMPDSCHSCHEDACTIVITY || 0);
    hGroup.pmPdschAvailTime += parseFloat(record.PMPDSCHAVAILTIME || 0);
    hGroup.pmMacRbSymUsedPdschTypeA += parseFloat(record.PMMACRBSYMUSEDPDSCHTYPEA || 0);
    hGroup.pmMacRbSymUsedPdschTypeB += parseFloat(record.PMMACRBSYMUSEDPDSCHTYPEB || 0);
    hGroup.pmMacRbSymUsedPdcchTypeA += parseFloat(record.PMMACRBSYMUSEDPDCCHTYPEA || 0);
    hGroup.pmMacRbSymUsedPdcchTypeB += parseFloat(record.PMMACRBSYMUSEDPDCCHTYPEB || 0);
    hGroup.pmMacRbSymUsedPdschTypeABroadcasting += parseFloat(record.PMMACRBSYMUSEDPDSCHTYPEABROADCASTING || 0);
    hGroup.pmMacRbSymCsiRs += parseFloat(record.PMMACRBSYMCSIRS || 0);
    hGroup.pmMacRbSymAvailDl += parseFloat(record.PMMACRBSYMAVAILDL || 0);
    hGroup.pmMacVolDlDrbSingleBurst += parseFloat(record.PMMACVOLDLDRBSINGLEBURST || 0);
    hGroup.pmMacVolDlDrbSingleSlotShortBurst += parseFloat(record.PMMACVOLDLDRBSINGLESLOTSHORTBURST || 0);
    hGroup.pmMacVolDlDrbLastSlot += parseFloat(record.PMMACVOLDLDRBLASTSLOT || 0);
    hGroup.pmMacVolUlResUe += parseFloat(record.PMMACVOLULRESUE || 0);
    hGroup.pmMacTimeUlResUe += parseFloat(record.PMMACTIMEULRESUE || 0);
    hGroup.pmMacVolUl += parseFloat(record.PMMACVOLUL || 0);
    hGroup.pmPuschSchedActivity += parseFloat(record.PMPUSCHSCHEDACTIVITY || 0);
    hGroup.pmPuschAvailTime += parseFloat(record.PMPUSCHAVAILTIME || 0);
    hGroup.pmMacRbSymUsedPuschTypeA += parseFloat(record.PMMACRBSYMUSEDPUSCHTYPEA || 0);
    hGroup.pmMacRbSymUsedPuschTypeB += parseFloat(record.PMMACRBSYMUSEDPUSCHTYPEB || 0);
    hGroup.pmMacRbSymAvailUl += parseFloat(record.PMMACRBSYMAVAILUL || 0);
    hGroup.pmMacVolUlUnresUe += parseFloat(record.PMMACVOLULUNRESUE || 0);
    hGroup.pmMacVolUlUeLastSlot += parseFloat(record.PMMACVOLULUELASTSLOT || 0);
    hGroup.pmMacVolUlResUeLate += parseFloat(record.PMMACVOLULRESUELATE || 0);
    hGroup.pmCellDowntimeAuto += parseFloat(record.PMCELLDOWNTIMEAUTO || 0);
    hGroup.pmCellDowntimeMan += parseFloat(record.PMCELLDOWNTIMEMAN || 0);
    hGroup.periodDuration += parseFloat(record.PERIOD_DURATION || 0);
    hGroup.pmUeCtxtSetupAtt += parseFloat(record.PMUECTXTSETUPATT || 0);
    hGroup.pmUeCtxtSetupSucc += parseFloat(record.PMUECTXTSETUPSUCC || 0);
    hGroup.pmRadioRacbAttMsg2 += parseFloat(record.PMRADIORACBATTMSG2 || 0);
    hGroup.pmRadioRacbSuccMsg3 += parseFloat(record.PMRADIORACBSUCCMSG3 || 0);
    
    // Weekly traffic aggregation
    if (siteName) {
      const weekInfo = getWeekInfo(dateId);
      const weeklyKey = `${weekInfo.weekStartDate}_${siteName}_${band}`;
      
      if (!weeklyGroups[weeklyKey]) {
        weeklyGroups[weeklyKey] = {
          weekStartDate: weekInfo.weekStartDate,
          weekNumber: weekInfo.weekNumber,
          year: weekInfo.year,
          siteName,
          freqBand: band,
          pmMacVolDlDrb: 0,
          pmMacVolDlDrbOverlapLastSlot: 0,
          pmMacVolDlDrbSingleBurst: 0,
          pmMacVolUl: 0,
        };
      }
      
      const wGroup = weeklyGroups[weeklyKey];
      wGroup.pmMacVolDlDrb += parseFloat(record.PMMACVOLDLDRB || 0);
      wGroup.pmMacVolDlDrbOverlapLastSlot += parseFloat(record.PMMACVOLDLDRBOVERLAPLASTSLOT || 0);
      wGroup.pmMacVolDlDrbSingleBurst += parseFloat(record.PMMACVOLDLDRBSINGLEBURST || 0);
      wGroup.pmMacVolUl += parseFloat(record.PMMACVOLUL || 0);
    }
  });
  
  // Calculate hourly KPIs
  const hourlyKpis = Object.values(hourlyGroups).map(g => {
    // KPI 1: Average DL MAC DRB Throughput (Mbps)
    const denomDlDrb = g.pmMacTimeDlDrb - g.pmMacOverlapTimeDlDrbExtScell;
    const avgDlMacDrbThroughput = denomDlDrb > 0
      ? (64 * (g.pmMacVolDlDrb + g.pmMacVolDlDrbOverlapLastSlot)) / denomDlDrb / 1000
      : null;
    
    // KPI 2: Normalized Average DL MAC Cell Throughput Considering Traffic (Mbps)
    const normAvgDlMacCellThroughputTraffic = g.pmPdschSchedActivity > 0
      ? (64 * g.pmMacVolDl) / g.pmPdschSchedActivity / 1000
      : null;
    
    // KPI 3: Normalized DL MAC Cell Throughput Considering Actual PDSCH Slot Only (Mbps)
    const normDlMacCellThroughputActualPdsch = g.pmPdschAvailTime > 0
      ? (64 * g.pmMacVolDl) / g.pmPdschAvailTime / 1000
      : null;
    
    // KPI 4: PDSCH Slot Utilization (%)
    const pdschSlotUtilization = g.pmPdschAvailTime > 0
      ? (100 * g.pmPdschSchedActivity) / g.pmPdschAvailTime
      : null;
    
    // KPI 5: DL RBSym Utilization (%)
    const dlRbSymUtilization = g.pmMacRbSymAvailDl > 0
      ? (100 * (g.pmMacRbSymUsedPdschTypeA + g.pmMacRbSymUsedPdschTypeB + 
                g.pmMacRbSymUsedPdcchTypeA + g.pmMacRbSymUsedPdcchTypeB + 
                g.pmMacRbSymUsedPdschTypeABroadcasting + g.pmMacRbSymCsiRs)) / g.pmMacRbSymAvailDl
      : null;
    
    // KPI 6: Percentage Unrestricted Volume DL (%)
    const totalDlVolume = g.pmMacVolDlDrb + g.pmMacVolDlDrbLastSlot + g.pmMacVolDlDrbSingleBurst + 
                          g.pmMacVolDlDrbSingleSlotShortBurst + g.pmMacVolDlDrbOverlapLastSlot;
    const percentageUnrestrictedVolumeDl = totalDlVolume > 0
      ? (100 * (g.pmMacVolDlDrbSingleBurst + g.pmMacVolDlDrbSingleSlotShortBurst + g.pmMacVolDlDrbLastSlot)) / totalDlVolume
      : null;
    
    // KPI 7: 5G User Data Traffic Volume on Downlink (GB)
    const userDataTrafficVolumeDl = (g.pmMacVolDlDrb + g.pmMacVolDlDrbSingleBurst + 
                                     g.pmMacVolDlDrbOverlapLastSlot) / (1000 * 1000 * 1000);
    
    // KPI 8: Average UL MAC UE Throughput (Mbps)
    const avgUlMacUeThroughput = g.pmMacTimeUlResUe > 0
      ? (64 * g.pmMacVolUlResUe) / (g.pmMacTimeUlResUe / 1000)
      : null;
    
    // KPI 9: Normalized Average UL MAC Cell Throughput Considering Successful PUSCH Slot Only (Mbps)
    const normAvgUlMacCellThroughputSuccessfulPusch = g.pmPuschSchedActivity > 0
      ? (64 * g.pmMacVolUl) / g.pmPuschSchedActivity / 1000
      : null;
    
    // KPI 10: Normalized Average UL MAC Cell Throughput Considering Actual PUSCH Slot Only (Mbps)
    const normAvgUlMacCellThroughputActualPusch = g.pmPuschAvailTime > 0
      ? (64 * g.pmMacVolUl) / g.pmPuschAvailTime / 1000
      : null;
    
    // KPI 11: PUSCH Slot Utilization (%)
    const puschSlotUtilization = g.pmPuschAvailTime > 0
      ? (100 * g.pmPuschSchedActivity) / g.pmPuschAvailTime
      : null;
    
    // KPI 12: UL RBSym Utilization (%)
    const ulRbSymUtilization = g.pmMacRbSymAvailUl > 0
      ? (100 * (g.pmMacRbSymUsedPuschTypeA + g.pmMacRbSymUsedPuschTypeB)) / g.pmMacRbSymAvailUl
      : null;
    
    // KPI 13: Percentage Unrestricted Volume UL (%)
    const totalUlVolume = g.pmMacVolUlUnresUe + g.pmMacVolUlUeLastSlot + g.pmMacVolUlResUe + g.pmMacVolUlResUeLate;
    const percentageUnrestrictedVolumeUl = totalUlVolume > 0
      ? (100 * (g.pmMacVolUlUnresUe + g.pmMacVolUlUeLastSlot)) / totalUlVolume
      : null;
    
    // KPI 14: 5G User Data Traffic Volume on Uplink (GB)
    const userDataTrafficVolumeUl = g.pmMacVolUl / (1000 * 1000 * 1000);
    
    // KPI 15: Partial Cell Availability for gNodeB Cell (%)
    const partialCellAvailability = g.periodDuration > 0
      ? (100 * (1 - (g.pmCellDowntimeAuto + g.pmCellDowntimeMan) / (60 * g.periodDuration)))
      : null;
    
    // KPI 16: UE Context Setup Success Rate (%)
    const ueContextSetupSuccessRate = g.pmUeCtxtSetupAtt > 0
      ? (100 * g.pmUeCtxtSetupSucc) / g.pmUeCtxtSetupAtt
      : null;
    
    // KPI 17: Random Access Success Rate (%)
    const randomAccessSuccessRate = g.pmRadioRacbAttMsg2 > 0
      ? (100 * g.pmRadioRacbSuccMsg3) / g.pmRadioRacbAttMsg2
      : null;
    
    return {
      date_id: g.dateId,
      hour_id: g.hourId,
      freq_band: g.freqBand,
      avg_dl_mac_drb_throughput_mbps: avgDlMacDrbThroughput,
      normalized_avg_dl_mac_cell_throughput_traffic_mbps: normAvgDlMacCellThroughputTraffic,
      normalized_dl_mac_cell_throughput_actual_pdsch_mbps: normDlMacCellThroughputActualPdsch,
      pdsch_slot_utilization_pct: pdschSlotUtilization,
      dl_rbsym_utilization_pct: dlRbSymUtilization,
      percentage_unrestricted_volume_dl_pct: percentageUnrestrictedVolumeDl,
      user_data_traffic_volume_dl_gb: userDataTrafficVolumeDl,
      avg_ul_mac_ue_throughput_mbps: avgUlMacUeThroughput,
      normalized_avg_ul_mac_cell_throughput_successful_pusch_mbps: normAvgUlMacCellThroughputSuccessfulPusch,
      normalized_avg_ul_mac_cell_throughput_actual_pusch_mbps: normAvgUlMacCellThroughputActualPusch,
      pusch_slot_utilization_pct: puschSlotUtilization,
      ul_rbsym_utilization_pct: ulRbSymUtilization,
      percentage_unrestricted_volume_ul_pct: percentageUnrestrictedVolumeUl,
      user_data_traffic_volume_ul_gb: userDataTrafficVolumeUl,
      partial_cell_availability_pct: partialCellAvailability,
      ue_context_setup_success_rate_pct: ueContextSetupSuccessRate,
      random_access_success_rate_pct: randomAccessSuccessRate,
    };
  });
  
  // Calculate weekly traffic
  const weeklyTraffic = Object.values(weeklyGroups).map(g => {
    const userDataTrafficVolumeDl = (g.pmMacVolDlDrb + g.pmMacVolDlDrbSingleBurst + 
                                     g.pmMacVolDlDrbOverlapLastSlot) / (1000 * 1000 * 1000);
    const userDataTrafficVolumeUl = g.pmMacVolUl / (1000 * 1000 * 1000);
    const totalTrafficVolume = userDataTrafficVolumeDl + userDataTrafficVolumeUl;
    
    return {
      week_start_date: g.weekStartDate,
      week_number: g.weekNumber,
      year: g.year,
      site_name: g.siteName,
      freq_band: g.freqBand,
      user_data_traffic_volume_dl_gb: userDataTrafficVolumeDl,
      user_data_traffic_volume_ul_gb: userDataTrafficVolumeUl,
      total_traffic_volume_gb: totalTrafficVolume,
    };
  });
  
  return { hourlyKpis, weeklyTraffic };
};

/**
 * Insert NR KPI hourly data (UPSERT)
 */
export const insertHourlyKpiData = async (records) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    let insertedCount = 0;
    let updatedCount = 0;
    
    for (const record of records) {
      const query = `
        INSERT INTO nr_kpi_hourly_by_band (
          date_id, hour_id, freq_band,
          avg_dl_mac_drb_throughput_mbps,
          normalized_avg_dl_mac_cell_throughput_traffic_mbps,
          normalized_dl_mac_cell_throughput_actual_pdsch_mbps,
          pdsch_slot_utilization_pct,
          dl_rbsym_utilization_pct,
          percentage_unrestricted_volume_dl_pct,
          user_data_traffic_volume_dl_gb,
          avg_ul_mac_ue_throughput_mbps,
          normalized_avg_ul_mac_cell_throughput_successful_pusch_mbps,
          normalized_avg_ul_mac_cell_throughput_actual_pusch_mbps,
          pusch_slot_utilization_pct,
          ul_rbsym_utilization_pct,
          percentage_unrestricted_volume_ul_pct,
          user_data_traffic_volume_ul_gb,
          partial_cell_availability_pct,
          ue_context_setup_success_rate_pct,
          random_access_success_rate_pct
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        ON CONFLICT (date_id, hour_id, freq_band)
        DO UPDATE SET
          avg_dl_mac_drb_throughput_mbps = EXCLUDED.avg_dl_mac_drb_throughput_mbps,
          normalized_avg_dl_mac_cell_throughput_traffic_mbps = EXCLUDED.normalized_avg_dl_mac_cell_throughput_traffic_mbps,
          normalized_dl_mac_cell_throughput_actual_pdsch_mbps = EXCLUDED.normalized_dl_mac_cell_throughput_actual_pdsch_mbps,
          pdsch_slot_utilization_pct = EXCLUDED.pdsch_slot_utilization_pct,
          dl_rbsym_utilization_pct = EXCLUDED.dl_rbsym_utilization_pct,
          percentage_unrestricted_volume_dl_pct = EXCLUDED.percentage_unrestricted_volume_dl_pct,
          user_data_traffic_volume_dl_gb = EXCLUDED.user_data_traffic_volume_dl_gb,
          avg_ul_mac_ue_throughput_mbps = EXCLUDED.avg_ul_mac_ue_throughput_mbps,
          normalized_avg_ul_mac_cell_throughput_successful_pusch_mbps = EXCLUDED.normalized_avg_ul_mac_cell_throughput_successful_pusch_mbps,
          normalized_avg_ul_mac_cell_throughput_actual_pusch_mbps = EXCLUDED.normalized_avg_ul_mac_cell_throughput_actual_pusch_mbps,
          pusch_slot_utilization_pct = EXCLUDED.pusch_slot_utilization_pct,
          ul_rbsym_utilization_pct = EXCLUDED.ul_rbsym_utilization_pct,
          percentage_unrestricted_volume_ul_pct = EXCLUDED.percentage_unrestricted_volume_ul_pct,
          user_data_traffic_volume_ul_gb = EXCLUDED.user_data_traffic_volume_ul_gb,
          partial_cell_availability_pct = EXCLUDED.partial_cell_availability_pct,
          ue_context_setup_success_rate_pct = EXCLUDED.ue_context_setup_success_rate_pct,
          random_access_success_rate_pct = EXCLUDED.random_access_success_rate_pct,
          created_at = CURRENT_TIMESTAMP
        RETURNING (xmax = 0) AS inserted;
      `;
      
      const result = await client.query(query, [
        record.date_id, record.hour_id, record.freq_band,
        record.avg_dl_mac_drb_throughput_mbps,
        record.normalized_avg_dl_mac_cell_throughput_traffic_mbps,
        record.normalized_dl_mac_cell_throughput_actual_pdsch_mbps,
        record.pdsch_slot_utilization_pct,
        record.dl_rbsym_utilization_pct,
        record.percentage_unrestricted_volume_dl_pct,
        record.user_data_traffic_volume_dl_gb,
        record.avg_ul_mac_ue_throughput_mbps,
        record.normalized_avg_ul_mac_cell_throughput_successful_pusch_mbps,
        record.normalized_avg_ul_mac_cell_throughput_actual_pusch_mbps,
        record.pusch_slot_utilization_pct,
        record.ul_rbsym_utilization_pct,
        record.percentage_unrestricted_volume_ul_pct,
        record.user_data_traffic_volume_ul_gb,
        record.partial_cell_availability_pct,
        record.ue_context_setup_success_rate_pct,
        record.random_access_success_rate_pct,
      ]);
      
      if (result.rows[0].inserted) {
        insertedCount++;
      } else {
        updatedCount++;
      }
    }
    
    await client.query('COMMIT');
    
    return {
      success: true,
      inserted: insertedCount,
      updated: updatedCount,
      total: records.length
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Insert NR weekly traffic data (UPSERT)
 */
export const insertWeeklyTrafficData = async (records) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    let insertedCount = 0;
    let updatedCount = 0;
    
    for (const record of records) {
      const query = `
        INSERT INTO nr_site_traffic_weekly (
          week_start_date, week_number, year, site_name, freq_band,
          user_data_traffic_volume_dl_gb,
          user_data_traffic_volume_ul_gb,
          total_traffic_volume_gb
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (week_start_date, site_name, freq_band)
        DO UPDATE SET
          week_number = EXCLUDED.week_number,
          year = EXCLUDED.year,
          user_data_traffic_volume_dl_gb = EXCLUDED.user_data_traffic_volume_dl_gb,
          user_data_traffic_volume_ul_gb = EXCLUDED.user_data_traffic_volume_ul_gb,
          total_traffic_volume_gb = EXCLUDED.total_traffic_volume_gb,
          created_at = CURRENT_TIMESTAMP
        RETURNING (xmax = 0) AS inserted;
      `;
      
      const result = await client.query(query, [
        record.week_start_date,
        record.week_number,
        record.year,
        record.site_name,
        record.freq_band,
        record.user_data_traffic_volume_dl_gb,
        record.user_data_traffic_volume_ul_gb,
        record.total_traffic_volume_gb,
      ]);
      
      if (result.rows[0].inserted) {
        insertedCount++;
      } else {
        updatedCount++;
      }
    }
    
    await client.query('COMMIT');
    
    return {
      success: true,
      inserted: insertedCount,
      updated: updatedCount,
      total: records.length
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get NR KPI hourly data for a date range
 */
/**
 * Get NR Cell KPI hourly data for a date range
 * Transforms freq_band values: '8' -> '900MHz', '78' -> '3500MHz'
 */
export const getHourlyKpiData = async (startDate, endDate) => {
  const query = `
    SELECT 
      id,
      date_id,
      hour_id,
      CASE 
        WHEN freq_band = '8' THEN '900MHz'
        WHEN freq_band = '78' THEN '3500MHz'
        ELSE freq_band
      END as freq_band,
      avg_dl_mac_drb_throughput_mbps,
      normalized_avg_dl_mac_cell_throughput_traffic_mbps,
      normalized_dl_mac_cell_throughput_actual_pdsch_mbps,
      pdsch_slot_utilization_pct,
      dl_rbsym_utilization_pct,
      percentage_unrestricted_volume_dl_pct,
      user_data_traffic_volume_dl_gb,
      avg_ul_mac_ue_throughput_mbps,
      normalized_avg_ul_mac_cell_throughput_successful_pusch_mbps,
      normalized_avg_ul_mac_cell_throughput_actual_pusch_mbps,
      pusch_slot_utilization_pct,
      ul_rbsym_utilization_pct,
      percentage_unrestricted_volume_ul_pct,
      user_data_traffic_volume_ul_gb,
      partial_cell_availability_pct,
      ue_context_setup_success_rate_pct,
      random_access_success_rate_pct,
      created_at
    FROM nr_kpi_hourly_by_band
    WHERE date_id >= $1 AND date_id <= $2
    ORDER BY date_id, hour_id, freq_band;
  `;
  
  const result = await pool.query(query, [startDate, endDate]);
  return result.rows;
};

/**
 * Get NR weekly traffic data for a date range
 * Transforms freq_band values: '8' -> '900MHz', '78' -> '3500MHz'
 */
export const getWeeklyTrafficData = async (startDate, endDate) => {
  console.log(`📊 getWeeklyTrafficData query: startDate=${startDate}, endDate=${endDate}`);
  
  const query = `
    SELECT 
      id,
      week_start_date,
      week_number,
      year,
      site_name,
      CASE 
        WHEN freq_band = '8' THEN '900MHz'
        WHEN freq_band = '78' THEN '3500MHz'
        ELSE freq_band
      END as freq_band,
      user_data_traffic_volume_dl_gb,
      user_data_traffic_volume_ul_gb,
      total_traffic_volume_gb,
      created_at
    FROM nr_site_traffic_weekly
    WHERE week_start_date >= $1 AND week_start_date <= $2
    ORDER BY week_start_date, site_name, freq_band;
  `;
  
  const result = await pool.query(query, [startDate, endDate]);
  console.log(`📊 getWeeklyTrafficData result: ${result.rows.length} records`);
  if (result.rows.length > 0) {
    console.log(`   First record: week_start_date=${result.rows[0].week_start_date}, site=${result.rows[0].site_name}`);
  }
  return result.rows;
};

/**
 * Delete NR KPI hourly data for a date range
 */
export const deleteHourlyKpiData = async (startDate, endDate) => {
  const query = `
    DELETE FROM nr_kpi_hourly_by_band
    WHERE date_id >= $1 AND date_id <= $2;
  `;
  
  const result = await pool.query(query, [startDate, endDate]);
  return result.rowCount;
};

/**
 * Delete NR weekly traffic data for a date range
 */
export const deleteWeeklyTrafficData = async (startDate, endDate) => {
  const query = `
    DELETE FROM nr_site_traffic_weekly
    WHERE week_start_date >= $1 AND week_start_date <= $2;
  `;
  
  const result = await pool.query(query, [startDate, endDate]);
  return result.rowCount;
};
