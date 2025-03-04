import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './CustomWorkout.css';

const EXERCISE_LIST = [
  // Strength exercises - Week 1-4
  { 
    id: 'ex1', 
    name: 'Trap Bar Deadlift', 
    category: 'strength', 
    target: 'lower', 
    equipment: 'barbell',
    source: { phase: 'Week 1-4', workout: 'Day 1: Upper Focus + Core' }
  },
  { 
    id: 'ex2', 
    name: 'Barbell Bench Press', 
    category: 'strength', 
    target: 'upper', 
    equipment: 'barbell',
    source: { phase: 'Week 5-8', workout: 'Day 1: Power + Strength' }
  },
  { 
    id: 'ex3', 
    name: 'DB Goblet Squat', 
    category: 'strength', 
    target: 'lower', 
    equipment: 'dumbbell',
    source: { phase: 'Week 1-4', workout: 'Day 2: Lower Focus + Core' }
  },
  { 
    id: 'ex4', 
    name: 'Pull-up', 
    category: 'strength', 
    target: 'upper', 
    equipment: 'bodyweight',
    source: { phase: 'Week 5-8', workout: 'Day 2: Lower Strength and Conditioning' }
  },
  { 
    id: 'ex5', 
    name: 'Shoulder Press', 
    category: 'strength', 
    target: 'upper', 
    equipment: 'dumbbell',
    source: { phase: 'Week 9-12', workout: 'Day 2: Upper Strength and Conditioning' }
  },
  { 
    id: 'ex6', 
    name: 'Romanian Deadlift', 
    category: 'strength', 
    target: 'lower', 
    equipment: 'barbell',
    source: { phase: 'Week 1-4', workout: 'Day 2: Lower Focus + Core' }
  },
  { 
    id: 'ex7', 
    name: 'Push-up', 
    category: 'strength', 
    target: 'upper', 
    equipment: 'bodyweight',
    source: { phase: 'Week 9-12', workout: 'Full Body + Core' }
  },
  { 
    id: 'ex8', 
    name: 'Split Squat', 
    category: 'strength', 
    target: 'lower', 
    equipment: 'bodyweight',
    source: { phase: 'Week 5-8', workout: 'Day 2: Lower Strength and Conditioning' }
  },
  
  // Conditioning exercises - Week 5-8
  { 
    id: 'ex9', 
    name: 'Kettlebell Swing', 
    category: 'conditioning', 
    target: 'full', 
    equipment: 'kettlebell',
    source: { phase: 'Week 9-12', workout: 'Full Body + Core' }
  },
  { 
    id: 'ex10', 
    name: 'Box Jump', 
    category: 'conditioning', 
    target: 'lower', 
    equipment: 'box',
    source: { phase: 'Week 5-8', workout: 'Day 1: Power + Strength' }
  },
  { 
    id: 'ex11', 
    name: 'Burpee', 
    category: 'conditioning', 
    target: 'full', 
    equipment: 'bodyweight',
    source: { phase: 'Week 5-8', workout: 'Day 3: Mix Modal Conditioning + Arm Pump' }
  },
  { 
    id: 'ex12', 
    name: 'Medicine Ball Throw', 
    category: 'conditioning', 
    target: 'upper', 
    equipment: 'medicine ball',
    source: { phase: 'Week 5-8', workout: 'Day 1: Power + Strength' }
  },
  { 
    id: 'ex13', 
    name: 'Thruster', 
    category: 'conditioning', 
    target: 'full', 
    equipment: 'barbell',
    source: { phase: 'Week 5-8', workout: 'Day 3: Mix Modal Conditioning + Arm Pump' }
  },
  
  // Mobility exercises
  { 
    id: 'ex14', 
    name: 'World Greatest Stretch', 
    category: 'mobility', 
    target: 'full', 
    equipment: 'bodyweight',
    source: { phase: 'Week 1-4', workout: 'Day 1: Upper Focus + Core (Warmup)' }
  },
  { 
    id: 'ex15', 
    name: 'Cat Cow', 
    category: 'mobility', 
    target: 'core', 
    equipment: 'bodyweight',
    source: { phase: 'Week 1-4', workout: 'Day 1: Upper Focus + Core (Warmup)' }
  },
  { 
    id: 'ex16', 
    name: '90/90 Flow', 
    category: 'mobility', 
    target: 'hips', 
    equipment: 'bodyweight',
    source: { phase: 'Week 9-12', workout: 'Day 2: Upper Strength and Conditioning (Warmup)' }
  },
  { 
    id: 'ex17', 
    name: 'Dynamic Pigeon', 
    category: 'mobility', 
    target: 'hips', 
    equipment: 'bodyweight',
    source: { phase: 'Week 9-12', workout: 'Day 2: Upper Strength and Conditioning (Warmup)' }
  },
  
  // Core exercises
  { 
    id: 'ex18', 
    name: 'Plank', 
    category: 'core', 
    target: 'core', 
    equipment: 'bodyweight',
    source: { phase: 'Week 1-4', workout: 'Day 1: Upper Focus + Core' }
  },
  { 
    id: 'ex19', 
    name: 'Swiss Ball Deadbug', 
    category: 'core', 
    target: 'core', 
    equipment: 'swiss ball',
    source: { phase: 'Week 1-4', workout: 'Day 1: Upper Focus + Core' }
  },
  { 
    id: 'ex20', 
    name: 'Pallof Press', 
    category: 'core', 
    target: 'core', 
    equipment: 'cable',
    source: { phase: 'Week 1-4', workout: 'Day 1: Upper Focus + Core' }
  },
  { 
    id: 'ex21', 
    name: 'Bird Dog', 
    category: 'core', 
    target: 'core', 
    equipment: 'bodyweight',
    source: { phase: 'Week 1-4', workout: 'Day 1: Upper Focus + Core (Warmup)' }
  },
  { 
    id: 'ex22', 
    name: 'Cable Crunches', 
    category: 'core', 
    target: 'core', 
    equipment: 'cable',
    source: { phase: 'Week 5-8', workout: 'Day 3: Mix Modal Conditioning + Arm Pump' }
  },
  
  // Upper body
  { 
    id: 'ex23', 
    name: 'DB Bicep Curls', 
    category: 'strength', 
    target: 'upper', 
    equipment: 'dumbbell',
    source: { phase: 'Week 1-4', workout: 'Day 1: Upper Focus + Core' }
  },
  { 
    id: 'ex24', 
    name: 'Tricep Extensions', 
    category: 'strength', 
    target: 'upper', 
    equipment: 'cable',
    source: { phase: 'Week 5-8', workout: 'Day 3: Mix Modal Conditioning + Arm Pump' }
  },
  { 
    id: 'ex25', 
    name: 'Horizontal Rows', 
    category: 'strength', 
    target: 'upper', 
    equipment: 'barbell',
    source: { phase: 'Week 1-4', workout: 'Day 1: Upper Focus + Core' }
  },
  { 
    id: 'ex26', 
    name: 'Lat Pulldown', 
    category: 'strength', 
    target: 'upper', 
    equipment: 'cable',
    source: { phase: 'Week 9-12', workout: 'Day 2: Upper Strength and Conditioning' }
  },
  
  // Lower body
  { 
    id: 'ex27', 
    name: 'Leg Extension', 
    category: 'strength', 
    target: 'lower', 
    equipment: 'machine',
    source: { phase: 'Week 1-4', workout: 'Day 2: Lower Focus + Core' }
  },
  { 
    id: 'ex28', 
    name: 'Leg Curl', 
    category: 'strength', 
    target: 'lower', 
    equipment: 'machine',
    source: { phase: 'Week 1-4', workout: 'Day 2: Lower Focus + Core' }
  },
  { 
    id: 'ex29', 
    name: 'Calf Raise', 
    category: 'strength', 
    target: 'lower', 
    equipment: 'bodyweight',
    source: { phase: 'Week 5-8', workout: 'Day 2: Lower Strength and Conditioning' }
  },
  { 
    id: 'ex30', 
    name: 'Hip Thrust', 
    category: 'strength', 
    target: 'lower', 
    equipment: 'barbell',
    source: { phase: 'Week 1-4', workout: 'Day 2: Lower Focus + Core' }
  }
];

function CustomWorkout() {
  const navigate = useNavigate();
  const [workoutName, setWorkoutName] = useState('My Custom Workout');
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterTarget, setFilterTarget] = useState('all');
  const [filterEquipment, setFilterEquipment] = useState('all');
  const [filterPhase, setFilterPhase] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedWorkouts, setSavedWorkouts] = useState([]);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [showSavedWorkouts, setShowSavedWorkouts] = useState(true);
  
  // Load saved workouts on component mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('customWorkouts') || '[]');
    setSavedWorkouts(saved);
  }, []);

  // Filter exercises based on filters and search
  const filteredExercises = EXERCISE_LIST.filter(exercise => {
    const matchesCategory = filterCategory === 'all' || exercise.category === filterCategory;
    const matchesTarget = filterTarget === 'all' || exercise.target === filterTarget;
    const matchesEquipment = filterEquipment === 'all' || exercise.equipment === filterEquipment;
    const matchesPhase = filterPhase === 'all' || 
      (exercise.source && exercise.source.phase === filterPhase);
    const matchesSearch = searchQuery === '' || 
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesCategory && matchesTarget && matchesEquipment && matchesPhase && matchesSearch;
  });

  // Toggle exercise selection
  const toggleExercise = (exerciseId) => {
    if (selectedExercises.includes(exerciseId)) {
      setSelectedExercises(selectedExercises.filter(id => id !== exerciseId));
    } else {
      setSelectedExercises([...selectedExercises, exerciseId]);
    }
  };
  
  // Add exercise to current workout
  const addExercise = (exercise) => {
    if (!selectedExercises.includes(exercise.id)) {
      setSelectedExercises([...selectedExercises, exercise.id]);
    }
  };
  
  // Create or update a custom workout
  const saveWorkout = () => {
    if (selectedExercises.length === 0) {
      alert('Please select at least one exercise for your workout');
      return;
    }
    
    // Create workout object
    const workout = {
      id: editingWorkout ? editingWorkout.id : 'custom-' + Date.now(),
      title: workoutName,
      description: `Custom workout with ${selectedExercises.length} exercises`,
      phase: 'custom',
      exercises: selectedExercises.map(exerciseId => {
        const exercise = EXERCISE_LIST.find(ex => ex.id === exerciseId);
        return {
          id: `${exerciseId}-${Date.now()}`,
          name: exercise.name,
          sets: '3',
          reps: '10',
          tempo: '2-0-2',
          load: 'Medium',
          rest: '60s',
          notes: '',
          supersetId: null,
          supersetOrder: null,
          isPartOfSuperset: false
        };
      }),
      createdAt: editingWorkout ? editingWorkout.createdAt : new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    // Save to localStorage
    let updatedWorkouts;
    if (editingWorkout) {
      // Update existing workout
      updatedWorkouts = savedWorkouts.map(w => 
        w.id === editingWorkout.id ? workout : w
      );
    } else {
      // Add new workout
      updatedWorkouts = [...savedWorkouts, workout];
    }
    
    localStorage.setItem('customWorkouts', JSON.stringify(updatedWorkouts));
    setSavedWorkouts(updatedWorkouts);
    
    alert(editingWorkout ? 'Workout updated successfully!' : 'Workout saved successfully!');
    
    // Clear the form
    setWorkoutName('My Custom Workout');
    setSelectedExercises([]);
    setEditingWorkout(null);
  };
  
  // Start editing a saved workout
  const editWorkout = (workout) => {
    setEditingWorkout(workout);
    setWorkoutName(workout.title);
    setSelectedExercises(workout.exercises.map(ex => ex.id.split('-')[0])); // Extract base exercise ID
    setShowSavedWorkouts(false);
    
    // Scroll to top of the page
    window.scrollTo(0, 0);
  };
  
  // Delete a saved workout
  const deleteWorkout = (workoutId) => {
    const updatedWorkouts = savedWorkouts.filter(w => w.id !== workoutId);
    localStorage.setItem('customWorkouts', JSON.stringify(updatedWorkouts));
    setSavedWorkouts(updatedWorkouts);
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilterCategory('all');
    setFilterTarget('all');
    setFilterEquipment('all');
    setFilterPhase('all');
    setSearchQuery('');
  };

  return (
    <div className="custom-workout-container">
      <div className="section-header mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2>{editingWorkout ? 'Edit Workout: ' + editingWorkout.title : 'Custom Workout Creator'}</h2>
          <p className="text-muted">
            {editingWorkout 
              ? 'Modify your workout by adding or removing exercises' 
              : 'Create your own workout by selecting exercises'}
          </p>
        </div>
        {editingWorkout && (
          <button 
            className="btn btn-outline-secondary" 
            onClick={() => {
              setEditingWorkout(null);
              setWorkoutName('My Custom Workout');
              setSelectedExercises([]);
              setShowSavedWorkouts(true);
            }}
          >
            <i className="bi bi-x-circle me-1"></i>
            Cancel Editing
          </button>
        )}
      </div>
      
      <div className="row">
        {/* Left column - Exercise selection */}
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Exercise Library</h3>
            </div>
            <div className="card-body">
              {/* Search and filter tools */}
              <div className="search-filter-container mb-3">
                <div className="row g-2">
                  <div className="col-md-6">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search exercises..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {searchQuery && (
                        <button 
                          className="btn btn-outline-secondary" 
                          type="button"
                          onClick={() => setSearchQuery('')}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6 d-flex">
                    <button 
                      className="btn btn-outline-secondary ms-auto"
                      onClick={resetFilters}
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
                
                <div className="row g-2 mt-2">
                  <div className="col-md-3">
                    <select 
                      className="form-select"
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      <option value="all">All Categories</option>
                      <option value="strength">Strength</option>
                      <option value="conditioning">Conditioning</option>
                      <option value="mobility">Mobility</option>
                      <option value="core">Core</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <select 
                      className="form-select"
                      value={filterTarget}
                      onChange={(e) => setFilterTarget(e.target.value)}
                    >
                      <option value="all">All Target Areas</option>
                      <option value="upper">Upper Body</option>
                      <option value="lower">Lower Body</option>
                      <option value="core">Core</option>
                      <option value="full">Full Body</option>
                      <option value="hips">Hips</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <select 
                      className="form-select"
                      value={filterEquipment}
                      onChange={(e) => setFilterEquipment(e.target.value)}
                    >
                      <option value="all">All Equipment</option>
                      <option value="bodyweight">Bodyweight</option>
                      <option value="dumbbell">Dumbbell</option>
                      <option value="barbell">Barbell</option>
                      <option value="kettlebell">Kettlebell</option>
                      <option value="cable">Cable</option>
                      <option value="machine">Machine</option>
                      <option value="box">Box</option>
                      <option value="medicine ball">Medicine Ball</option>
                      <option value="swiss ball">Swiss Ball</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <select 
                      className="form-select"
                      value={filterPhase}
                      onChange={(e) => setFilterPhase(e.target.value)}
                    >
                      <option value="all">All Phases</option>
                      <option value="Week 1-4">Week 1-4</option>
                      <option value="Week 5-8">Week 5-8</option>
                      <option value="Week 9-12">Week 9-12</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Exercise listing */}
              <div className="exercise-list-container">
                {filteredExercises.length === 0 ? (
                  <div className="text-center py-4">
                    <p>No exercises match your filters. Try adjusting your search criteria.</p>
                  </div>
                ) : (
                  <div className="row">
                    {filteredExercises.map(exercise => (
                      <div key={exercise.id} className="col-md-6 mb-2">
                        <div 
                          className={`exercise-card ${selectedExercises.includes(exercise.id) ? 'selected' : ''}`}
                          onClick={() => toggleExercise(exercise.id)}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <span className="exercise-name">{exercise.name}</span>
                              <div className="exercise-tags">
                                <span className="tag tag-category">{exercise.category}</span>
                                <span className="tag tag-target">{exercise.target}</span>
                                {exercise.source && (
                                  <span className="tag tag-source" title={`${exercise.source.phase}: ${exercise.source.workout}`}>
                                    {exercise.source.phase}
                                  </span>
                                )}
                              </div>
                              <div className="exercise-source">
                                {exercise.source && (
                                  <small className="text-muted">
                                    From: {exercise.source.workout}
                                  </small>
                                )}
                              </div>
                            </div>
                            <div className="selection-checkbox">
                              {selectedExercises.includes(exercise.id) ? (
                                <i className="bi bi-check-circle-fill text-success"></i>
                              ) : (
                                <i className="bi bi-plus-circle text-primary"></i>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column - Current workout */}
        <div className="col-lg-4">
          <div className="card mb-4">
            <div className="card-header bg-success text-white">
              <h3 className="mb-0">Your Workout</h3>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="workoutName" className="form-label">Workout Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="workoutName"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                />
              </div>
              
              <div className="selected-exercises-container">
                <h4>Selected Exercises ({selectedExercises.length})</h4>
                {selectedExercises.length === 0 ? (
                  <p className="text-muted">No exercises selected yet. Click on exercises from the list to add them.</p>
                ) : (
                  <ul className="list-group">
                    {selectedExercises.map((exerciseId, index) => {
                      const exercise = EXERCISE_LIST.find(ex => ex.id === exerciseId);
                      return (
                        <li key={exerciseId} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <span className="me-2">{index + 1}.</span>
                            {exercise.name}
                          </div>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExercise(exerciseId);
                            }}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              
              <div className="d-grid gap-2 mt-4">
                <button 
                  className="btn btn-primary"
                  onClick={saveWorkout}
                  disabled={selectedExercises.length === 0}
                >
                  {editingWorkout ? 'Update Workout' : 'Save Workout'}
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => setSelectedExercises([])}
                  disabled={selectedExercises.length === 0}
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
          
          {/* Saved Workouts */}
          {savedWorkouts.length > 0 && showSavedWorkouts && (
            <div className="card">
              <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Your Saved Workouts</h3>
                {!showSavedWorkouts ? (
                  <button className="btn btn-sm btn-light" onClick={() => setShowSavedWorkouts(true)}>
                    <i className="bi bi-eye me-1"></i> Show
                  </button>
                ) : (
                  <button className="btn btn-sm btn-light" onClick={() => setShowSavedWorkouts(false)}>
                    <i className="bi bi-eye-slash me-1"></i> Hide
                  </button>
                )}
              </div>
              <div className="card-body">
                <div className="saved-workouts-list">
                  {savedWorkouts.map(workout => (
                    <div key={workout.id} className="saved-workout-item">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5>{workout.title}</h5>
                        <div className="btn-group">
                          <Link
                            to={`/custom-workout/${workout.id}`}
                            className="btn btn-sm btn-success me-1"
                          >
                            <i className="bi bi-play-fill"></i> Start
                          </Link>
                          <button
                            className="btn btn-sm btn-primary me-1"
                            onClick={() => editWorkout(workout)}
                          >
                            <i className="bi bi-pencil"></i> Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this workout?')) {
                                deleteWorkout(workout.id);
                              }
                            }}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                      <p className="text-muted small">{workout.exercises.length} exercises</p>
                      <div className="d-flex text-muted small">
                        <span className="me-3">
                          <i className="bi bi-calendar me-1"></i> 
                          Created: {new Date(workout.createdAt).toLocaleDateString()}
                        </span>
                        {workout.lastModified && (
                          <span>
                            <i className="bi bi-clock me-1"></i>
                            Modified: {new Date(workout.lastModified).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomWorkout;