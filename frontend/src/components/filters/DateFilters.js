import React, { memo, useCallback } from 'react';

/**
 * DateFilters Component
 * Provides week selector and custom date range picker
 * Memoized to prevent unnecessary re-renders
 */
const DateFilters = memo(({ 
  showWeekSelector,
  availableWeeks,
  selectedWeek,
  startDate,
  endDate,
  onWeekChange,
  onStartDateChange,
  onEndDateChange,
  onToggleMode,
  onRefresh
}) => {
  const handleWeekSelectChange = useCallback((e) => {
    const weekId = parseInt(e.target.value);
    onWeekChange(weekId);
  }, [onWeekChange]);

  const handleStartDateChange = useCallback((e) => {
    onStartDateChange(e.target.value);
  }, [onStartDateChange]);

  const handleEndDateChange = useCallback((e) => {
    onEndDateChange(e.target.value);
  }, [onEndDateChange]);

  return (
    <div className="date-range-picker">
      {showWeekSelector ? (
        <div className="week-selector">
          <div className="date-input-group">
            <label htmlFor="week-select">Select Week:</label>
            <select 
              id="week-select"
              value={selectedWeek?.id || 0}
              onChange={handleWeekSelectChange}
              className="week-dropdown"
            >
              {availableWeeks.map(week => (
                <option key={week.id} value={week.id}>
                  {week.label}
                </option>
              ))}
            </select>
          </div>
          <button className="toggle-mode-btn" onClick={onToggleMode}>
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
              onChange={handleStartDateChange}
              max={endDate}
            />
          </div>
          <div className="date-input-group">
            <label htmlFor="end-date">End Date:</label>
            <input 
              type="date" 
              id="end-date"
              value={endDate}
              onChange={handleEndDateChange}
              min={startDate}
            />
          </div>
          <button className="toggle-mode-btn" onClick={onToggleMode}>
            Week View
          </button>
        </>
      )}
      <button className="refresh-btn" onClick={onRefresh}>
        Refresh Data
      </button>
    </div>
  );
});

DateFilters.displayName = 'DateFilters';

export default DateFilters;
