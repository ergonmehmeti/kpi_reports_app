/**
 * Date/Time parsing utilities for KPI data
 */

/**
 * Convert Excel serial date to JS Date
 * Excel serial dates are days since 1900-01-01 (with a bug for 1900 leap year)
 */
export function excelSerialToDate(serial) {
  // Excel epoch is January 1, 1900 (but Excel incorrectly considers 1900 a leap year)
  const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899
  const msPerDay = 24 * 60 * 60 * 1000;
  
  const days = Math.floor(serial);
  const timeFraction = serial - days;
  
  const date = new Date(excelEpoch.getTime() + days * msPerDay);
  
  // Calculate hours from the fractional part
  const totalMinutes = Math.round(timeFraction * 24 * 60);
  const hours = Math.floor(totalMinutes / 60);
  
  return { date, hours };
}

/**
 * Parse datetime - handles both string format and Excel serial numbers
 * String: "11/24/2025 12:00"
 * Excel serial: 45985.5 (days since 1900 + fraction for time)
 * 
 * @param {number|string} datetimeValue - The datetime value to parse
 * @param {number} rowIndex - Row index for error reporting
 * @returns {{ date: string, hour: number }} - Parsed date (YYYY-MM-DD) and hour (0-23)
 */
export function parseDatetime(datetimeValue, rowIndex) {
  // Check if it's a number (Excel serial date)
  if (typeof datetimeValue === 'number') {
    const { date, hours } = excelSerialToDate(datetimeValue);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return {
      date: `${year}-${month}-${day}`,
      hour: hours
    };
  }
  
  // String format: "MM/DD/YYYY HH:00"
  const match = String(datetimeValue).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):00/);
  if (!match) {
    throw new Error(`Invalid datetime format: ${datetimeValue}`);
  }
  
  const [, month, day, year, hour] = match;
  
  return {
    date: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
    hour: parseInt(hour)
  };
}

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date string
 */
export function formatDate(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}
