// src/data/workoutService.js
import Papa from 'papaparse';

// Data source configuration
const USE_TEST_DATA = false; // Use real Google Sheet data
const USE_LOCAL_CSV = false; // Not using local CSV for now
const LOCAL_CSV_PATH = '/workouts.csv';

// Google Sheet base URL - use this when connecting to Google Sheets
// Using your actual published Google Sheet URL with a CORS proxy
const GOOGLE_SHEET_BASE_URL = 'https://api.allorigins.win/raw?url=' + 
  encodeURIComponent('https://docs.google.com/spreadsheets/d/1QtyPEKBS8Qfzzjp16kbSuZs0Cv4HjNgxlYObaLkYRJU/pub?output=csv');

// Available training phase tabs in the Google Sheet with their week ranges
export const TRAINING_PHASES = [
  { 
    id: 'base', 
    name: 'Base Phase (Weeks 1-4)', 
    gid: '1194353959', // Week 1-4 tab GID
    description: 'Foundation phase focusing on building basic strength and form',
    weekStart: 1,
    weekEnd: 4
  },
  { 
    id: 'build', 
    name: 'Build Phase (Weeks 5-8)', 
    gid: '278447527', // Week 5-8 tab GID
    description: 'Progressive overload phase with increased intensity',
    weekStart: 5,
    weekEnd: 8
  },
  { 
    id: 'peak', 
    name: 'Peak Phase (Weeks 9-12)', 
    gid: '1344676238', // Week 9-12 tab GID
    description: 'Race preparation with peak performance workouts',
    weekStart: 9,
    weekEnd: 12
  },
  { 
    id: 'taper', 
    name: 'Taper Phase (Weeks 13-16)', 
    gid: '0', // Default to first tab if you don't have a taper tab yet
    description: 'Pre-race tapering to maximize race day performance',
    weekStart: 13,
    weekEnd: 16
  }
];

// Default to the first phase if none specified
export async function fetchWorkouts(phaseId = 'base', userSheetUrl = null) {
  try {
    // Find the selected phase
    const selectedPhase = TRAINING_PHASES.find(phase => phase.id === phaseId) || TRAINING_PHASES[0];
    
    // Use test data if flag is set
    if (USE_TEST_DATA) {
      console.log(`Using test data for "${selectedPhase.name}"`);
      const testWorkouts = createPhaseSpecificTestWorkouts(phaseId);
      return testWorkouts;
    }
    
    let url;
    
    // If user has provided their own Google Sheet, use that instead
    if (userSheetUrl) {
      // Properly handle published Google Sheet URLs
      if (userSheetUrl.includes('docs.google.com/spreadsheets/d/')) {
        // Check if it's already in published format
        if (userSheetUrl.includes('/pub?')) {
          // Already a published URL, make sure it's in CSV format
          if (!userSheetUrl.includes('output=csv')) {
            url = userSheetUrl + (userSheetUrl.includes('?') ? '&' : '?') + 'output=csv';
          } else {
            url = userSheetUrl;
          }
          
          // Add the gid parameter if it's not already there
          if (!userSheetUrl.includes('gid=')) {
            url = url + '&gid=' + selectedPhase.gid;
          }
        } else {
          // Convert to published format
          // Extract spreadsheet ID
          const idRegex = /\/d\/([^\/]+)/;
          const match = userSheetUrl.match(idRegex);
          if (match && match[1]) {
            const spreadsheetId = match[1];
            url = `https://docs.google.com/spreadsheets/d/e/${spreadsheetId}/pub?output=csv&gid=${selectedPhase.gid}`;
          } else {
            console.warn("Could not parse Google Sheet URL, falling back to default");
            url = `${GOOGLE_SHEET_BASE_URL}&gid=${selectedPhase.gid}`;
          }
        }
      } else {
        console.warn("Invalid Google Sheet URL format, falling back to default");
        url = `${GOOGLE_SHEET_BASE_URL}&gid=${selectedPhase.gid}`;
      }
      
      console.log(`Fetching "${selectedPhase.name}" from user's Google Sheet:`, url);
    } else if (USE_LOCAL_CSV) {
      // Use local CSV for testing
      url = LOCAL_CSV_PATH;
      console.log(`Using local CSV file for "${selectedPhase.name}":`, url);
    } else {
      // Build the URL with the selected gid for Google Sheets
      const sheetUrl = `https://docs.google.com/spreadsheets/d/1QtyPEKBS8Qfzzjp16kbSuZs0Cv4HjNgxlYObaLkYRJU/pub?gid=${selectedPhase.gid}&output=csv`;
      url = `https://api.allorigins.win/raw?url=${encodeURIComponent(sheetUrl)}`;
      console.log(`Fetching "${selectedPhase.name}" from default Google Sheet:`, url);
    }
    
    const response = await fetch(url);
    console.log("Response status:", response.status);
    
    if (!response.ok) {
      console.log("Error response, falling back to test data");
      return createPhaseSpecificTestWorkouts(phaseId);
    }
    
    const csvData = await response.text();
    console.log("CSV data length:", csvData.length);
    
    // For debugging - print first few lines of CSV
    console.log("CSV preview:", csvData.split('\n').slice(0, 10).join('\n'));
    
    // Parse CSV data
    const parseResult = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      error: (error) => {
        console.error("CSV parsing error:", error);
      }
    });
    console.log("Parsed rows:", parseResult.data.length);
    
    // Log some sample data for debugging
    if (parseResult.data.length > 0) {
      console.log("First row keys:", Object.keys(parseResult.data[0]));
      console.log("First row values:", Object.values(parseResult.data[0]));
    } else {
      console.log("CSV preview (first 200 chars):", csvData.substring(0, 200));
    }
    
    // Log sample of parsed data for debugging
    if (parseResult.data.length > 0) {
      console.log("Sample row keys:", Object.keys(parseResult.data[0]));
      console.log("Sample row values:", Object.values(parseResult.data[0]));
    }
    
    // Process the data into workout format
    const processedWorkouts = processWorkoutData(parseResult.data, selectedPhase.id);
    console.log("Processed workouts:", processedWorkouts.length);
    
    // If no workouts were processed, use test data
    if (processedWorkouts.length === 0) {
      console.log("No workouts processed, falling back to test data");
      return createPhaseSpecificTestWorkouts(phaseId);
    }
    
    if (processedWorkouts.length > 0) {
      console.log("Sample workout:", processedWorkouts[0]);
    }
    return processedWorkouts;
  } catch (error) {
    console.error("Error fetching workouts:", error);
    console.log("Error caught, falling back to test data");
    return createPhaseSpecificTestWorkouts(phaseId);
  }
}

// Create test workouts specific to each training phase
function createPhaseSpecificTestWorkouts(phaseId) {
  const testWorkouts = [];
  
  // Get phase info
  const phase = TRAINING_PHASES.find(p => p.id === phaseId) || TRAINING_PHASES[0];
  const weekStart = phase.weekStart;
  const weekEnd = phase.weekEnd;
  
  console.log(`Creating test workouts for ${phaseId} phase, weeks ${weekStart}-${weekEnd}`);
  
  // Create sample workouts for each week in this phase
  for (let week = weekStart; week <= weekEnd; week++) {
    // Define phase-specific workouts
    let workouts = [];
    
    if (phaseId === 'base') {
      workouts = [
        { title: `Day 1: BASE - Upper Body Focus`, desc: 'Strength and mobility for upper body (BASE PHASE)' },
        { title: `Day 2: BASE - Lower Body Focus`, desc: 'Strength and stability for lower body (BASE PHASE)' },
        { title: `Day 3: BASE - Core and Mobility`, desc: 'Core strengthening and full body mobility (BASE PHASE)' },
        { title: `Day 4: BASE - Recovery Run`, desc: 'Easy run with technique drills (BASE PHASE)' }
      ];
    } else if (phaseId === 'build') {
      workouts = [
        { title: `Day 1: BUILD - Upper Strength + Power`, desc: 'Heavier weights and power movements (BUILD PHASE)' },
        { title: `Day 2: BUILD - Lower Strength + Plyometrics`, desc: 'Leg strength and jumping exercises (BUILD PHASE)' },
        { title: `Day 3: BUILD - Hill Sprints + Core`, desc: 'Running hill intervals with core work (BUILD PHASE)' },
        { title: `Day 4: BUILD - Tempo Run + Mobility`, desc: 'Sustained effort running with recovery (BUILD PHASE)' },
        { title: `Day 5: BUILD - Active Recovery`, desc: 'Light activity and stretching (BUILD PHASE)' }
      ];
    } else if (phaseId === 'peak') {
      workouts = [
        { title: `Day 1: PEAK - Lower Strength and Conditioning`, desc: 'Heavy lower body with conditioning (PEAK PHASE)' },
        { title: `Day 2: PEAK - Upper Strength and Conditioning`, desc: 'Upper body power and endurance (PEAK PHASE)' },
        { title: `Day 3: PEAK - Running Intervals + Arm Pump`, desc: 'Speed intervals with arm strength (PEAK PHASE)' },
        { title: `Day 4: PEAK - Full Body + Core`, desc: 'Comprehensive full body workout (PEAK PHASE)' },
        { title: `Day 5: PEAK - Long Run + Technique`, desc: 'Distance run with form focus (PEAK PHASE)' }
      ];
    } else if (phaseId === 'taper') {
      workouts = [
        { title: `Day 1: TAPER - Maintenance Strength`, desc: 'Light full body maintenance (TAPER PHASE)' },
        { title: `Day 2: TAPER - Speed Work`, desc: 'Short, fast intervals with full recovery (TAPER PHASE)' },
        { title: `Day 3: TAPER - Race Prep + Mobility`, desc: 'Race-specific preparation (TAPER PHASE)' },
        { title: `Day 4: TAPER - Active Recovery`, desc: 'Very light movement and stretching (TAPER PHASE)' }
      ];
    }
    
    // Create workout objects
    workouts.forEach((workout, index) => {
      const dayNumber = index + 1;
      const workoutId = `${phaseId}-week${week}-day${dayNumber}`;
      
      // Create exercises with different patterns for each phase
      const exercises = [];
      
      // Add warmup exercises - Primers
      exercises.push({
        id: `${workoutId}-warmup-primer1`,
        name: `${phaseId.toUpperCase()} - Cat-Cow Stretch`,
        sets: '1',
        reps: '10 each direction',
        tempo: 'Slow',
        load: 'Bodyweight',
        rest: '0s',
        notes: `Mobilize the spine (${phaseId.toUpperCase()} PHASE)`,
        videoUrl: 'https://www.youtube.com/watch?v=kqnua4rHVVA',
        supersetId: null,
        supersetOrder: null,
        isPartOfSuperset: false,
        isWarmup: true,
        warmupType: 'primers',
        warmupGroup: 'warmup-primers',
        history: []
      });
      
      exercises.push({
        id: `${workoutId}-warmup-primer2`,
        name: 'Hip Circles',
        sets: '1',
        reps: '8 each direction',
        tempo: 'Controlled',
        load: 'Bodyweight',
        rest: '0s',
        notes: 'Loosen hip joints',
        videoUrl: '',
        supersetId: null,
        supersetOrder: null,
        isPartOfSuperset: false,
        isWarmup: true,
        warmupType: 'primers',
        warmupGroup: 'warmup-primers',
        history: []
      });
      
      // Add warmup exercises - Switch Ons
      exercises.push({
        id: `${workoutId}-warmup-switch1`,
        name: 'Glute Bridges',
        sets: '2',
        reps: '10',
        tempo: '2-0-1',
        load: 'Bodyweight',
        rest: '15s',
        notes: 'Activate glutes',
        videoUrl: 'https://www.youtube.com/watch?v=GUgtf41plWI',
        supersetId: null,
        supersetOrder: null,
        isPartOfSuperset: false,
        isWarmup: true,
        warmupType: 'switch',
        warmupGroup: 'warmup-switch',
        history: []
      });
      
      exercises.push({
        id: `${workoutId}-warmup-switch2`,
        name: 'Band Pull Aparts',
        sets: '2',
        reps: '12',
        tempo: '2-1-1',
        load: 'Light band',
        rest: '15s',
        notes: 'Activate upper back',
        videoUrl: '',
        supersetId: null,
        supersetOrder: null,
        isPartOfSuperset: false,
        isWarmup: true,
        warmupType: 'switch',
        warmupGroup: 'warmup-switch',
        history: []
      });
      
      // Add superset exercises
      if (index % 2 === 0) { // For even-indexed workouts
        // Add a superset A
        exercises.push({
          id: `${workoutId}-ex1`,
          name: 'Push Up',
          sets: '3',
          reps: '10-12',
          tempo: '2-0-1',
          load: 'Bodyweight',
          rest: '10s',
          notes: 'Maintain tight core',
          videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
          supersetId: 'A',
          supersetOrder: 1,
          isPartOfSuperset: true,
          isWarmup: false,
          warmupType: null,
          warmupGroup: null,
          history: []
        });
        
        exercises.push({
          id: `${workoutId}-ex2`,
          name: 'Band Pull Apart',
          sets: '3',
          reps: '15',
          tempo: '2-1-2',
          load: 'Band',
          rest: '60s',
          notes: 'Squeeze shoulder blades',
          videoUrl: 'https://www.youtube.com/watch?v=kZDAZFAs4Y0',
          supersetId: 'A',
          supersetOrder: 2,
          isPartOfSuperset: true,
          isWarmup: false,
          warmupType: null,
          warmupGroup: null,
          history: []
        });
      }
      
      // Add 3 regular exercises
      for (let i = 0; i < 3; i++) {
        const exerciseNum = exercises.length + 1;
        exercises.push({
          id: `${workoutId}-ex${exerciseNum}`,
          name: getRandomExercise(phaseId, i),
          sets: '3-4',
          reps: '8-12',
          tempo: '2-0-2',
          load: 'Moderate',
          rest: '60-90s',
          notes: 'Focus on quality movement',
          videoUrl: '',
          supersetId: null,
          supersetOrder: null,
          isPartOfSuperset: false,
          isWarmup: false,
          warmupType: null,
          warmupGroup: null,
          history: []
        });
      }
      
      // Create the workout object
      testWorkouts.push({
        id: workoutId,
        title: workout.title,
        description: workout.desc,
        phase: phaseId,
        week: week,
        day: `Day ${dayNumber}`,
        dayNumber: dayNumber,
        duration: '45-60 mins',
        exercises: exercises
      });
    });
  }
  
  console.log(`Created ${testWorkouts.length} test workouts for ${phaseId} phase`);
  return testWorkouts;
}

// Helper to get random exercises for test data
function getRandomExercise(phaseId, index) {
  const baseExercises = ['Squat', 'Romanian Deadlift', 'Bench Press', 'Shoulder Press', 'Row', 'Lunge'];
  const buildExercises = ['Front Squat', 'Deadlift', 'Incline Press', 'Pull-up', 'Step-up', 'Split Squat'];
  const peakExercises = ['Hang Clean', 'Box Jump', 'Medicine Ball Throw', 'Kettlebell Swing', 'Thruster', 'Burpee'];
  const taperExercises = ['Mobility Flow', 'Dynamic Stretch', 'Balance Work', 'Form Drill', 'Activation Exercise'];
  
  let exercises;
  switch(phaseId) {
    case 'build': exercises = buildExercises; break;
    case 'peak': exercises = peakExercises; break;
    case 'taper': exercises = taperExercises; break;
    default: exercises = baseExercises;
  }
  
  return exercises[index % exercises.length];
}

function processWorkoutData(rows, phaseId) {
  const workouts = [];
  let currentWorkout = null;
  let workoutId = 1;
  let currentWeek = 1;
  let currentWarmupType = null; // Track current warmup section (primers or switch ons)
  
  // Get current phase info to assign proper week numbers
  const phaseInfo = TRAINING_PHASES.find(phase => phase.id === phaseId);
  if (phaseInfo) {
    currentWeek = phaseInfo.weekStart;
  }
  
  // When using the same CSV for all phases, adapt week numbers to the current phase
  const adjustWeekForPhase = (weekNumber) => {
    if (!phaseInfo) return weekNumber;
    return phaseInfo.weekStart + (weekNumber - 1) % 4;
  };
  
  console.log(`Processing rows for phase ${phaseId}, row count:`, rows.length);
  
  // Add hardcoded workouts for testing if no valid workout rows found
  if (rows.length < 3) {
    console.log("Too few rows found, using test data");
    return createPhaseSpecificTestWorkouts(phaseId);
  }
  
  // Create a function to identify workout day headers
  const isDayHeader = (text) => {
    if (!text) return false;
    text = text.trim().toLowerCase();
    
    // Match various formats like "Day 1", "day 1:", "day 1 -", etc.
    if (text.startsWith('day ') && /\d/.test(text)) return true;
    
    // Also match other common workout day headers
    return [
      'lower strength', 'upper strength', 'full body', 'running ip',
      'workout a', 'workout b', 'workout c', 'workout d'
    ].some(pattern => text.includes(pattern));
  };
  
  // Process each row from the spreadsheet
  rows.forEach((row, index) => {
    // Get column values safely
    const getColumnValue = (row, index) => {
      const keys = Object.keys(row);
      return index < keys.length ? row[keys[index]] || '' : '';
    };
    
    const columnValues = [];
    for (let i = 0; i < 8; i++) {
      columnValues.push(getColumnValue(row, i));
    }
    
    const firstCol = columnValues[0] || '';
    const secondCol = columnValues[1] || '';
    
    // Log row data for debugging
    if (index < 20) {
      console.log(`Row ${index}: ${columnValues.slice(0, 4).join(' | ')}`);
    }
    
    // Skip empty rows
    if (!firstCol || firstCol.trim() === '') return;
    
    // Detect week headers
    if (firstCol.toLowerCase().includes('week') || secondCol.toLowerCase().includes('week')) {
      const weekRegex = /week\s*(\d+)/i;
      const weekMatch = (firstCol + ' ' + secondCol).match(weekRegex);
      if (weekMatch && weekMatch[1]) {
        const weekFromSheet = parseInt(weekMatch[1], 10);
        currentWeek = phaseInfo ? phaseInfo.weekStart + (weekFromSheet - 1) : weekFromSheet;
        console.log(`Found Week ${currentWeek} (from sheet: Week ${weekFromSheet})`);
      }
    }
    
    // Check if this row is a day header
    if (isDayHeader(firstCol) || isDayHeader(secondCol)) {
      // If we already have a workout in progress, save it
      if (currentWorkout) {
        workouts.push(currentWorkout);
      }
      
      // Try to extract day number
      const dayNumberRegex = /day\s*(\d+)/i;
      const dayMatch = (firstCol + ' ' + secondCol).match(dayNumberRegex);
      let dayNumber = workoutId;
      if (dayMatch && dayMatch[1]) {
        dayNumber = parseInt(dayMatch[1], 10);
      }
      
      // Get title without "Day X" prefix if there's more descriptive text
      let title = firstCol.trim();
      if (secondCol && secondCol.trim() !== '') {
        if (isDayHeader(firstCol) && !isDayHeader(secondCol)) {
          title = `${firstCol}: ${secondCol}`;
        } else {
          title = secondCol.trim();
        }
      }
      
      // Start a new workout
      // Use adjusted week numbers based on the current phase
      const weekToUse = adjustWeekForPhase(currentWeek);
      
      currentWorkout = {
        id: `${phaseId}-week${weekToUse}-day${dayNumber}`,
        title: title,
        description: secondCol || title,
        phase: phaseId,
        week: weekToUse,
        day: `Day ${dayNumber}`,
        dayNumber: dayNumber,
        duration: '60 mins', // Default duration
        exercises: []
      };
      
      console.log(`Created workout: ${currentWorkout.title}, Week ${currentWorkout.week}`);
      
      workoutId++;
    } 
    // Check if this is a warmup section (Primers or Switch Ons)
    else if (currentWorkout && 
             firstCol && 
             (firstCol.toLowerCase().includes('primers') || 
              firstCol.toLowerCase().includes('switch'))) {
      
      // Process primers/switch ons warmup exercises
      // These will be added with a special warmup flag and a group identifier
      const isSwitch = firstCol.toLowerCase().includes('switch');
      const warmupType = isSwitch ? 'switch' : 'primers';
      const warmupGroupId = `warmup-${warmupType}`;
      
      // Skip the header row itself, process following rows as warmup exercises
      // We'll handle this in the next section
      
      console.log(`Found ${warmupType} section for workout ${currentWorkout.title}`);
    }
    // If this is an exercise row, add it to the current workout
    else if (currentWorkout && 
             firstCol && 
             firstCol.trim() !== '') {
      
      // Check if this is a typical section we should skip
      const skipSections = ['Scales', 'Notes', 'Date', 'Weight'];
      if (skipSections.some(skip => firstCol.toLowerCase().includes(skip.toLowerCase()))) {
        return; // Skip this row
      }
      
      // This section was replaced by a better warmup handling approach
      
      // Generate a unique ID for the exercise
      // Use adjusted week numbers when we're creating exercises
      const weekToUse = adjustWeekForPhase(currentWeek);
      const exerciseId = `${phaseId}-week${weekToUse}-day${currentWorkout.dayNumber}-ex${currentWorkout.exercises.length + 1}`;
      
      // Check if this is a warmup header
      if (firstCol && (firstCol.toLowerCase().includes('primers') || firstCol.toLowerCase().includes('switch'))) {
        // Set the current warmup type for subsequent exercises
        currentWarmupType = firstCol.toLowerCase().includes('primers') ? 'primers' : 'switch';
        console.log(`Found ${currentWarmupType} warmup section`);
        return; // Skip adding this as an exercise
      }
      
      // Get values for the exercise
      let exerciseName = '';
      if (secondCol && secondCol.trim() !== '') {
        exerciseName = secondCol;
      } else {
        exerciseName = firstCol;
      }
      
      // Try to extract YouTube URL if present in any column
      let videoUrl = '';
      const ytRegex = /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/gi;
      const allText = columnValues.join(' ');
      const ytMatch = allText.match(ytRegex);
      if (ytMatch) {
        videoUrl = ytMatch[0];
      }
      
      // Check for superset pattern (A1, A2, B1, B2, etc.)
      let supersetId = null;
      let supersetOrder = null;
      let isPartOfSuperset = false;
      
      const supersetRegex = /^([A-Z])(\d+)$/i;
      const match = firstCol.trim().match(supersetRegex);
      
      if (match) {
        supersetId = match[1].toUpperCase();
        supersetOrder = parseInt(match[2], 10);
        isPartOfSuperset = true;
        console.log(`Detected superset: ${firstCol} -> ID: ${supersetId}, Order: ${supersetOrder}`);
      }
      
      // Determine if this is a warmup exercise
      const isWarmupExercise = currentWarmupType !== null;
      
      const exercise = {
        id: exerciseId,
        name: exerciseName,
        sets: columnValues[2] || '',
        reps: columnValues[3] || '',
        tempo: columnValues[4] || '',
        load: columnValues[5] || '',
        rest: columnValues[6] || '',
        notes: columnValues[7] || '',
        videoUrl: videoUrl,
        history: [], // Will store user's exercise history
        supersetId: supersetId,
        supersetOrder: supersetOrder,
        isPartOfSuperset: isPartOfSuperset,
        
        // Warmup exercise properties
        isWarmup: isWarmupExercise,
        warmupType: currentWarmupType,
        warmupGroup: isWarmupExercise ? `warmup-${currentWarmupType}` : null
      };
      
      currentWorkout.exercises.push(exercise);
      console.log(`Added exercise: ${exercise.name} to ${currentWorkout.title}${isWarmupExercise ? ` (${currentWarmupType} warmup)` : ''}`);
      
      // If this is not a warmup exercise, reset the warmup type
      // This ensures only consecutive exercises after a warmup header are tagged as warmups
      if (!exercise.name.match(/^\d+\s*\.\s*/) && !firstCol.match(/^\d+\s*\.\s*/)) {
        currentWarmupType = null;
      }
    }
  });
  
  // Add the last workout if there is one
  if (currentWorkout) {
    workouts.push(currentWorkout);
  }
  
  // If no workouts were found, create test data
  if (workouts.length === 0) {
    console.log("No workouts found in CSV, using test data");
    return createPhaseSpecificTestWorkouts(phaseId);
  }
  
  console.log(`Successfully processed ${workouts.length} workouts for ${phaseId} phase`);
  return workouts;
}

// Create test workouts for development/testing
function createTestWorkouts(phaseId) {
  console.log(`Creating test workouts for phase: ${phaseId}`);
  
  const phaseWorkouts = [];
  
  // Use more weeks based on phaseId
  let weeks = [];
  if (phaseId === 'base') {
    weeks = [1, 2, 3, 4];
  } else if (phaseId === 'build') {
    weeks = [5, 6, 7, 8];
  } else if (phaseId === 'peak') {
    weeks = [9, 10, 11, 12];
  } else if (phaseId === 'taper') {
    weeks = [13, 14, 15, 16];
  } else {
    weeks = [1, 2, 3, 4]; // Fallback
  }
  
  // Create 5 workouts per week
  weeks.forEach(week => {
    // Create different workout days per week to simulate a real training plan
    for (let day = 1; day <= 5; day++) {
      const workoutId = `${phaseId}-week${week}-day${day}`;
      
      const workout = {
        id: workoutId,
        title: `Day ${day}: ${phaseId.charAt(0).toUpperCase() + phaseId.slice(1)} Training`,
        description: `${phaseId.charAt(0).toUpperCase() + phaseId.slice(1)} phase workout`,
        phase: phaseId,
        week: week,
        day: `Day ${day}`,
        dayNumber: day,
        duration: '60 mins',
        exercises: [
          // Superset A exercises
          {
            id: `${workoutId}-ex1`,
            name: "Squat",
            sets: "3",
            reps: "8-10",
            tempo: "2-0-1",
            load: "Medium",
            rest: "60s",
            notes: "Focus on form",
            videoUrl: "https://www.youtube.com/watch?v=U3HlEF_E9fo",
            history: [],
            supersetId: "A",
            supersetOrder: 1,
            isPartOfSuperset: true
          },
          {
            id: `${workoutId}-ex2`,
            name: "Lunge",
            sets: "3",
            reps: "10 each",
            tempo: "1-0-1",
            load: "Light",
            rest: "45s",
            notes: "Keep front knee behind toes",
            videoUrl: "https://www.youtube.com/watch?v=QOVaHwm-Q6U",
            history: [],
            supersetId: "A",
            supersetOrder: 2,
            isPartOfSuperset: true
          },
          // Superset B exercises
          {
            id: `${workoutId}-ex3`,
            name: "Push-up",
            sets: "3",
            reps: "Max",
            tempo: "1-1-1",
            load: "Bodyweight",
            rest: "60s",
            notes: "Modify if needed",
            videoUrl: "https://www.youtube.com/watch?v=IODxDxX7oi4",
            history: [],
            supersetId: "B",
            supersetOrder: 1,
            isPartOfSuperset: true
          },
          {
            id: `${workoutId}-ex4`,
            name: "Pull-up",
            sets: "3",
            reps: "5-8",
            tempo: "2-0-1",
            load: "Bodyweight",
            rest: "90s",
            notes: "Use assistance band if needed",
            videoUrl: "https://www.youtube.com/watch?v=eGo4IYlbE5g",
            history: [],
            supersetId: "B",
            supersetOrder: 2,
            isPartOfSuperset: true
          },
          // Regular exercise (not part of superset)
          {
            id: `${workoutId}-ex5`,
            name: "Plank",
            sets: "3",
            reps: "30-60 sec",
            tempo: "Hold",
            load: "Bodyweight",
            rest: "30s",
            notes: "Engage core throughout",
            videoUrl: "https://www.youtube.com/watch?v=pSHjTRCQxIw",
            history: [],
            supersetId: null,
            supersetOrder: null,
            isPartOfSuperset: false
          }
        ]
      };
      
      phaseWorkouts.push(workout);
    }
  });
  
  return phaseWorkouts;
}

// This function has been replaced by better week determination in the parsing logic

// Helper function to determine which block a week belongs to
export function determineWeekBlock(week) {
  // Map week to appropriate block regardless of which phase it's in
  if (week >= 1 && week <= 4) return { blockId: 1, label: 'Weeks 1-4' };
  if (week >= 5 && week <= 8) return { blockId: 2, label: 'Weeks 5-8' };
  if (week >= 9 && week <= 12) return { blockId: 3, label: 'Weeks 9-12' };
  if (week >= 13 && week <= 16) return { blockId: 4, label: 'Weeks 13-16' };
  return { blockId: 5, label: `Week ${week}` }; // Fallback for any other weeks
}

// Group weeks into blocks for display
export function groupWeeksIntoBlocks(weeks) {
  const blocks = {};
  
  // Add each week to its appropriate block
  weeks.forEach(week => {
    const { blockId, label } = determineWeekBlock(week);
    
    if (!blocks[blockId]) {
      blocks[blockId] = {
        id: blockId,
        label,
        weeks: []
      };
    }
    
    if (!blocks[blockId].weeks.includes(week)) {
      blocks[blockId].weeks.push(week);
    }
  });
  
  // Sort weeks within each block
  Object.values(blocks).forEach(block => {
    block.weeks.sort((a, b) => a - b);
  });
  
  // Convert to array and sort by block ID
  return Object.values(blocks).sort((a, b) => a.id - b.id);
}