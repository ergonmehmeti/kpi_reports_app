import React, { useState, useEffect, useCallback } from 'react';
import ChartCard from '../components/charts/ChartCard';
import KPILineChart from '../components/charts/KPILineChart';
import KPIBarChart from '../components/charts/KPIBarChart';
import { getKPIData, getGSMDailyStats } from '../services/api';
import './GSMReports.css';

// Helper function to get week number of year (ISO 8601)
const getWeekOfYear = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// Helper function to get Monday of the week
const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

// Helper function to get Sunday of the week
const getSunday = (date) => {
  const monday = getMonday(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return sunday;
};

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
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [showWeekSelector, setShowWeekSelector] = useState(true);

  // Generate weeks (current week + 20 weeks back, NO future weeks)
  const generateWeeks = useCallback(() => {
    const weeks = [];
    const today = new Date();
    
    // Only generate past weeks (0 to -20)
    for (let i = 0; i >= -20; i--) {
      const weekDate = new Date(today);
      weekDate.setDate(today.getDate() + (i * 7));
      
      const monday = getMonday(weekDate);
      const sunday = getSunday(weekDate);
      const weekOfYear = getWeekOfYear(monday);
      
      weeks.push({
        id: i,
        monday,
        sunday,
        weekOfYear,
        year: monday.getFullYear(),
        label: `Week ${weekOfYear} (${monday.getDate().toString().padStart(2, '0')}/${(monday.getMonth() + 1).toString().padStart(2, '0')} - ${sunday.getDate().toString().padStart(2, '0')}/${(sunday.getMonth() + 1).toString().padStart(2, '0')}) - ${monday.getFullYear()}`
      });
    }
    
    return weeks;
  }, []);

  useEffect(() => {
    const weeks = generateWeeks();
    setAvailableWeeks(weeks);
    
    // Set LAST FULL week as default (not current week)
    const lastFullWeek = weeks.find(w => w.id === -1);
    setSelectedWeek(lastFullWeek);
    
    if (lastFullWeek) {
      setStartDate(lastFullWeek.monday.toISOString().split('T')[0]);
      setEndDate(lastFullWeek.sunday.toISOString().split('T')[0]);
    }
  }, [generateWeeks]);

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

  const handleWeekChange = (e) => {
    const weekId = parseInt(e.target.value);
    const week = availableWeeks.find(w => w.id === weekId);
    
    if (week) {
      setSelectedWeek(week);
      setStartDate(week.monday.toISOString().split('T')[0]);
      setEndDate(week.sunday.toISOString().split('T')[0]);
    }
  };

  const toggleDateMode = () => {
    const newMode = !showWeekSelector;
    setShowWeekSelector(newMode);
    
    // If switching to week mode, reset to last full week
    if (newMode) {
      const lastFullWeek = availableWeeks.find(w => w.id === -1);
      if (lastFullWeek) {
        setSelectedWeek(lastFullWeek);
        setStartDate(lastFullWeek.monday.toISOString().split('T')[0]);
        setEndDate(lastFullWeek.sunday.toISOString().split('T')[0]);
      }
    }
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      const params = {
        startDate,
        endDate,
      };

      console.log('Fetching GSM data with params:', params);

      // Fetch hourly data for line charts
      const hourlyResponse = await getKPIData('gsm', params);
      console.log('Hourly response:', hourlyResponse);
      
      // Fetch daily stats for bar chart
      const dailyResponse = await getGSMDailyStats(params);
      console.log('Daily response:', dailyResponse);
      
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
  }, [startDate, endDate]);

  useEffect(() => {
    // Only auto-fetch when dates change AND we're in week selector mode
    if (startDate && endDate && showWeekSelector) {
      fetchData();
    }
  }, [startDate, endDate, showWeekSelector, fetchData]);

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

  return (
    <div className="reports-page">
      <div className="content-header">
        <h2>GSM Network Reports</h2>
        <p className="content-subtitle">View and analyze GSM network KPI data (Hourly)</p>
        
        <div className="date-range-picker">
          {showWeekSelector ? (
            <div className="week-selector">
              <div className="date-input-group">
                <label htmlFor="week-select">Select Week:</label>
                <select 
                  id="week-select"
                  value={selectedWeek?.id || 0}
                  onChange={handleWeekChange}
                  className="week-dropdown"
                >
                  {availableWeeks.map(week => (
                    <option key={week.id} value={week.id}>
                      {week.label}
                    </option>
                  ))}
                </select>
              </div>
              <button className="toggle-mode-btn" onClick={toggleDateMode}>
                Custom Dates
              </button>
            </div>
          ) : (
            <>
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
              <button className="toggle-mode-btn" onClick={toggleDateMode}>
                Week View
              </button>
            </>
          )}
          <button className="refresh-btn" onClick={fetchData}>
            Refresh Data
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
        </div>
      )}

      {!error && (
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
      )}
    </div>
  );
};

export default GSMReports;
