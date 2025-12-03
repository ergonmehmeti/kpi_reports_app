import React, { useState, useEffect } from 'react';
import ChartCard from '../components/charts/ChartCard';
import KPILineChart from '../components/charts/KPILineChart';
import KPIBarChart from '../components/charts/KPIBarChart';
import { getKPIData, getGSMDailyStats } from '../services/api';
import './GSMReports.css';

const GSMReports = () => {
  const [successRateData, setSuccessRateData] = useState([]);
  const [congestionData, setCongestionData] = useState([]);
  const [trafficVolumeData, setTrafficVolumeData] = useState([]);
  const [cellAvailabilityData, setCellAvailabilityData] = useState([]);
  const [sdcchCongestionData, setSdcchCongestionData] = useState([]);
  const [sdcchDropRateData, setSdcchDropRateData] = useState([]);
  const [callDropRateData, setCallDropRateData] = useState([]);
  const [callMinutesPerDropData, setCallMinutesPerDropData] = useState([]);
  const [handoverSuccessData, setHandoverSuccessData] = useState([]);
  const [handoverDropRateData, setHandoverDropRateData] = useState([]);
  const [voiceQualityData, setVoiceQualityData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Date range state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Chart configuration
  const chartConfigs = [
    { title: 'Cell Availability', data: cellAvailabilityData, dataKey: 'Availability', yAxisLabel: '%', type: 'line' },
    { title: 'Good Voice Quality Ratio UL', data: voiceQualityData, dataKey: 'Voice Quality', yAxisLabel: '%', type: 'line' },
    { title: 'Traffic Volume', data: trafficVolumeData, dataKey: 'Traffic Volume', yAxisLabel: 'Erlangs', type: 'line' },
    { title: 'Daily Traffic Volume', data: barChartData, dataKey: 'Traffic Volume', yAxisLabel: 'Erlangs', type: 'bar', badge: 'Daily Cumulative' },
    { title: 'SDCCH Congestion', data: sdcchCongestionData, dataKey: 'SDCCH Congestion', yAxisLabel: '%', type: 'line' },
    { title: 'SDCCH Drop Rate', data: sdcchDropRateData, dataKey: 'SDCCH Drop Rate', yAxisLabel: '%', type: 'line' },
    { title: 'TCH Assignment Success Rate', data: successRateData, dataKey: 'Success Rate', yAxisLabel: '%', type: 'line' },
    { title: 'Subscriber TCH Congestion', data: congestionData, dataKey: 'Congestion', yAxisLabel: '%', type: 'line' },
    { title: 'Call Drop Rate', data: callDropRateData, dataKey: 'Call Drop Rate', yAxisLabel: '%', type: 'line' },
    { title: 'Call Minutes per Drop', data: callMinutesPerDropData, dataKey: 'Minutes per Drop', yAxisLabel: 'Minutes', type: 'line' },
    { title: 'Handover Success Rate', data: handoverSuccessData, dataKey: 'Handover Success', yAxisLabel: '%', type: 'line' },
    { title: 'Handover Drop Rate', data: handoverDropRateData, dataKey: 'Handover Drop Rate', yAxisLabel: '%', type: 'line' },
  ];

  useEffect(() => {
    // Set default to last 7 days
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchData();
    }
  }, [startDate, endDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const params = {
        startDate,
        endDate,
      };

      // Fetch hourly data for line charts
      const hourlyResponse = await getKPIData('gsm', params);
      
      // Fetch daily stats for bar chart
      const dailyResponse = await getGSMDailyStats(params);
      
      if (hourlyResponse.data && hourlyResponse.data.length > 0) {
        // Format data for TCH Success Rate line chart
        const successData = hourlyResponse.data.map(item => ({
          name: `${new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${item.hour}:00`,
          'Success Rate': parseFloat(item.tch_assignment_success_rate || 0).toFixed(2),
        }));

        // Format data for TCH Congestion line chart
        const congData = hourlyResponse.data.map(item => ({
          name: `${new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${item.hour}:00`,
          'Congestion': parseFloat(item.subscriber_tch_congestion || 0).toFixed(2),
        }));

        // Format data for Traffic Volume line chart (hourly)
        const trafficData = hourlyResponse.data.map(item => ({
          name: `${new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${item.hour}:00`,
          'Traffic Volume': parseFloat(item.tch_traffic_volume || 0).toFixed(2),
        }));

        // Format data for Cell Availability
        const cellAvailData = hourlyResponse.data.map(item => ({
          name: `${new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${item.hour}:00`,
          'Availability': parseFloat(item.cell_availability || 0).toFixed(2),
        }));

        // Format data for SDCCH Congestion
        const sdcchCongData = hourlyResponse.data.map(item => ({
          name: `${new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${item.hour}:00`,
          'SDCCH Congestion': parseFloat(item.sdcch_congestion || 0).toFixed(2),
        }));

        // Format data for SDCCH Drop Rate
        const sdcchDropData = hourlyResponse.data.map(item => ({
          name: `${new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${item.hour}:00`,
          'SDCCH Drop Rate': parseFloat(item.sdcch_drop_rate || 0).toFixed(2),
        }));

        // Format data for Call Drop Rate
        const callDropData = hourlyResponse.data.map(item => ({
          name: `${new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${item.hour}:00`,
          'Call Drop Rate': parseFloat(item.call_drop_rate || 0).toFixed(2),
        }));

        // Format data for Call Minutes per Drop
        const callMinutesData = hourlyResponse.data.map(item => ({
          name: `${new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${item.hour}:00`,
          'Minutes per Drop': parseFloat(item.call_minutes_per_drop || 0).toFixed(2),
        }));

        // Format data for Handover Success Rate
        const handoverData = hourlyResponse.data.map(item => ({
          name: `${new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${item.hour}:00`,
          'Handover Success': parseFloat(item.handover_success_rate || 0).toFixed(2),
        }));

        // Format data for Handover Drop Rate
        const handoverDropData = hourlyResponse.data.map(item => ({
          name: `${new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${item.hour}:00`,
          'Handover Drop Rate': parseFloat(item.handover_drop_rate || 0).toFixed(2),
        }));

        // Format data for Voice Quality
        const voiceQualData = hourlyResponse.data.map(item => ({
          name: `${new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${item.hour}:00`,
          'Voice Quality': parseFloat(item.good_voice_qual_ratio_ul || 0).toFixed(2),
        }));

        setSuccessRateData(successData);
        setCongestionData(congData);
        setTrafficVolumeData(trafficData);
        setCellAvailabilityData(cellAvailData);
        setSdcchCongestionData(sdcchCongData);
        setSdcchDropRateData(sdcchDropData);
        setCallDropRateData(callDropData);
        setCallMinutesPerDropData(callMinutesData);
        setHandoverSuccessData(handoverData);
        setHandoverDropRateData(handoverDropData);
        setVoiceQualityData(voiceQualData);
      } else {
        setError('No data available. Please import GSM CSV data first.');
      }

      if (dailyResponse.data && dailyResponse.data.length > 0) {
        // Format data for bar chart (Daily Traffic Volume)
        const barData = dailyResponse.data.map(item => ({
          name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          'Traffic Volume': parseFloat(item.total_tch_traffic_volume || 0).toFixed(2),
        }));

        setBarChartData(barData);
      }
    } catch (err) {
      console.error('Error fetching GSM data:', err);
      setError('Failed to load data. Please ensure backend is running and data is imported.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="reports-page">
        <div className="content-header">
          <h2>GSM Network Reports</h2>
          <p className="content-subtitle">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reports-page">
        <div className="content-header">
          <h2>GSM Network Reports</h2>
          <p className="content-subtitle">View and analyze GSM network KPI data</p>
        </div>
        <div className="error-message">
          <p>⚠️ {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="content-header">
        <h2>GSM Network Reports</h2>
        <p className="content-subtitle">View and analyze GSM network KPI data (Hourly)</p>
        
        <div className="date-range-picker">
          <div className="date-input-group">
            <label htmlFor="start-date">Start Date:</label>
            <input 
              type="date" 
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
            />
          </div>
          <div className="date-input-group">
            <label htmlFor="end-date">End Date:</label>
            <input 
              type="date" 
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
            />
          </div>
          <button className="refresh-btn" onClick={fetchData}>
            Refresh Data
          </button>
        </div>
      </div>

      <section className="charts-section">
        <div className="charts-grid">
          {chartConfigs.map((config, index) => (
            <ChartCard key={index} title={config.title} badge={config.badge || 'Hourly'}>
              {config.type === 'bar' ? (
                <KPIBarChart 
                  data={config.data} 
                  dataKeys={[config.dataKey]}
                  yAxisLabel={config.yAxisLabel}
                />
              ) : (
                <KPILineChart 
                  data={config.data} 
                  dataKeys={[config.dataKey]}
                  yAxisLabel={config.yAxisLabel}
                />
              )}
            </ChartCard>
          ))}
        </div>
      </section>
    </div>
  );
};

export default GSMReports;
