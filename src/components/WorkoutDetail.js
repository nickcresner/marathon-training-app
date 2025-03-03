// src/components/WorkoutDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import YouTube from 'react-youtube';
import { TRAINING_PHASES } from '../data/workouts';

function WorkoutDetail({ workouts, currentPhase }) {
  const [workout, setWorkout] = useState(null);
  const [completed, setCompleted] = useState(false);
  const { workoutId } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const foundWorkout = workouts.find(w => w.id === workoutId);
    setWorkout(foundWorkout);
    
    // Check if workout is completed from localStorage
    const completedWorkouts = JSON.parse(localStorage.getItem('completedWorkouts') || '{}');
    setCompleted(!!completedWorkouts[workoutId]);
  }, [workoutId, workouts]);
  
  const toggleCompleted = () => {
    const newCompletedState = !completed;
    setCompleted(newCompletedState);
    
    // Save to localStorage
    const completedWorkouts = JSON.parse(localStorage.getItem('completedWorkouts') || '{}');
    completedWorkouts[workoutId] = newCompletedState;
    localStorage.setItem('completedWorkouts', JSON.stringify(completedWorkouts));
  };
  
  // Extract YouTube video ID from URL
  const getYouTubeId = (url) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  // Group exercises by superset and warmup type
  const groupExercises = () => {
    if (!workout || !workout.exercises) return { warmups: {}, supersets: {}, regularExercises: [] };
    
    const warmups = {
      primers: [],
      switch: []
    };
    const supersets = {};
    const regularExercises = [];
    
    // Separate exercises by type
    workout.exercises.forEach(exercise => {
      if (exercise.isWarmup) {
        // Handle warmup exercises
        if (exercise.warmupType === 'primers') {
          warmups.primers.push(exercise);
        } else if (exercise.warmupType === 'switch') {
          warmups.switch.push(exercise);
        }
      } else if (exercise.isPartOfSuperset && exercise.supersetId) {
        // Handle superset exercises
        if (!supersets[exercise.supersetId]) {
          supersets[exercise.supersetId] = [];
        }
        supersets[exercise.supersetId].push(exercise);
      } else {
        // Regular exercises
        regularExercises.push(exercise);
      }
    });
    
    // Sort exercises within each superset by their order
    Object.keys(supersets).forEach(id => {
      supersets[id].sort((a, b) => a.supersetOrder - b.supersetOrder);
    });
    
    return { warmups, supersets, regularExercises };
  };
  
  if (!workout) {
    return <div className="text-center my-5">Loading workout details...</div>;
  }
  
  // Find the current phase info
  const phase = TRAINING_PHASES.find(p => p.id === workout.phase) || TRAINING_PHASES[0];
  
  const videoId = getYouTubeId(workout.videoUrl);
  
  return (
    <div className="workout-detail">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button 
            className="btn btn-outline-secondary me-2" 
            onClick={() => navigate(`/week/${workout.week}`)}
          >
            Back to Week {workout.week}
          </button>
          
          <button 
            className="btn btn-outline-primary" 
            onClick={() => navigate('/')}
          >
            Home
          </button>
        </div>
        
        <button 
          className={`btn ${completed ? 'btn-success' : 'btn-outline-success'}`}
          onClick={toggleCompleted}
        >
          {completed ? 'Completed ✓' : 'Mark as Complete'}
        </button>
      </div>
      
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="mb-0">{workout.title}</h2>
            <span className="badge bg-light text-primary">{phase.name}</span>
          </div>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <strong>Week:</strong> {workout.week} | 
            <strong> Duration:</strong> {workout.duration}
          </div>
          
          {workout.exercises && workout.exercises.length > 0 ? (
            <div className="mb-4">
              <h4>Exercises</h4>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Exercise</th>
                      <th>Sets</th>
                      <th>Reps</th>
                      <th>Tempo</th>
                      <th>Load</th>
                      <th>Rest</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Get grouped exercises */}
                    {(() => {
                      const { warmups, supersets, regularExercises } = groupExercises();
                      const hasPrimers = warmups.primers.length > 0;
                      const hasSwitchOns = warmups.switch.length > 0;
                      
                      return (
                        <>
                          {/* Warmup Exercises - Primers */}
                          {hasPrimers && (
                            <React.Fragment>
                              <tr className="warmup-header bg-light">
                                <td colSpan="7">
                                  <div className="d-flex align-items-center">
                                    <span className="badge bg-warning text-dark me-2">Primers</span>
                                    <span className="font-medium">Warmup exercises to prepare your body for the workout</span>
                                  </div>
                                </td>
                              </tr>
                              
                              {warmups.primers.map((exercise, index) => (
                                <tr key={exercise.id} className={index % 2 === 0 ? 'table-light' : ''}>
                                  <td>
                                    <Link to={`/workout/${workout.id}/exercise/${exercise.id}`} className="text-decoration-none">
                                      <strong>{exercise.name}</strong>
                                      {exercise.videoUrl && <span className="ms-2 badge bg-info">Video</span>}
                                    </Link>
                                  </td>
                                  <td>{exercise.sets}</td>
                                  <td>{exercise.reps}</td>
                                  <td>{exercise.tempo}</td>
                                  <td>{exercise.load}</td>
                                  <td>{exercise.rest}</td>
                                  <td>{exercise.notes}</td>
                                </tr>
                              ))}
                              
                              <tr className="spacer-row">
                                <td colSpan="7" style={{ height: '15px' }}></td>
                              </tr>
                            </React.Fragment>
                          )}
                          
                          {/* Warmup Exercises - Switch Ons */}
                          {hasSwitchOns && (
                            <React.Fragment>
                              <tr className="warmup-header bg-light">
                                <td colSpan="7">
                                  <div className="d-flex align-items-center">
                                    <span className="badge bg-info text-dark me-2">Switch Ons</span>
                                    <span className="font-medium">Activation exercises to engage key muscle groups</span>
                                  </div>
                                </td>
                              </tr>
                              
                              {warmups.switch.map((exercise, index) => (
                                <tr key={exercise.id} className={index % 2 === 0 ? 'table-light' : ''}>
                                  <td>
                                    <Link to={`/workout/${workout.id}/exercise/${exercise.id}`} className="text-decoration-none">
                                      <strong>{exercise.name}</strong>
                                      {exercise.videoUrl && <span className="ms-2 badge bg-info">Video</span>}
                                    </Link>
                                  </td>
                                  <td>{exercise.sets}</td>
                                  <td>{exercise.reps}</td>
                                  <td>{exercise.tempo}</td>
                                  <td>{exercise.load}</td>
                                  <td>{exercise.rest}</td>
                                  <td>{exercise.notes}</td>
                                </tr>
                              ))}
                              
                              <tr className="spacer-row">
                                <td colSpan="7" style={{ height: '15px' }}></td>
                              </tr>
                            </React.Fragment>
                          )}
                          
                          {/* Main Workout Header */}
                          {(hasPrimers || hasSwitchOns) && (
                            <tr className="main-workout-header bg-primary text-white">
                              <td colSpan="7">
                                <div className="d-flex align-items-center">
                                  <span className="badge bg-light text-primary me-2">Main Workout</span>
                                  <span className="font-medium">After completing warmups, proceed with the following exercises</span>
                                </div>
                              </td>
                            </tr>
                          )}
                          
                          {/* Render superset groups */}
                          {Object.entries(supersets).map(([supersetId, exercises]) => (
                            <React.Fragment key={`superset-${supersetId}`}>
                              {/* Superset header */}
                              <tr className="superset-header bg-light">
                                <td colSpan="7">
                                  <div className="d-flex align-items-center">
                                    <span className="badge bg-primary me-2">Superset {supersetId}</span>
                                    <span className="font-medium">Perform these exercises back-to-back with minimal rest between exercises</span>
                                  </div>
                                </td>
                              </tr>
                              
                              {/* Superset exercises */}
                              {exercises.map((exercise, index) => (
                                <tr key={exercise.id} className={index % 2 === 0 ? 'table-light' : ''}>
                                  <td>
                                    <Link to={`/workout/${workout.id}/exercise/${exercise.id}`} className="text-decoration-none">
                                      <strong>{exercise.supersetOrder}. {exercise.name}</strong>
                                      {exercise.videoUrl && <span className="ms-2 badge bg-info">Video</span>}
                                    </Link>
                                  </td>
                                  <td>{exercise.sets}</td>
                                  <td>{exercise.reps}</td>
                                  <td>{exercise.tempo}</td>
                                  <td>{exercise.load}</td>
                                  <td>{exercise.rest}</td>
                                  <td>{exercise.notes}</td>
                                </tr>
                              ))}
                              
                              {/* Spacer row after superset */}
                              <tr className="spacer-row">
                                <td colSpan="7" style={{ height: '15px' }}></td>
                              </tr>
                            </React.Fragment>
                          ))}
                          
                          {/* Regular exercises (not part of supersets) */}
                          {regularExercises.length > 0 && (
                            <>
                              {/* Regular exercises header if needed */}
                              {(Object.keys(supersets).length > 0 || hasPrimers || hasSwitchOns) && (
                                <tr className="regular-header">
                                  <td colSpan="7" className="bg-light">
                                    <div className="d-flex align-items-center">
                                      <span className="badge bg-secondary me-2">Regular Exercises</span>
                                      <span className="font-medium">Perform these exercises individually with full rest between sets</span>
                                    </div>
                                  </td>
                                </tr>
                              )}
                              
                              {/* Regular exercise rows */}
                              {regularExercises.map((exercise, index) => (
                                <tr key={exercise.id} className={index % 2 === 0 ? 'table-light' : ''}>
                                  <td>
                                    <Link to={`/workout/${workout.id}/exercise/${exercise.id}`} className="text-decoration-none">
                                      <strong>{exercise.name}</strong>
                                      {exercise.videoUrl && <span className="ms-2 badge bg-info">Video</span>}
                                    </Link>
                                  </td>
                                  <td>{exercise.sets}</td>
                                  <td>{exercise.reps}</td>
                                  <td>{exercise.tempo}</td>
                                  <td>{exercise.load}</td>
                                  <td>{exercise.rest}</td>
                                  <td>{exercise.notes}</td>
                                </tr>
                              ))}
                            </>
                          )}
                        </>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <h4>Description</h4>
              <p>{workout.description}</p>
            </div>
          )}
          
          {videoId && (
            <div className="workout-video mb-3">
              <h4>Workout Video</h4>
              <div className="ratio ratio-16x9">
                <YouTube 
                  videoId={videoId} 
                  opts={{
                    playerVars: {
                      rel: 0,
                    },
                  }} 
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkoutDetail;