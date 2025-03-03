// src/components/BlockSelection.js
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

function BlockSelection({ weeks, weekBlocks, phases, currentPhase, onPhaseChange, workouts }) {
  // Directly go to specific tab when selecting a training phase
  const handlePhaseClick = (phaseId) => {
    onPhaseChange(phaseId);
    // Scroll to the training blocks section
    document.getElementById('training-blocks').scrollIntoView({ behavior: 'smooth' });
  };
  // Debug info
  useEffect(() => {
    console.log(`BlockSelection rendering for phase: ${currentPhase}`);
    console.log(`Available weeks: ${weeks ? weeks.join(', ') : 'none'}`);
    console.log(`Total workouts: ${workouts ? workouts.length : 0}`);
    
    if (workouts && workouts.length > 0) {
      console.log(`Sample workout: ${workouts[0].title}, week: ${workouts[0].week}, phase: ${workouts[0].phase}`);
    }
  }, [currentPhase, weeks, workouts]);
  // Find the current phase object
  const currentPhaseInfo = phases.find(phase => phase.id === currentPhase) || phases[0];
  
  // Define week block descriptions - using generic descriptions since we now match Google Sheet tabs directly
  const blockDescriptions = {
    1: 'First block of training sessions',
    2: 'Second block of training sessions',
    3: 'Third block of training sessions',
    4: 'Fourth block of training sessions'
  };
  
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
      
      {/* Training Blocks Grid */}
      <div className="row" id="training-blocks">
        <div className="col-12 mb-4">
          <h3 className="text-center">Training Weeks</h3>
          <p className="text-center text-muted">Select a week to view workouts</p>
        </div>
        
        {weekBlocks.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-warning text-center">
              No workouts found for this training phase. Try selecting a different phase.
            </div>
          </div>
        ) : (
          weekBlocks.map(block => (
            <div key={block.id} className="col-md-6 mb-4">
              <div className="card h-100 fade-in">
                <div className="card-header bg-primary text-white">
                  <h5 className="card-title mb-0">{block.label}</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="text-center mb-3">
                      <span className="badge bg-primary rounded-pill fs-6 px-3 py-2">
                        {currentPhaseInfo.name}
                      </span>
                    </div>
                    <p className="card-text text-center fs-5">
                      View workouts for these weeks
                    </p>
                  </div>
                  
                  <div className="d-flex flex-wrap mb-3">
                    {block.weeks.map(week => (
                      <Link 
                        key={week} 
                        to={`/week/${week}`}
                        className="week-btn m-1"
                      >
                        Week {week}
                      </Link>
                    ))}
                  </div>
                  
                  <div className="text-muted small mt-3">
                    <i className="bi bi-calendar-check me-2"></i>
                    Contains {block.weeks.length} weeks with {
                      weeks.filter(w => block.weeks.includes(w)).length > 0 
                        ? weeks.filter(w => block.weeks.includes(w)).reduce((count, w) => {
                            return count + workouts.filter(workout => workout.week === w).length;
                          }, 0)
                        : 0
                    } workouts
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BlockSelection;