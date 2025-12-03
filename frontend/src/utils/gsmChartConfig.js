/**
 * GSM KPI Chart Configuration
 * Defines all charts to be displayed in GSM Reports page
 */

export const getGSMChartConfigs = (data) => {
  return [
    { 
      title: 'Cell Availability', 
      data: data.cellAvailability, 
      dataKey: 'Availability', 
      yAxisLabel: '%', 
      type: 'line' 
    },
    { 
      title: 'Good Voice Quality Ratio UL', 
      data: data.voiceQuality, 
      dataKey: 'Voice Quality', 
      yAxisLabel: '%', 
      type: 'line' 
    },
    { 
      title: 'Traffic Volume', 
      data: data.trafficVolume, 
      dataKey: 'Traffic Volume', 
      yAxisLabel: 'Erlangs', 
      type: 'line' 
    },
    { 
      title: 'Daily Traffic Volume', 
      data: data.dailyTrafficVolume, 
      dataKey: 'Traffic Volume', 
      yAxisLabel: 'Erlangs', 
      type: 'bar', 
      badge: 'Daily Cumulative' 
    },
    { 
      title: 'SDCCH Congestion', 
      data: data.sdcchCongestion, 
      dataKey: 'SDCCH Congestion', 
      yAxisLabel: '%', 
      type: 'line' 
    },
    { 
      title: 'SDCCH Drop Rate', 
      data: data.sdcchDropRate, 
      dataKey: 'SDCCH Drop Rate', 
      yAxisLabel: '%', 
      type: 'line' 
    },
    { 
      title: 'TCH Assignment Success Rate', 
      data: data.successRate, 
      dataKey: 'Success Rate', 
      yAxisLabel: '%', 
      type: 'line' 
    },
    { 
      title: 'Subscriber TCH Congestion', 
      data: data.congestion, 
      dataKey: 'Congestion', 
      yAxisLabel: '%', 
      type: 'line' 
    },
    { 
      title: 'Call Drop Rate', 
      data: data.callDropRate, 
      dataKey: 'Call Drop Rate', 
      yAxisLabel: '%', 
      type: 'line' 
    },
    { 
      title: 'Call Minutes per Drop', 
      data: data.callMinutesPerDrop, 
      dataKey: 'Minutes per Drop', 
      yAxisLabel: 'Minutes', 
      type: 'line' 
    },
    { 
      title: 'Handover Success Rate', 
      data: data.handoverSuccess, 
      dataKey: 'Handover Success', 
      yAxisLabel: '%', 
      type: 'line' 
    },
    { 
      title: 'Handover Drop Rate', 
      data: data.handoverDropRate, 
      dataKey: 'Handover Drop Rate', 
      yAxisLabel: '%', 
      type: 'line' 
    },
  ];
};
