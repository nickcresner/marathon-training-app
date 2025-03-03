// src/components/WorkoutList.js
import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

function WorkoutList({ workouts, currentPhase }) {
  // Get the current phase info from the phase ID
  const getCurrentPhaseInfo = (phaseId) => {
    const phaseInfo = {
      base: { name: 'Base Phase (Weeks 1-4)', description: 'Foundation phase focusing on building basic strength and form' },
      build: { name: 'Build Phase (Weeks 5-8)', description: 'Progressive overload phase with increased intensity' },
      peak: { name: 'Peak Phase (Weeks 9-12)', description: 'Race preparation with peak performance workouts' },
      taper: { name: 'Taper Phase (Weeks 13-16)', description: 'Pre-race tapering to maximize race day performance' }
    };
    return phaseInfo[phaseId] || { name: 'Training Phase', description: '' };
  };
  
  const phaseInfo = getCurrentPhaseInfo(currentPhase);
  const { weekId } = useParams();
  const navigate = useNavigate();
  
  const parsedWeekId = parseInt(weekId);
  
  // Filter workouts for the selected week and phase
  const weekWorkouts = workouts.filter(workout => 
    workout.week === parsedWeekId && 
    workout.phase === currentPhase
  );
  
  console.log(`WorkoutList: Found ${weekWorkouts.length} workouts for week ${parsedWeekId} in phase ${currentPhase}`);
  if (weekWorkouts.length === 0) {
    console.log(`All workouts:`, workouts.map(w => `Week ${w.week}, Phase ${w.phase}`));
  }
  
  // Sort workouts by day number if available
  const sortedWorkouts = [...weekWorkouts].sort((a, b) => {
    // Sort by dayNumber if available
    if (a.dayNumber && b.dayNumber) {
      return a.dayNumber - b.dayNumber;
    }
    // Otherwise sort by title
    return a.title.localeCompare(b.title);
  });
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2>Week {weekId} Workouts</h2>
          <p className="text-muted mb-0">
            <strong>{phaseInfo.name}</strong>
          </p>
        </div>
        <button 
          className="btn btn-outline-secondary" 
          onClick={() => navigate('/')}
        >
          Back to Training Plan
        </button>
      </div>
      
      <div className="alert alert-light border mb-4">
        <p className="mb-0">
          <strong>Phase Description:</strong> {phaseInfo.description}
        </p>
      </div>
      
      {sortedWorkouts.length === 0 ? (
        <div className="alert alert-info">No workouts found for this week.</div>
      ) : (
        <div>
          <p className="text-muted mb-3">
            Found {sortedWorkouts.length} workouts for Week {weekId} in {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} Phase.
          </p>
          <div className="list-group">
            {sortedWorkouts.map(workout => (
              <Link 
                key={workout.id}
                to={`/workout/${workout.id}`}
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{workout.title}</strong>
                  <p className="mb-0 text-muted small">
                    {workout.exercises ? `${workout.exercises.length} exercises` : ''} 
                    {workout.duration && ` • ${workout.duration}`}
                    
                    {/* Show superset information if any exercises are in supersets */}
                    {workout.exercises && workout.exercises.some(ex => ex.isPartOfSuperset) && (
                      <span className="ms-2 text-primary">
                        • Contains supersets
                      </span>
                    )}
                  </p>
                </div>
                <span className="badge bg-primary rounded-pill">
                  View
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkoutList;