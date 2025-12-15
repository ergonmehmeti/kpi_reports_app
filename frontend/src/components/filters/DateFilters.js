import React, { memo, useCallback } from 'react';

/**
 * DateFilters Component
 * Provides week selector, custom date range picker, and comparison mode
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
  onRefresh,
  hideCustomDatesButton = false,
  // Comparison mode props
  comparisonMode = false,
  onToggleComparison,
  selectedWeek2,
  onWeek2Change,
}) => {
  const handleWeekSelectChange = useCallback((e) => {
    const weekId = parseInt(e.target.value);
    onWeekChange(weekId);
  }, [onWeekChange]);

  const handleWeek2SelectChange = useCallback((e) => {
    const weekId = parseInt(e.target.value);
    if (onWeek2Change) onWeek2Change(weekId);
  }, [onWeek2Change]);

  const handleStartDateChange = useCallback((e) => {
    onStartDateChange(e.target.value);
  }, [onStartDateChange]);

  const handleEndDateChange = useCallback((e) => {
    onEndDateChange(e.target.value);
  }, [onEndDateChange]);

  // Comparison Mode UI
  if (comparisonMode) {
    return (
      <div className="date-range-picker comparison-mode">
        <div className="comparison-selectors">
          <div className="date-input-group">
            <label htmlFor="week1-select">
              <span className="week-indicator week1-indicator">●</span> Week 1 (Blue):
            </label>
            <select 
              id="week1-select"
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
          <div className="date-input-group">
            <label htmlFor="week2-select">
              <span className="week-indicator week2-indicator">●</span> Week 2 (Green):
            </label>
            <select 
              id="week2-select"
              value={selectedWeek2?.id || 0}
              onChange={handleWeek2SelectChange}
              className="week-dropdown"
            >
              {availableWeeks.map(week => (
                <option key={week.id} value={week.id}>
                  {week.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="filter-buttons">
          <button className="toggle-mode-btn comparison-active" onClick={onToggleComparison}>
            Exit Compare
          </button>
          <button className="refresh-btn" onClick={onRefresh}>
            Compare
          </button>
        </div>
      </div>
    );
  }

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
          {!hideCustomDatesButton && (
            <button className="toggle-mode-btn" onClick={onToggleMode}>
              Custom Dates
            </button>
          )}
          <button className="toggle-mode-btn compare-btn" onClick={onToggleComparison}>
            Compare Weeks
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
