import React from 'react';
import ChartCard from '../components/charts/ChartCard';
import ComparisonLineChart from '../components/charts/ComparisonLineChart';
import { LTE_KPI_OPTIONS } from '../hooks/useLTEComparisonData';
import './GSMReports.css';
import './LTEReports.css';

/**
 * LTEReportsComparison Component
 * Handles all comparison view logic and rendering for LTE reports
 */
const LTEReportsComparison = ({
  comparisonData,
  siteTrafficComparison,
  frequencyComparison,
  comparisonLoading,
  comparisonError,
  week1Label,
  week2Label,
  selectedKPIs,
  includeSiteTraffic,
  includeFrequencyBand,
  handleKPIToggle,
  setIncludeSiteTraffic,
  setIncludeFrequencyBand,
  kpisByCategory
}) => {
  return (
    <>
      {/* KPI Selector for Comparison Mode */}
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
        
        {/* Site Traffic & Frequency Band Options - At Bottom */}
        <div className="site-traffic-option" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
          <label className="kpi-checkbox site-traffic-checkbox">
            <input
              type="checkbox"
              checked={includeSiteTraffic}
              onChange={() => setIncludeSiteTraffic(!includeSiteTraffic)}
            />
            <span>📊 Site Traffic Volume Analysis (DL/UL) - Top 20 & Bottom 20</span>
          </label>
          <label className="kpi-checkbox site-traffic-checkbox">
            <input
              type="checkbox"
              checked={includeFrequencyBand}
              onChange={() => setIncludeFrequencyBand(!includeFrequencyBand)}
            />
            <span>📶 LTE Data Traffic Volume by Frequency Band</span>
          </label>
        </div>
        
        <p className="kpi-selection-hint">
          {selectedKPIs.length === 0 && !includeSiteTraffic && !includeFrequencyBand
            ? '⚠️ Zgjedh të paktën një KPI ose Site Traffic për krahasim'
            : `✓ ${selectedKPIs.length} ${selectedKPIs.length === 1 ? 'KPI' : "KPI's"}${includeSiteTraffic ? ' + Site Traffic' : ''}${includeFrequencyBand ? ' + Frequency Band' : ''} të zgjedhura`}
        </p>
      </div>

      {comparisonLoading && <div className="loading">Loading comparison data...</div>}
      {comparisonError && <div className="error-message"><p>⚠️ {comparisonError}</p></div>}

      {/* Comparison Charts - KPIs first */}
      {!comparisonLoading && !comparisonError && Object.keys(comparisonData).length > 0 && (
        <section className="charts-section">
          <div className="charts-grid">
            {selectedKPIs.map(kpiId => {
              const kpiConfig = LTE_KPI_OPTIONS.find(k => k.id === kpiId);
              const chartData = comparisonData[kpiId];
              
              if (!chartData || !kpiConfig) return null;

              // Match main Availability chart behavior for Cell Availability (%):
              // - Y max capped at 100
              // - Y min starts at floored min value (e.g. 97.7 -> 97)
              // - 0.5 tick steps up to 100 (97, 97.5, 98, ... , 100)
              const isCellAvailabilityPct = kpiId === 'cell_availability';
              const isCellUnavailabilityFaultPct = kpiId === 'cell_unavailability_fault';
              const isCellUnavailabilityOperationPct = kpiId === 'cell_unavailability_operation';
              let yAxisDomain;
              let yAxisTicks;

              const maxAcrossWeeks = chartData.reduce((maxVal, row) => {
                const v1 = parseFloat(row?.[week1Label]);
                const v2 = parseFloat(row?.[week2Label]);
                const vals = [v1, v2].filter(v => Number.isFinite(v));
                if (vals.length === 0) return maxVal;
                return Math.max(maxVal, ...vals);
              }, Number.NEGATIVE_INFINITY);

              const roundUpTo = (value, step) => {
                if (!Number.isFinite(value) || value <= 0) return step;
                return Math.ceil(value / step) * step;
              };

              const safeMax = Number.isFinite(maxAcrossWeeks) ? Math.max(0, maxAcrossWeeks) : 0;

              if (isCellAvailabilityPct) {
                const minAcrossWeeks = chartData.reduce((minVal, row) => {
                  const v1 = parseFloat(row?.[week1Label]);
                  const v2 = parseFloat(row?.[week2Label]);
                  const vals = [v1, v2].filter(v => Number.isFinite(v));
                  if (vals.length === 0) return minVal;
                  return Math.min(minVal, ...vals);
                }, Number.POSITIVE_INFINITY);

                const safeMin = Number.isFinite(minAcrossWeeks) ? Math.max(0, Math.min(100, minAcrossWeeks)) : 0;
                const domainMin = Math.min(100, Math.floor(safeMin));
                yAxisDomain = [domainMin, 100];

                // Build ticks using integers to avoid floating-point drift
                const ticks = [];
                for (let i = domainMin * 2; i <= 200; i += 1) {
                  ticks.push(i / 2);
                }
                yAxisTicks = ticks;
              } else if (isCellUnavailabilityFaultPct || isCellUnavailabilityOperationPct) {
                // Match main Availability chart RIGHT axis behavior for Unavailability (%):
                // - Y min fixed at 0
                // - Y max is rounded up to nearest integer (at least 1)
                // - tick steps: 0.5 when range <= 5, otherwise 1
                const domainMax = Math.max(1, Math.ceil(safeMax));
                yAxisDomain = [0, domainMax];

                if (domainMax <= 5) {
                  const ticks = [];
                  for (let i = 0; i <= domainMax * 2; i += 1) {
                    ticks.push(i / 2);
                  }
                  yAxisTicks = ticks;
                } else {
                  const ticks = [];
                  for (let i = 0; i <= domainMax; i += 1) {
                    ticks.push(i);
                  }
                  yAxisTicks = ticks;
                }
              } else if (kpiId === 'downlink_latency') {
                // Main page: DualAxisLineChart leftAxisDomain={[0, 'autoRound10']}
                yAxisDomain = [0, roundUpTo(safeMax, 10)];
              } else if (kpiId === 'uplink_packet_loss') {
                // Main page: DualAxisLineChart rightAxisDomain={[0, 'autoRound0.2']}
                yAxisDomain = [0, roundUpTo(safeMax, 0.2)];
              } else if (kpiId === 'dl_throughput_overall' || kpiId === 'dl_throughput_ca') {
                // Main page: KPILineChart yAxisDomain={[0, 100]} for DL PDCP throughput
                yAxisDomain = [0, 100];
              } else if (kpiId === 'ul_throughput_overall' || kpiId === 'ul_throughput_ca') {
                // Main page: KPILineChart yAxisDomain={[0, 'auto']} for UL PDCP throughput
                yAxisDomain = [0, Math.max(1, Math.ceil(safeMax))];
              } else if (kpiId === 'dl_mac_throughput' || kpiId === 'ul_mac_throughput') {
                // Main page: DualAxisLineChart leftAxisDomain={[0, 'autoRound10']} for MAC throughput
                yAxisDomain = [0, roundUpTo(safeMax, 10)];
              } else if (kpiId === 'connected_users_avg') {
                // Let Recharts auto-scale for average connected users
                yAxisDomain = [0, 'auto'];
              } else if (kpiId === 'connected_users_max') {
                // Let Recharts auto-scale for max connected users
                yAxisDomain = [0, 'auto'];
              } else if (kpiId === 'dl_total_traffic_volume' || kpiId === 'ul_total_traffic_volume' || kpiId === 'dl_traffic_volume_ca' || kpiId === 'dl_traffic_volume_without_ca' || kpiId === 'dl_traffic_volume_overall' || kpiId === 'ul_traffic_volume_overall' || kpiId === 'ul_traffic_volume_ca' || kpiId === 'dl_mac_traffic_volume' || kpiId === 'ul_mac_traffic_volume') {
                // Let Recharts auto-scale for all traffic volumes
                yAxisDomain = [0, 'auto'];
              }
              
              return (
                <ChartCard 
                  key={kpiId}
                  title={kpiConfig.label} 
                  badge="Weekly Comparison"
                >
                  <ComparisonLineChart
                    data={chartData}
                    week1Label={week1Label}
                    week2Label={week2Label}
                    yAxisLabel={kpiConfig.yAxisLabel}
                    yAxisDomain={yAxisDomain}
                    yAxisTicks={yAxisTicks}
                  />
                </ChartCard>
              );
            })}
          </div>
        </section>
      )}

      {/* Site Traffic Comparison Charts - At bottom */}
      {!comparisonLoading && !comparisonError && includeSiteTraffic && 
       (siteTrafficComparison.top20.length > 0 || siteTrafficComparison.bottom20.length > 0) && (
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
              Site Traffic Volume Comparison (DL/UL)
            </h3>
            <p className="content-subtitle" style={{ fontSize: '0.875rem' }}>
              Comparing total traffic per site: <span style={{color: '#3b82f6', fontWeight: 600}}>{week1Label}</span> vs <span style={{color: '#22c55e', fontWeight: 600}}>{week2Label}</span>
            </p>
          </div>
          
          <div className="site-comparison-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
            {siteTrafficComparison.top20.length > 0 && (
              <ChartCard title="Top 20 Sites by Traffic" badge="Weekly Comparison">
                <div>
                  {siteTrafficComparison.top20.map((site, index) => (
                    <div key={site.site_name} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '6px 0',
                      borderBottom: index < 19 ? '1px solid #f0f0f0' : 'none'
                    }}>
                      <span style={{ width: '140px', fontSize: '0.75rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {site.site_name}
                      </span>
                      <div style={{ flex: 1, display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <div style={{
                          height: '12px',
                          width: `${Math.min((site.week1_traffic / Math.max(...siteTrafficComparison.top20.map(s => Math.max(s.week1_traffic, s.week2_traffic)))) * 100, 100)}%`,
                          backgroundColor: '#3b82f6',
                          borderRadius: '2px'
                        }}></div>
                        <span style={{ fontSize: '0.65rem', color: '#3b82f6', minWidth: '50px' }}>{site.week1_traffic.toFixed(1)} GB</span>
                      </div>
                      <div style={{ flex: 1, display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <div style={{
                          height: '12px',
                          width: `${Math.min((site.week2_traffic / Math.max(...siteTrafficComparison.top20.map(s => Math.max(s.week1_traffic, s.week2_traffic)))) * 100, 100)}%`,
                          backgroundColor: '#22c55e',
                          borderRadius: '2px'
                        }}></div>
                        <span style={{ fontSize: '0.65rem', color: '#22c55e', minWidth: '50px' }}>{site.week2_traffic.toFixed(1)} GB</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>
            )}

            {siteTrafficComparison.bottom20.length > 0 && (
              <ChartCard title="Bottom 20 Sites by Traffic" badge="Weekly Comparison">
                <div>
                  {siteTrafficComparison.bottom20.map((site, index) => (
                    <div key={site.site_name} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '6px 0',
                      borderBottom: index < 19 ? '1px solid #f0f0f0' : 'none'
                    }}>
                      <span style={{ width: '140px', fontSize: '0.75rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {site.site_name}
                      </span>
                      <div style={{ flex: 1, display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <div style={{
                          height: '12px',
                          width: `${Math.min((site.week1_traffic / Math.max(...siteTrafficComparison.bottom20.map(s => Math.max(s.week1_traffic, s.week2_traffic)), 1)) * 100, 100)}%`,
                          backgroundColor: '#3b82f6',
                          borderRadius: '2px'
                        }}></div>
                        <span style={{ fontSize: '0.65rem', color: '#3b82f6', minWidth: '50px' }}>{site.week1_traffic.toFixed(1)} GB</span>
                      </div>
                      <div style={{ flex: 1, display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <div style={{
                          height: '12px',
                          width: `${Math.min((site.week2_traffic / Math.max(...siteTrafficComparison.bottom20.map(s => Math.max(s.week1_traffic, s.week2_traffic)), 1)) * 100, 100)}%`,
                          backgroundColor: '#22c55e',
                          borderRadius: '2px'
                        }}></div>
                        <span style={{ fontSize: '0.65rem', color: '#22c55e', minWidth: '50px' }}>{site.week2_traffic.toFixed(1)} GB</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ChartCard>
            )}
          </div>
        </div>
      )}

      {/* Frequency Band Comparison Charts - 4 separate charts, one per band - At bottom */}
      {!comparisonLoading && !comparisonError && includeFrequencyBand && 
       Object.keys(frequencyComparison).length > 0 && (
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
              Comparing traffic by frequency band: <span style={{fontWeight: 600}}>{week1Label}</span> (light shade) vs <span style={{fontWeight: 600}}>{week2Label}</span> (dark shade)
            </p>
          </div>
          
          {/* Legend - showing band colors */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '50%' }}></span>
              <span style={{ color: '#475569', fontSize: '0.85rem' }}>LTE2100</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#f97316', borderRadius: '50%' }}></span>
              <span style={{ color: '#475569', fontSize: '0.85rem' }}>LTE1800</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '50%' }}></span>
              <span style={{ color: '#475569', fontSize: '0.85rem' }}>LTE900</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#ec4899', borderRadius: '50%' }}></span>
              <span style={{ color: '#475569', fontSize: '0.85rem' }}>LTE800</span>
            </div>
          </div>
          
          {/* 4 Charts Grid - one per frequency band */}
          <div className="frequency-comparison-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
            {['500 - LTE2100', '1799 - LTE1800', '3550 - LTE900', '6400 - LTE800'].map((bandName) => {
              const bandData = frequencyComparison[bandName] || [];
              
              // Band-specific colors matching main view
              // Week 1: lighter shade, Week 2: darker/stronger shade
              const bandColorSchemes = {
                '500 - LTE2100': { 
                  week1: '#93c5fd', // Light blue
                  week2: '#1d4ed8', // Strong blue
                  base: '#3b82f6'   // Base blue
                },
                '1799 - LTE1800': { 
                  week1: '#fdba74', // Light orange
                  week2: '#c2410c', // Strong orange
                  base: '#f97316'   // Base orange
                },
                '3550 - LTE900': { 
                  week1: '#6ee7b7', // Light green
                  week2: '#047857', // Strong green
                  base: '#10b981'   // Base green
                },
                '6400 - LTE800': { 
                  week1: '#f9a8d4', // Light pink
                  week2: '#be185d', // Strong pink
                  base: '#ec4899'   // Base pink
                }
              };
              
              const colorScheme = bandColorSchemes[bandName];
              
              if (bandData.length === 0) return null;
              
              // Calculate totals for summary
              const week1Total = bandData.reduce((sum, d) => sum + d.week1, 0);
              const week2Total = bandData.reduce((sum, d) => sum + d.week2, 0);
              const change = week2Total > 0 ? ((week1Total - week2Total) / week2Total * 100) : 0;
              
              return (
                <ChartCard 
                  key={bandName}
                  title={bandName} 
                  badge="Weekly Comparison"
                >
                  <div style={{ height: '300px' }}>
                    <ComparisonLineChart
                      data={bandData}
                      week1Label={week1Label}
                      week2Label={week2Label}
                      yAxisLabel="Traffic (GB)"
                      week1Key="week1"
                      week2Key="week2"
                      xAxisKey="time"
                      week1Color={colorScheme.week1}
                      week2Color={colorScheme.week2}
                    />
                  </div>
                  {/* Band Summary */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-around', 
                    padding: '12px', 
                    backgroundColor: '#f9fafb', 
                    borderRadius: '8px',
                    marginTop: '8px',
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: colorScheme.week1, fontWeight: 600 }}>{week1Total.toFixed(1)} GB</div>
                      <div style={{ color: '#6b7280' }}>{week1Label}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: colorScheme.week2, fontWeight: 600 }}>{week2Total.toFixed(1)} GB</div>
                      <div style={{ color: '#6b7280' }}>{week2Label}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        color: change > 0 ? '#22c55e' : change < 0 ? '#ef4444' : '#6b7280', 
                        fontWeight: 600 
                      }}>
                        {change > 0 ? '+' : ''}{change.toFixed(1)}%
                      </div>
                      <div style={{ color: '#6b7280' }}>Change</div>
                    </div>
                  </div>
                </ChartCard>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default LTEReportsComparison;
