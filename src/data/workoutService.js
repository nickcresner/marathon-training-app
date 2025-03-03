// src/data/workoutService.js
import Papa from 'papaparse';

// Replace with your published Google Sheet CSV URL
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTRE_VF1n0hbT_PfpbIwQnndWl2lY8Wv1BWhGDvu1XVhtelzAS1UYKKQ3q4r1FjWwUXZhtkidwJeFtB/pub?output=csv';

export async function fetchWorkouts() {
  try {
    const response = await fetch(SHEET_URL);
    const csvData = await response.text();
    
    // Parse CSV data
    const { data } = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true
    });
    
    // Process the data into workout format
    const processedWorkouts = processWorkoutData(data);
    return processedWorkouts;
  } catch (error) {
    console.error("Error fetching workouts:", error);
    return [];
  }
}

function processWorkoutData(rows) {
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
      
      // Start a new workout
      currentWorkout = {
        id: workoutId.toString(),
        title: `${row.A}: ${row.B || 'Workout'}`,
        description: row.B || 'Workout session',
        week: determineWeek(index), // Determine week based on position
        day: row.A,
        duration: '60 mins', // Default duration
        exercises: []
      };
      
      workoutId++;
    } 
    // If this is an exercise row, add it to the current workout
    else if (currentWorkout && row.A && !row.A.startsWith('Switch') && !row.A.startsWith('Primers')) {
      currentWorkout.exercises.push({
        name: row.B || row.A,
        sets: row.C || '',
        reps: row.D || '',
        tempo: row.E || '',
        load: row.F || '',
        duration: row.H || '',
        notes: row.I || ''
      });
    }
  });
  
  // Add the last workout if there is one
  if (currentWorkout) {
    workouts.push(currentWorkout);
  }
  
  return workouts;
}

// Helper function to determine which week a workout belongs to
function determineWeek(rowIndex) {
  if (rowIndex < 200) return 1; // Week 1-4
  if (rowIndex < 400) return 2; // Week 5-8
  return 3; // Week 9-12
}