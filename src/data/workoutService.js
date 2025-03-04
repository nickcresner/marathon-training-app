// src/data/workoutService.js
import Papa from 'papaparse';

// Replace with your published Google Sheet CSV URL
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTRE_VF1n0hbT_PfpbIwQnndWl2lY8Wv1BWhGDvu1XVhtelzAS1UYKKQ3q4r1FjWwUXZhtkidwJeFtB/pub?output=csv';

// CORS proxy for demo mode
const CORS_PROXY = 'https://corsproxy.io/?';

export async function fetchWorkouts(phaseId, customUrl) {
  try {
    const urlToFetch = customUrl || SHEET_URL;
    // Use CORS proxy to avoid CORS issues
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(urlToFetch)}`;
    
    const response = await fetch(proxyUrl);
    const csvData = await response.text();
    
    // Parse CSV data
    const { data } = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true
    });
    
    // Process the data into workout format
    const processedWorkouts = processWorkoutData(data, phaseId);
    return processedWorkouts;
  } catch (error) {
    // Silently fail with empty array
    return [];
  }
}

function processWorkoutData(rows, phaseId) {
  const workouts = [];
  let currentWorkout = null;
  let workoutId = 1;
  
  // Process each row from the spreadsheet
  rows.forEach((row, index) => {
    // Skip empty rows
    if (!row.A) return;
    
    // Check if this row is a day header (Day 1, Day 2, etc.)
    if (row.A && row.A.startsWith('Day ')) {
      // If we already have a workout in progress, save it
      if (currentWorkout) {
        workouts.push(currentWorkout);
      }
      
      // Determine phase based on the sheet data or parameter
      const phase = determinePhase(phaseId, index);
      
      // Start a new workout
      currentWorkout = {
        id: workoutId.toString(),
        title: `${row.A}: ${row.B || 'Workout'}`,
        description: row.B || 'Workout session',
        phase: phase, // Use the determined phase
        week: determineWeek(index, phase), 
        day: row.A,
        duration: '60 mins', // Default duration
        exercises: []
      };
      
      workoutId++;
    } 
    // If this is an exercise row, add it to the current workout
    else if (currentWorkout && row.A && !row.A.startsWith('Switch') && !row.A.startsWith('Primers')) {
      // Create a unique ID for the exercise
      const exerciseId = `ex-${currentWorkout.id}-${currentWorkout.exercises.length + 1}`;
      
      currentWorkout.exercises.push({
        id: exerciseId,
        name: row.B || row.A,
        sets: row.C || '',
        reps: row.D || '',
        tempo: row.E || '',
        load: row.F || '',
        rest: row.G || '',
        duration: row.H || '',
        notes: row.I || ''
      });
    }
  });
  
  // Add the last workout if there is one
  if (currentWorkout) {
    workouts.push(currentWorkout);
  }
  
  // If a specific phase was requested, filter workouts for that phase
  if (phaseId) {
    return workouts.filter(workout => workout.phase === phaseId);
  }
  
  return workouts;
}

// Helper function to determine phase
function determinePhase(requestedPhase, rowIndex) {
  if (requestedPhase) return requestedPhase;
  
  // Default determination by row position
  if (rowIndex < 200) return 'strength';  // Week 1-4
  if (rowIndex < 400) return 'conditioning';  // Week 5-8
  return 'mobility';  // Week 9-12
}

// Helper function to determine which week a workout belongs to
function determineWeek(rowIndex, phase) {
  switch (phase) {
    case 'strength':
      return Math.floor(rowIndex / 50) + 1; // Approximate week calculation
    case 'conditioning':
      return Math.floor((rowIndex - 200) / 50) + 5; // Weeks 5-8
    case 'mobility':
      return Math.floor((rowIndex - 400) / 50) + 9; // Weeks 9-12
    default:
      if (rowIndex < 200) return Math.floor(rowIndex / 50) + 1;
      if (rowIndex < 400) return Math.floor((rowIndex - 200) / 50) + 5;
      return Math.floor((rowIndex - 400) / 50) + 9;
  }
}