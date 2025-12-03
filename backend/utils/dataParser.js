/**
 * Number and data parsing utilities
 */

/**
 * Parse number value (handles comma separators like "1,660.07")
 * @param {any} value - The value to parse
 * @returns {number|null} - Parsed number or null if invalid
 */
export function parseNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  // Remove commas and parse
  const cleaned = String(value).replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Get field value from row - handles both normal and __EMPTY column names
 * (When CSV has empty first row, SheetJS creates __EMPTY columns)
 * 
 * @param {object} row - The data row
 * @param {string} normalName - The expected column name
 * @param {number} emptyIndex - The index for __EMPTY format
 * @returns {any} - The field value
 */
export function getField(row, normalName, emptyIndex) {
  // Try normal column name first
  if (row[normalName] !== undefined) {
    return row[normalName];
  }
  // Try __EMPTY format (when CSV has empty first row)
  const emptyKey = emptyIndex === 0 ? '__EMPTY' : `__EMPTY_${emptyIndex}`;
  return row[emptyKey];
}

/**
 * Round number to specified decimal places
 * @param {number} value - The number to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} - Rounded number
 */
export function roundTo(value, decimals = 2) {
  if (value === null || value === undefined) return null;
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
