/**
 * LTE Traffic Chart Configurations
 * Defines chart settings for LTE daily site traffic visualizations
 */

export const getLTEChartConfigs = () => {
  return [
    {
      id: 'top-20-sites',
      title: 'Top 20 Sites by LTE Traffic Volume (DL/UL)',
      type: 'horizontal-stacked-bar',
      dataKeys: ['dl_traffic_gb', 'ul_traffic_gb'],
      colors: ['#60a5fa', '#fb923c'], // Blue for DL, Orange for UL
      labels: ['Download (DL)', 'Upload (UL)'],
      format: (value) => `${value?.toFixed(0) || 0}`,
      description: 'Top 20 sites by total traffic with DL/UL breakdown',
      layout: 'horizontal'
    },
    {
      id: 'bottom-20-sites',
      title: 'Bottom 20 Sites by LTE Traffic Volume (DL/UL)',
      type: 'horizontal-stacked-bar',
      dataKeys: ['dl_traffic_gb', 'ul_traffic_gb'],
      colors: ['#60a5fa', '#fb923c'],
      labels: ['Download (DL)', 'Upload (UL)'],
      format: (value) => `${value?.toFixed(0) || 0}`,
      description: 'Bottom 20 sites by total traffic with DL/UL breakdown',
      layout: 'horizontal'
    }
  ];
};

/**
 * Get chart configuration for a specific type
 */
export const getChartConfigByType = (type) => {
  const configs = getLTEChartConfigs();
  return configs.find(config => config.id === type);
};
