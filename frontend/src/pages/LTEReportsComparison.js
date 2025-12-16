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
