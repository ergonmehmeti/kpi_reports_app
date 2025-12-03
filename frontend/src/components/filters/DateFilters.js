import React from 'react';

/**
 * DateFilters Component
 * Provides week selector and custom date range picker
 */
const DateFilters = ({ 
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
  const handleWeekSelectChange = (e) => {
    const weekId = parseInt(e.target.value);
    onWeekChange(weekId);
  };

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
              onChange={(e) => onStartDateChange(e.target.value)}
              max={endDate}
            />
          </div>
          <div className="date-input-group">
            <label htmlFor="end-date">End Date:</label>
            <input 
              type="date" 
              id="end-date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
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
};

export default DateFilters;
