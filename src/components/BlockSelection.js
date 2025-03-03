// src/components/BlockSelection.js
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

function BlockSelection({ weeks, weekBlocks, phases, currentPhase, onPhaseChange, workouts }) {
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
  const phaseInfo = phases.find(phase => phase.id === currentPhase) || phases[0];
  
  // Define week block descriptions
  const blockDescriptions = {
    1: 'Foundation phase with focus on building basic strength and form',
    2: 'Progressive overload phase with increased intensity',
    3: 'Peak performance phase with race-specific training',
    4: 'Tapering phase to prepare for race day'
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
                onClick={() => onPhaseChange(phase.id)}
              >
                <div className="phase-icon">
                  {phase.id === 'base' && <i className="bi bi-building-fill"></i>}
                  {phase.id === 'build' && <i className="bi bi-graph-up-arrow"></i>}
                  {phase.id === 'peak' && <i className="bi bi-lightning-charge-fill"></i>}
                  {phase.id === 'taper' && <i className="bi bi-speedometer2"></i>}
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
            <strong>{phaseInfo.name}</strong>
            <p className="mb-0 mt-1">{phaseInfo.description}</p>
            <p className="mb-0 mt-2 small">
              <strong>Week Range:</strong> Weeks {phaseInfo.weekStart} through {phaseInfo.weekEnd} of your training plan
            </p>
          </div>
        </div>
      </div>
      
      {/* Training Blocks Grid */}
      <div className="row">
        <div className="col-12 mb-4">
          <h3 className="text-center">Training Blocks</h3>
          <p className="text-center text-muted">Select a training block to view weeks</p>
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
                    <div className="phase-icon mb-2">
                      {block.id === 1 && <i className="bi bi-building-fill"></i>}
                      {block.id === 2 && <i className="bi bi-graph-up-arrow"></i>}
                      {block.id === 3 && <i className="bi bi-lightning-charge-fill"></i>}
                      {block.id === 4 && <i className="bi bi-speedometer2"></i>}
                    </div>
                    <p className="card-text">
                      {blockDescriptions[block.id] || 'Structured strength and conditioning workouts'}
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