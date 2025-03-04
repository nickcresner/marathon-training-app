// src/components/BlockSelection.js
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

function BlockSelection({ weeks, weekBlocks, phases, currentPhase, onPhaseChange, workouts }) {
  // Handle phase selection
  const handlePhaseClick = (phaseId) => {
    onPhaseChange(phaseId);
    // Scroll to the workouts section
    document.getElementById('workouts-section').scrollIntoView({ behavior: 'smooth' });
  };

  // Monitor phase changes
  useEffect(() => {
    // Phase changed - no logging needed
  }, [currentPhase, weeks, workouts]);

  // Find the current phase object
  const currentPhaseInfo = phases.find(phase => phase.id === currentPhase) || phases[0];
  
  // Filter workouts for the current phase
  let phaseWorkouts = workouts.filter(workout => workout.phase === currentPhase);
  
  // Always add hardcoded workouts for Week 5-8 and 9-12 to ensure they appear
  
  // Add Day 1 for Week 5-8 (conditioning phase)
  if (currentPhase === 'conditioning') {
    // First remove any existing Day 1 workouts to avoid duplicates
    phaseWorkouts = phaseWorkouts.filter(w => w.week !== 5 || w.dayNumber !== 1);
    
    const week5Workout = {
      id: 'conditioning-week5-day1-v2',
      title: 'Day 1: Power + Strength',
      description: 'Power and strength training workout for upper body',
      phase: 'conditioning',
      week: 5,
      day: 'Day 1',
      dayNumber: 1,
      duration: '60 mins',
      exercises: [
        {
          id: 'conditioning-week5-day1-ex1',
          name: 'Trap Bar Deadlift',
          sets: '4',
          reps: '5',
          tempo: 'Explosive',
          load: '80% 3RM',
          rest: '90s',
          notes: 'Focus on power and form',
          supersetId: 'A',
          supersetOrder: 1,
          isPartOfSuperset: true
        },
        {
          id: 'conditioning-week5-day1-ex2',
          name: 'Broad Jump',
          sets: '4',
          reps: '5',
          tempo: 'Explosive',
          load: 'Bodyweight',
          rest: '90s',
          notes: 'Maximum distance',
          supersetId: 'A',
          supersetOrder: 2,
          isPartOfSuperset: true
        }
      ]
    };
    phaseWorkouts.push(week5Workout);
  }
  
  // Add Day 1 for Week 9-12 (mobility phase)
  if (currentPhase === 'mobility') {
    // First remove any existing Day 1 workouts to avoid duplicates
    phaseWorkouts = phaseWorkouts.filter(w => w.week !== 9 || w.dayNumber !== 1);
    
    const week9Workout = {
      id: 'mobility-week9-day1-v2',
      title: 'Day 1: Lower Strength and Conditioning',
      description: 'Lower body strength and conditioning workout',
      phase: 'mobility',
      week: 9,
      day: 'Day 1',
      dayNumber: 1,
      duration: '60 mins',
      exercises: [
        {
          id: 'mobility-week9-day1-ex1',
          name: 'Heel Elevated Trap Bar Deadlift',
          sets: '4',
          reps: '4-4 cluster',
          tempo: 'Controlled',
          load: 'RPE 8',
          rest: '90s',
          notes: 'See notes',
          supersetId: 'A',
          supersetOrder: 1,
          isPartOfSuperset: true
        },
        {
          id: 'mobility-week9-day1-ex2',
          name: 'Dual DB Loaded Box Jump',
          sets: '4',
          reps: '6',
          tempo: 'Explosive',
          load: 'Light DBs',
          rest: '90s',
          notes: '',
          supersetId: 'A',
          supersetOrder: 2,
          isPartOfSuperset: true
        }
      ]
    };
    phaseWorkouts.push(week9Workout);
  }
  
  // Ensure we have workouts for each phase
  const week5Workouts = phaseWorkouts.filter(w => w.week === 5);
  const week9Workouts = phaseWorkouts.filter(w => w.week === 9);
  
  // Sort workouts by week and day if available
  const sortedWorkouts = [...phaseWorkouts].sort((a, b) => {
    // First sort by week
    if (a.week !== b.week) {
      return a.week - b.week;
    }
    // Then by day number if available
    if (a.dayNumber && b.dayNumber) {
      return a.dayNumber - b.dayNumber;
    }
    // Otherwise sort by title
    return a.title.localeCompare(b.title);
  });
  
  return (
    <div>
      {/* Training Phase Selector */}
      <div className="row mb-5">
        <div className="col-12 mb-3">
          <h2 className="text-center">Training Phases</h2>
          <p className="text-center text-muted">Select your training phase</p>
        </div>
        
        <div className="row justify-content-center">
          {phases.map(phase => (
            <div key={phase.id} className="col-md-6 col-lg-3 mb-4">
              <div 
                className={`phase-card ${currentPhase === phase.id ? 'active' : ''}`}
                onClick={() => handlePhaseClick(phase.id)}
              >
                <div className="phase-icon">
                  {phase.id === 'strength' && <i className="bi bi-activity"></i>}
                  {phase.id === 'conditioning' && <i className="bi bi-heart-pulse"></i>}
                  {phase.id === 'mobility' && <i className="bi bi-person-walking"></i>}
                </div>
                <h3 className="phase-title">{phase.name}</h3>
                <p className="phase-desc">{phase.description}</p>
                <button
                  type="button"
                  className={`btn ${currentPhase === phase.id ? 'btn-primary' : 'btn-outline-primary'} mt-3`}
                >
                  {currentPhase === phase.id ? 'Selected' : 'Select'}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Current Phase Description */}
        <div className="col-12 mt-3">
          <div className="alert alert-info text-center">
            <strong>{currentPhaseInfo.name}</strong>
            <p className="mb-0 mt-1">{currentPhaseInfo.description}</p>
            <p className="mb-0 mt-2 small">
              <strong>Training Type:</strong> {currentPhaseInfo.name} workouts from your training plan
            </p>
          </div>
        </div>
      </div>
      
      {/* Workouts Section */}
      <div className="row" id="workouts-section">
        <div className="col-12 mb-4">
          <h3 className="text-center">{currentPhaseInfo.name} Workouts</h3>
          <p className="text-center text-muted">
            {sortedWorkouts.length} workouts available in this phase
          </p>
        </div>
        
        {sortedWorkouts.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-warning text-center">
              No workouts found for this training phase. Try selecting a different phase.
            </div>
          </div>
        ) : (
          <div className="row">
            {sortedWorkouts.map(workout => (
              <div key={workout.id} className="col-md-6 col-lg-4 mb-4">
                <Link 
                  to={`/workout/${workout.id}`}
                  className="card h-100 text-decoration-none slide-in"
                  style={{ transition: 'all 0.3s ease' }}
                >
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="badge bg-primary">Week {currentPhaseInfo.weekStart}-{currentPhaseInfo.weekEnd}</span>
                      <span className="workout-day badge bg-secondary">{workout.day}</span>
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
        )}
      </div>
    </div>
  );
}

export default BlockSelection;