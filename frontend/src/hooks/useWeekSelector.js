import { useState, useEffect, useCallback } from 'react';
import { getWeekOfYear, getMonday, getSunday, formatWeekLabel, getISOWeekYear } from '../utils/dateHelpers';

/**
 * Custom hook for managing week selection
 * @param {number} weeksBack - Number of past weeks to generate (default: 20)
 * @returns {Object} Week selector state and handlers
 */
export const useWeekSelector = (weeksBack = 20) => {
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(null);

  // Generate weeks (current week + N weeks back, no future weeks)
  const generateWeeks = useCallback(() => {
    const weeks = [];
    const today = new Date();
    
    // Only generate past weeks (0 to -weeksBack)
    for (let i = 0; i >= -weeksBack; i--) {
      const weekDate = new Date(today);
      weekDate.setDate(today.getDate() + (i * 7));
      
      const monday = getMonday(weekDate);
      const sunday = getSunday(weekDate);
      const weekOfYear = getWeekOfYear(monday);
      const isoYear = getISOWeekYear(monday);
      
      weeks.push({
        id: i,
        monday,
        sunday,
        weekOfYear,
        year: isoYear,
        label: formatWeekLabel(monday, sunday, weekOfYear)
      });
    }
    
    return weeks;
  }, [weeksBack]);

  useEffect(() => {
    const weeks = generateWeeks();
    setAvailableWeeks(weeks);
    
    // Set LAST FULL week as default (not current week)
    const lastFullWeek = weeks.find(w => w.id === -1);
    setSelectedWeek(lastFullWeek);
  }, [generateWeeks]);

  const handleWeekChange = useCallback((weekId) => {
    const week = availableWeeks.find(w => w.id === weekId);
    if (week) {
      setSelectedWeek(week);
    }
  }, [availableWeeks]);

  const resetToLastFullWeek = useCallback(() => {
    const lastFullWeek = availableWeeks.find(w => w.id === -1);
    if (lastFullWeek) {
      setSelectedWeek(lastFullWeek);
    }
  }, [availableWeeks]);

  return {
    availableWeeks,
    selectedWeek,
    handleWeekChange,
    resetToLastFullWeek,
  };
};
