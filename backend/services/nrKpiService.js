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
 * Process raw NR CSV data and calculate KPIs
 * @param {Array} rawRecords - Raw CSV records from NR_RAW_DATA
 * @returns {Array} Calculated KPI records grouped by date/hour/freq_band
 */
export const processRawDataToKpis = (rawRecords) => {
  // Group by date_id, hour_id, and derive freq_band from cell name
  const groups = {};
  
  rawRecords.forEach(record => {
    const dateId = parseDate(record.DATE_ID);
    const hourId = parseInt(record.HOUR_ID);
    
    // Skip invalid records
    if (!dateId || isNaN(hourId)) {
      console.warn('Skipping invalid record:', { DATE_ID: record.DATE_ID, HOUR_ID: record.HOUR_ID });
      return;
    }
    
    // Determine frequency band from cell name
    // N09 = 900MHz, N35 = 3500MHz
    const cellName = record.NRCellCU || '';
    let freqBand = '3500MHz'; // Default to 3500MHz
    if (cellName.includes('_N09_')) {
      freqBand = '900MHz';
    } else if (cellName.includes('_N35_')) {
      freqBand = '3500MHz';
    }
    
    const key = `${dateId}_${hourId}_${freqBand}`;
    
    if (!groups[key]) {
      groups[key] = {
        dateId,
        hourId,
        freqBand,
        // EN-DC Setup
        pmEndcSetupUeAtt: 0,
        pmEndcSetupUeSucc: 0,
        // Intra Cell Change
        pmEndcPsCellChangeAttIntraSgnb: 0,
        pmEndcPsCellChangeSuccIntraSgnb: 0,
        // Inter Cell Change
        pmEndcPsCellChangeAttInterSgnb: 0,
        pmEndcPsCellChangeSuccInterSgnb: 0,
        // Release counters
        pmEndcRelUeNormal: 0,
        pmEndcRelUeAbnormalSgnb: 0,
        pmEndcRelUeAbnormalMenb: 0,
        pmEndcRelUeAbnormalSgnbAct: 0,
        pmEndcRelUeAbnormalMenbAct: 0,
      };
    }
    
    // Aggregate counters (SUM)
    const group = groups[key];
    group.pmEndcSetupUeAtt += parseFloat(record.PMENDCSETUPUEATT || 0);
    group.pmEndcSetupUeSucc += parseFloat(record.PMENDCSETUPUESUCC || 0);
    group.pmEndcPsCellChangeAttIntraSgnb += parseFloat(record.PMENDCPSCELLCHANGEATTINTRASGNB || 0);
    group.pmEndcPsCellChangeSuccIntraSgnb += parseFloat(record.PMENDCPSCELLCHANGESUCCINTRASGNB || 0);
    group.pmEndcPsCellChangeAttInterSgnb += parseFloat(record.PMENDCPSCELLCHANGEATTINTERSGNB || 0);
    group.pmEndcPsCellChangeSuccInterSgnb += parseFloat(record.PMENDCPSCELLCHANGESUCCINTERSGNB || 0);
    group.pmEndcRelUeNormal += parseFloat(record.PMENDCRELUENORMAL || 0);
    group.pmEndcRelUeAbnormalSgnb += parseFloat(record.PMENDCRELUEABNORMALSGNB || 0);
    group.pmEndcRelUeAbnormalMenb += parseFloat(record.PMENDCRELUEABNORMALMENB || 0);
    group.pmEndcRelUeAbnormalSgnbAct += parseFloat(record.PMENDCRELUEABNORMALSGNBACT || 0);
    group.pmEndcRelUeAbnormalMenbAct += parseFloat(record.PMENDCRELUEABNORMALMENBACT || 0);
  });
  
  // Calculate KPIs for each group
  const kpiRecords = Object.values(groups).map(group => {
    // KPI 1: EN-DC Setup Success Rate
    const endcSetupSuccessRate = group.pmEndcSetupUeAtt > 0
      ? (group.pmEndcSetupUeSucc / group.pmEndcSetupUeAtt) * 100
      : null;
    
    // KPI 2: EN-DC Intra-sgNodeB PSCell Change Success Rate
    const endcIntraChangeSuccessRate = group.pmEndcPsCellChangeAttIntraSgnb > 0
      ? (group.pmEndcPsCellChangeSuccIntraSgnb / group.pmEndcPsCellChangeAttIntraSgnb) * 100
      : null;
    
    // KPI 3: EN-DC Inter-sgNodeB PSCell Change Success Rate
    const endcInterChangeSuccessRate = group.pmEndcPsCellChangeAttInterSgnb > 0
      ? (group.pmEndcPsCellChangeSuccInterSgnb / group.pmEndcPsCellChangeAttInterSgnb) * 100
      : null;
    
    // KPI 4: SCG Active Radio Resource Retainability considering EN-DC connectivity
    // Formula: (100*(SUM(PMENDCRELUEABNORMALMENB)+SUM(PMENDCRELUEABNORMALSGNBACT))) / 
    //          ((SUM(PMENDCRELUENORMAL)+SUM(PMENDCRELUEABNORMALMENB)+SUM(PMENDCRELUEABNORMALSGNB))-
    //           SUM(PMENDCPSCELLCHANGESUCCINTERSGNB))
    const denominator4 = (group.pmEndcRelUeNormal + group.pmEndcRelUeAbnormalMenb + 
                          group.pmEndcRelUeAbnormalSgnb) - group.pmEndcPsCellChangeSuccInterSgnb;
    const scgRetainabilityEndcConnectivity = denominator4 > 0
      ? (100 * (group.pmEndcRelUeAbnormalMenb + group.pmEndcRelUeAbnormalSgnbAct)) / denominator4
      : null;
    
    // KPI 5: SCG Active Radio Resource Retainability
    // Formula: ((100*(SUM(PMENDCRELUEABNORMALMENBACT)+SUM(PMENDCRELUEABNORMALSGNBACT))) /
    //          (100*(SUM(PMENDCRELUEABNORMALMENB)+SUM(PMENDCRELUEABNORMALSGNB)))
    const denominator5 = 100 * (group.pmEndcRelUeAbnormalMenb + group.pmEndcRelUeAbnormalSgnb);
    const scgRetainabilityActive = denominator5 > 0
      ? (100 * (group.pmEndcRelUeAbnormalMenbAct + group.pmEndcRelUeAbnormalSgnbAct)) / denominator5
      : null;
    
    // KPI 6: SCG Radio Resource Retainability
    // Formula: (SUM(PMENDCRELUENORMAL)+SUM(PMENDCRELUEABNORMALMENB)+SUM(PMENDCRELUEABNORMALSGNB)) /
    //          (10*(SUM(PMENDCRELUEABNORMALMENB)+SUM(PMENDCRELUEABNORMALSGNB)))
    const denominator6 = 10 * (group.pmEndcRelUeAbnormalMenb + group.pmEndcRelUeAbnormalSgnb);
    const scgRetainabilityOverall = denominator6 > 0
      ? (group.pmEndcRelUeNormal + group.pmEndcRelUeAbnormalMenb + group.pmEndcRelUeAbnormalSgnb) / denominator6
      : null;
    
    return {
      date_id: group.dateId,
      hour_id: group.hourId,
      freq_band: group.freqBand,
      endc_setup_success_rate: endcSetupSuccessRate,
      endc_intra_pscell_change_success_rate: endcIntraChangeSuccessRate,
      endc_inter_pscell_change_success_rate: endcInterChangeSuccessRate,
      scg_retainability_endc_connectivity: scgRetainabilityEndcConnectivity,
      scg_retainability_active: scgRetainabilityActive,
      scg_retainability_overall: scgRetainabilityOverall,
    };
  });
  
  return kpiRecords;
};

/**
 * Insert NR KPI data (UPSERT - update if date/hour/freq_band exists)
 */
export const insertKpiData = async (records) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    let insertedCount = 0;
    let updatedCount = 0;
    
    for (const record of records) {
      const query = `
        INSERT INTO nr_kpi_data (
          date_id,
          hour_id,
          freq_band,
          endc_setup_success_rate,
          endc_intra_pscell_change_success_rate,
          endc_inter_pscell_change_success_rate,
          scg_retainability_endc_connectivity,
          scg_retainability_active,
          scg_retainability_overall
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (date_id, hour_id, freq_band)
        DO UPDATE SET
          endc_setup_success_rate = EXCLUDED.endc_setup_success_rate,
          endc_intra_pscell_change_success_rate = EXCLUDED.endc_intra_pscell_change_success_rate,
          endc_inter_pscell_change_success_rate = EXCLUDED.endc_inter_pscell_change_success_rate,
          scg_retainability_endc_connectivity = EXCLUDED.scg_retainability_endc_connectivity,
          scg_retainability_active = EXCLUDED.scg_retainability_active,
          scg_retainability_overall = EXCLUDED.scg_retainability_overall,
          created_at = CURRENT_TIMESTAMP
        RETURNING (xmax = 0) AS inserted;
      `;
      
      const result = await client.query(query, [
        record.date_id,
        record.hour_id,
        record.freq_band,
        record.endc_setup_success_rate,
        record.endc_intra_pscell_change_success_rate,
        record.endc_inter_pscell_change_success_rate,
        record.scg_retainability_endc_connectivity,
        record.scg_retainability_active,
        record.scg_retainability_overall,
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
 * Get NR KPI data for a date range
 */
export const getKpiData = async (startDate, endDate) => {
  const query = `
    SELECT 
      date_id,
      hour_id,
      freq_band,
      endc_setup_success_rate,
      endc_intra_pscell_change_success_rate,
      endc_inter_pscell_change_success_rate,
      scg_retainability_endc_connectivity,
      scg_retainability_active,
      scg_retainability_overall
    FROM nr_kpi_data
    WHERE date_id >= $1 AND date_id <= $2
    ORDER BY date_id, hour_id, freq_band;
  `;
  
  const result = await pool.query(query, [startDate, endDate]);
  return result.rows;
};

/**
 * Delete NR KPI data for a date range
 */
export const deleteKpiData = async (startDate, endDate) => {
  const query = `
    DELETE FROM nr_kpi_data
    WHERE date_id >= $1 AND date_id <= $2;
  `;
  
  const result = await pool.query(query, [startDate, endDate]);
  return result.rowCount;
};
