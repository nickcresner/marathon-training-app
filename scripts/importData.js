// scripts/importData.js
const fs = require('fs');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const Papa = require('papaparse');

// Your Firebase config - replace with your actual config
const firebaseConfig = {
    apiKey: "AIzaSyCWH7oMh6VMXT1Powtp5bgofNsX6LwdRJQ",
    authDomain: "marathon-training-app-15f96.firebaseapp.com",
    projectId: "marathon-training-app-15f96",
    storageBucket: "marathon-training-app-15f96.firebasestorage.app",
    messagingSenderId: "43452731757",
    appId: "1:43452731757:web:b804db5a666e3c28434a64",
    measurementId: "G-6XLJV2C1D5"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to read the CSV file exported from Google Sheets
async function importWorkouts() {
  // Read the CSV file (exported from Google Sheets)
  const csvFile = fs.readFileSync('./workouts.csv', 'utf8');
  
  // Parse the CSV
  Papa.parse(csvFile, {
    header: true, // First row is headers
    skipEmptyLines: true,
    complete: async (results) => {
      const rows = results.data;
      
      // Track current day and exercises
      let currentDay = null;
      let currentBlock = "Strength"; // Default block
      let currentWeek = 1; // Default week
      let exercises = [];
      let dayTitle = "";
      
      // Group exercises by day
      for (const row of rows) {
        // Skip empty rows or header rows
        if (!row.A || row.A === 'A1' || row.A === 'Scales') continue;
        
        // Check if this is a day header row
        if (row.A && row.A.startsWith('Day ')) {
          // If we have collected exercises from previous day, add them to Firebase
          if (currentDay && exercises.length > 0) {
            await addWorkoutDay(currentDay, dayTitle, exercises, currentBlock, currentWeek);
            exercises = [];
          }
          
          // Start collecting for new day
          currentDay = row.A; // e.g., "Day 1"
          dayTitle = row.B || "Workout"; // e.g., "Upper Focus + Core"
          
          // Try to extract week number if available
          if (row.__rowNum__ && currentWeek === 1) {
            // Check if we're in week 5-8 or 9-12 based on row position
            if (row.__rowNum__ > 400) currentWeek = 3; // Week 9-12
            else if (row.__rowNum__ > 200) currentWeek = 2; // Week 5-8
          }
          
          continue;
        }
        
        // If this is an exercise row, capture it
        if (row.A && !row.A.startsWith('Switch') && !row.A.startsWith('Primers')) {
          let exercise = {
            name: row.B || row.A, // Exercise name
            sets: row.C || "",
            reps: row.D || "",
            tempo: row.E || "",
            load: row.F || "",
            duration: row.H || "",
            notes: row.I || ""
          };
          
          exercises.push(exercise);
        }
      }
      
      // Add the last day if there are exercises left
      if (currentDay && exercises.length > 0) {
        await addWorkoutDay(currentDay, dayTitle, exercises, currentBlock, currentWeek);
      }
      
      console.log("Import completed!");
      process.exit(0);
    },
    error: (error) => {
      console.error("Error parsing CSV:", error);
      process.exit(1);
    }
  });
}

// Function to add a workout day to Firestore
async function addWorkoutDay(day, title, exercises, block, week) {
  try {
    // Create a description from exercises
    const description = exercises.map(ex => 
      `${ex.name}: ${ex.sets} sets of ${ex.reps}${ex.tempo ? ` at ${ex.tempo} tempo` : ''}`
    ).join('\n');
    
    // Find any YouTube URLs in the notes
    const videoRegex = /https?:\/\/(www\.)?youtube\.com\/watch\?v=([^&\s]+)/;
    const videoUrls = exercises
      .map(ex => ex.notes && ex.notes.match(videoRegex) ? ex.notes.match(videoRegex)[0] : null)
      .filter(url => url !== null);
    
    // Get the first video URL, if any
    const videoUrl = videoUrls.length > 0 ? videoUrls[0] : "";
    
    // Calculate estimated duration
    const estimatedDuration = exercises.length * 5; // Roughly 5 minutes per exercise
    
    // Add workout to Firestore
    await addDoc(collection(db, "workouts"), {
      title: `${day}: ${title}`,
      description: description,
      block: block,
      week: parseInt(week) || 1,
      day: day,
      duration: `${estimatedDuration} mins`,
      videoUrl: videoUrl,
      exercises: exercises,
      createdAt: new Date()
    });
    
    console.log(`Added workout: ${day}: ${title}`);
  } catch (error) {
    console.error("Error adding workout:", error);
  }
}

importWorkouts();