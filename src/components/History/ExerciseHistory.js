import React, { useState } from 'react';

/**
 * Component to display an exercise's history from the Google Sheet and user tracking
 */
function ExerciseHistory({ history }) {
  const [showSheetData, setShowSheetData] = useState(true);
  
  // Filter history entries based on source
  const sheetEntries = history.filter(entry => !entry.fromApp);
  const appEntries = history.filter(entry => entry.fromApp);
  
  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  if (!history || history.length === 0) {
    return (
      <div className="alert alert-info">
        No history available for this exercise yet.
      </div>
    );
  }

  return (
    <div className="exercise-history">
      {/* Toggle button for sheet/app history */}
      {sheetEntries.length > 0 && appEntries.length > 0 && (
        <div className="btn-group mb-3" role="group">
          <button 
            type="button" 
            className={`btn ${showSheetData ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setShowSheetData(true)}
          >
            Sheet History
          </button>
          <button 
            type="button" 
            className={`btn ${!showSheetData ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setShowSheetData(false)}
          >
            Your History
          </button>
        </div>
      )}

      {/* Render history table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Date</th>
              <th>Load</th>
              <th>Sets</th>
              <th>Reps</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {/* Display Google Sheet history or app history based on toggle */}
            {(showSheetData ? sheetEntries : appEntries).map((entry, index) => (
              <tr key={`history-${index}`}>
                <td>{formatDate(entry.date)}</td>
                <td className="text-center fw-bold">{entry.actualLoad || '-'}</td>
                <td className="text-center">{entry.actualSets || '-'}</td>
                <td className="text-center">{entry.actualReps || '-'}</td>
                <td>{entry.notes || '-'}</td>
              </tr>
            ))}
            {/* Show message if no entries for the selected type */}
            {(showSheetData ? sheetEntries : appEntries).length === 0 && (
              <tr>
                <td colSpan="5" className="text-center">
                  No {showSheetData ? 'sheet' : 'user'} history available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExerciseHistory;