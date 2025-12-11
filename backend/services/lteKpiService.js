import pool from '../db/pool.js';

/**
 * Insert LTE KPI data (UPSERT - update if datetime exists)
 */
export const insertKpiData = async (records) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    let insertedCount = 0;
    let updatedCount = 0;
    
    for (const record of records) {
      const query = `
        INSERT INTO lte_kpi_data (
          datetime,
          cell_availability_pct,
          cell_unavailability_fault_pct,
          cell_unavailability_operation_pct,
          rrc_connection_success_pct,
          s1_connection_success_pct,
          erab_only_establishment_success_pct,
          initial_erab_establishment_success_pct,
          erab_drop_ratio_overall_pct,
          erab_drop_mme_pct,
          erab_drop_enb_pct,
          erab_drops_per_hour_overall,
          erab_drops_per_hour_mme,
          erab_drops_per_hour_enb,
          handover_success_ratio_pct,
          handover_execution_success_pct,
          handover_preparation_success_pct,
          avg_dl_pdcp_ue_throughput_overall_mbps,
          avg_dl_pdcp_ue_throughput_ca_mbps,
          dl_pdcp_traffic_volume_ca_gb,
          dl_pdcp_traffic_volume_without_ca_gb,
          dl_pdcp_traffic_volume_overall_gb,
          avg_ul_pdcp_ue_throughput_overall_mbps,
          ul_pdcp_traffic_volume_overall_gb,
          ul_pdcp_traffic_volume_ca_gb,
          connected_lte_users_avg,
          connected_lte_users_max,
          avg_dl_mac_cell_throughput_mbps,
          dl_mac_traffic_volume_gb,
          avg_ul_mac_cell_throughput_mbps,
          ul_mac_traffic_volume_gb,
          downlink_latency_ms,
          uplink_packet_loss_pct
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33)
        ON CONFLICT (datetime) 
        DO UPDATE SET
          cell_availability_pct = EXCLUDED.cell_availability_pct,
          cell_unavailability_fault_pct = EXCLUDED.cell_unavailability_fault_pct,
          cell_unavailability_operation_pct = EXCLUDED.cell_unavailability_operation_pct,
          rrc_connection_success_pct = EXCLUDED.rrc_connection_success_pct,
          s1_connection_success_pct = EXCLUDED.s1_connection_success_pct,
          erab_only_establishment_success_pct = EXCLUDED.erab_only_establishment_success_pct,
          initial_erab_establishment_success_pct = EXCLUDED.initial_erab_establishment_success_pct,
          erab_drop_ratio_overall_pct = EXCLUDED.erab_drop_ratio_overall_pct,
          erab_drop_mme_pct = EXCLUDED.erab_drop_mme_pct,
          erab_drop_enb_pct = EXCLUDED.erab_drop_enb_pct,
          erab_drops_per_hour_overall = EXCLUDED.erab_drops_per_hour_overall,
          erab_drops_per_hour_mme = EXCLUDED.erab_drops_per_hour_mme,
          erab_drops_per_hour_enb = EXCLUDED.erab_drops_per_hour_enb,
          handover_success_ratio_pct = EXCLUDED.handover_success_ratio_pct,
          handover_execution_success_pct = EXCLUDED.handover_execution_success_pct,
          handover_preparation_success_pct = EXCLUDED.handover_preparation_success_pct,
          avg_dl_pdcp_ue_throughput_overall_mbps = EXCLUDED.avg_dl_pdcp_ue_throughput_overall_mbps,
          avg_dl_pdcp_ue_throughput_ca_mbps = EXCLUDED.avg_dl_pdcp_ue_throughput_ca_mbps,
          dl_pdcp_traffic_volume_ca_gb = EXCLUDED.dl_pdcp_traffic_volume_ca_gb,
          dl_pdcp_traffic_volume_without_ca_gb = EXCLUDED.dl_pdcp_traffic_volume_without_ca_gb,
          dl_pdcp_traffic_volume_overall_gb = EXCLUDED.dl_pdcp_traffic_volume_overall_gb,
          avg_ul_pdcp_ue_throughput_overall_mbps = EXCLUDED.avg_ul_pdcp_ue_throughput_overall_mbps,
          ul_pdcp_traffic_volume_overall_gb = EXCLUDED.ul_pdcp_traffic_volume_overall_gb,
          ul_pdcp_traffic_volume_ca_gb = EXCLUDED.ul_pdcp_traffic_volume_ca_gb,
          connected_lte_users_avg = EXCLUDED.connected_lte_users_avg,
          connected_lte_users_max = EXCLUDED.connected_lte_users_max,
          avg_dl_mac_cell_throughput_mbps = EXCLUDED.avg_dl_mac_cell_throughput_mbps,
          dl_mac_traffic_volume_gb = EXCLUDED.dl_mac_traffic_volume_gb,
          avg_ul_mac_cell_throughput_mbps = EXCLUDED.avg_ul_mac_cell_throughput_mbps,
          ul_mac_traffic_volume_gb = EXCLUDED.ul_mac_traffic_volume_gb,
          downlink_latency_ms = EXCLUDED.downlink_latency_ms,
          uplink_packet_loss_pct = EXCLUDED.uplink_packet_loss_pct
        RETURNING (xmax = 0) AS inserted
      `;
      
      const values = [
        record.datetime,
        record.cell_availability_pct,
        record.cell_unavailability_fault_pct,
        record.cell_unavailability_operation_pct,
        record.rrc_connection_success_pct,
        record.s1_connection_success_pct,
        record.erab_only_establishment_success_pct,
        record.initial_erab_establishment_success_pct,
        record.erab_drop_ratio_overall_pct,
        record.erab_drop_mme_pct,
        record.erab_drop_enb_pct,
        record.erab_drops_per_hour_overall,
        record.erab_drops_per_hour_mme,
        record.erab_drops_per_hour_enb,
        record.handover_success_ratio_pct,
        record.handover_execution_success_pct,
        record.handover_preparation_success_pct,
        record.avg_dl_pdcp_ue_throughput_overall_mbps,
        record.avg_dl_pdcp_ue_throughput_ca_mbps,
        record.dl_pdcp_traffic_volume_ca_gb,
        record.dl_pdcp_traffic_volume_without_ca_gb,
        record.dl_pdcp_traffic_volume_overall_gb,
        record.avg_ul_pdcp_ue_throughput_overall_mbps,
        record.ul_pdcp_traffic_volume_overall_gb,
        record.ul_pdcp_traffic_volume_ca_gb,
        record.connected_lte_users_avg,
        record.connected_lte_users_max,
        record.avg_dl_mac_cell_throughput_mbps,
        record.dl_mac_traffic_volume_gb,
        record.avg_ul_mac_cell_throughput_mbps,
        record.ul_mac_traffic_volume_gb,
        record.downlink_latency_ms,
        record.uplink_packet_loss_pct
      ];
      
      const result = await client.query(query, values);
      
      // Check if this was an insert (xmax = 0) or update (xmax > 0)
      if (result.rows[0].inserted) {
        insertedCount++;
      } else {
        updatedCount++;
      }
    }
    
    await client.query('COMMIT');
    return { inserted: insertedCount, updated: updatedCount };
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get LTE KPI data for a date range
 */
export const getKpiData = async (startDate, endDate) => {
  const query = `
    SELECT *
    FROM lte_kpi_data
    WHERE datetime >= $1::timestamp AND datetime < ($2::timestamp + INTERVAL '1 day')
    ORDER BY datetime ASC
  `;
  
  const result = await pool.query(query, [startDate, endDate]);
  return result.rows;
};

export default { insertKpiData, getKpiData };
