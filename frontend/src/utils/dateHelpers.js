/**
 * Date utility functions for week calculations
 */

/**
 * Get ISO 8601 week number of the year
 * @param {Date} date - The date to calculate week for
 * @returns {number} Week number (1-53)
 */
export const getWeekOfYear = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

/**
 * Get Monday of the week for a given date
 * @param {Date} date - Any date in the week
 * @returns {Date} Monday of that week
 */
export const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

/**
 * Get Sunday of the week for a given date
 * @param {Date} date - Any date in the week
 * @returns {Date} Sunday of that week
 */
export const getSunday = (date) => {
  const monday = getMonday(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return sunday;
};

/**
 * Format date as dd/mm
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDateDDMM = (date) => {
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
};

/**
 * Format date range label
 * @param {Date} startDate - Week start date
 * @param {Date} endDate - Week end date
 * @returns {string} Formatted label like "Week 48 (24/11 - 30/11) - 2025"
 */
export const formatWeekLabel = (startDate, endDate, weekNumber) => {
  return `Week ${weekNumber} (${formatDateDDMM(startDate)} - ${formatDateDDMM(endDate)}) - ${startDate.getFullYear()}`;
};
