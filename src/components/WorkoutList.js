// src/components/WorkoutList.js
import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

function WorkoutList({ workouts, currentPhase }) {
  // Get the current phase info from the phase ID
  const getCurrentPhaseInfo = (phaseId) => {
    const phaseInfo = {
      strength: { name: 'Week 1-4', description: 'Upper and lower body strength training workouts' },
      conditioning: { name: 'Week 5-8', description: 'Cardio conditioning and interval training' },
      mobility: { name: 'Week 9-12', description: 'Flexibility and mobility exercises' }
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="workout-title">Week {weekId} <span className="text-primary">Workouts</span></h2>
          <div className="d-flex align-items-center">
            <div className="badge badge-primary me-2">
              {phaseInfo.name}
            </div>
            <p className="text-muted mb-0">
              <i className="bi bi-calendar-week me-1"></i> Training days for week {weekId}
            </p>
          </div>
        </div>
        <button 
          className="btn btn-outline-primary" 
          onClick={() => navigate('/')}
        >
          <i className="bi bi-arrow-left me-1"></i> Back to Plan
        </button>
      </div>
      
      <div className="alert alert-info mb-4">
        <div className="d-flex align-items-center">
          <i className="bi bi-info-circle-fill me-3 fs-4"></i>
          <div>
            <h5 className="alert-heading mb-1">{phaseInfo.name}</h5>
            <p className="mb-0">{phaseInfo.description}</p>
          </div>
        </div>
      </div>
      
      {sortedWorkouts.length === 0 ? (
        <div className="alert alert-info">No workouts found for this week.</div>
      ) : (
        <div>
          <p className="text-muted mb-3">
            Found {sortedWorkouts.length} workouts for Week {weekId} in {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)} Phase.
          </p>
          <div className="row">
            {sortedWorkouts.map(workout => (
              <div key={workout.id} className="col-md-6 col-lg-4 mb-4">
                <Link 
                  to={`/workout/${workout.id}`}
                  className="card h-100 text-decoration-none slide-in"
                  style={{ transition: 'all 0.3s ease' }}
                >
                  <div className="card-body d-flex flex-column">
                    <div className="workout-day">
                      {workout.day}
                    </div>
                    <h4 className="mb-3">{workout.title.replace(/Day \d+:\s*/, '')}</h4>
                    
                    <div className="mb-3 flex-grow-1">
                      <p className="text-muted small mb-2">{workout.description}</p>
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-lightning me-2 text-warning"></i>
                        <span>{workout.exercises ? `${workout.exercises.length} exercises` : ''}</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-clock me-2 text-info"></i>
                        <span>{workout.duration}</span>
                      </div>
                      
                      {/* Show superset information */}
                      {workout.exercises && workout.exercises.some(ex => ex.isPartOfSuperset) && (
                        <div className="d-flex align-items-center">
                          <i className="bi bi-repeat me-2 text-primary"></i>
                          <span className="superset-badge">
                            Contains supersets
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-auto text-end">
                      <span className="btn btn-sm btn-primary">
                        View Workout <i className="bi bi-arrow-right ms-1"></i>
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkoutList;