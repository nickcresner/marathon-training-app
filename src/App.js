// src/App.js
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Firebase
import { getCurrentUser } from './services/firebaseService';
import configService from './services/configService';

// Layout Components
import Navigation from './components/Layout/Navigation';

// Main App Components
import WorkoutList from './components/WorkoutList';
import WorkoutDetail from './components/WorkoutDetail';
import BlockSelection from './components/BlockSelection';
import ExerciseDetail from './components/ExerciseDetail';

// Auth Components
import AuthContainer from './components/Auth/AuthContainer';

// Settings and Help Components
import UserSettings from './components/Settings/UserSettings';
import HelpCenter from './components/Help/HelpCenter';

// Onboarding Components
import OnboardingContainer from './components/Onboarding/OnboardingContainer';

// Import data fetching service
import { fetchWorkouts, TRAINING_PHASES, groupWeeksIntoBlocks } from './data/workouts';
import { getGoogleSheetSettings } from './services/firebaseService';

function App() {
  const [workouts, setWorkouts] = useState([]);
  const [currentPhase, setCurrentPhase] = useState('base');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // User authentication state
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  
  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        // Check if user needs onboarding
        if (currentUser) {
          await checkUserOnboardingStatus(currentUser.uid);
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setAuthChecked(true);
      }
    };
    
    checkAuth();
  }, []);
  
  // Get current phase information
  const currentPhaseInfo = TRAINING_PHASES.find(phase => phase.id === currentPhase) || TRAINING_PHASES[0];
  
  // Log environment information
  useEffect(() => {
    if (authChecked) {
      configService.logDebug('App initialized with user:', user ? user.email : 'none');
      configService.logDebug('Current environment:', configService.env);
      configService.logDebug('Features enabled:', configService.features);
    }
  }, [authChecked, user]);
  
  // Load workouts based on current phase
  useEffect(() => {
    async function loadWorkouts() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get user's Google Sheet settings if user is logged in
        let userSheetUrl = null;
        if (user) {
          try {
            const settings = await getGoogleSheetSettings(user.uid);
            if (settings && settings.url) {
              userSheetUrl = settings.url;
              console.log("Using user's custom Google Sheet:", userSheetUrl);
            }
          } catch (settingsError) {
            console.warn("Could not load user Google Sheet settings:", settingsError);
          }
        }
        
        // Fetch workout data for the current phase
        const data = await fetchWorkouts(currentPhase, userSheetUrl);
        
        // If we're using test data, ensure the week numbers align with the correct phase
        const processedData = data.map(workout => {
          // If the workout doesn't already have a week assigned from the phase range
          if (workout.week < currentPhaseInfo.weekStart || workout.week > currentPhaseInfo.weekEnd) {
            // Adjust the week to fit within the phase's range
            const weekOffset = workout.week % 4 || 4; // 1-4
            const newWeek = currentPhaseInfo.weekStart + weekOffset - 1;
            return { ...workout, week: newWeek };
          }
          return workout;
        });
        
        setWorkouts(processedData);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading workouts:", err);
        setError("Failed to load workout data. Please try again later.");
        setIsLoading(false);
      }
    }
    
    if (authChecked) {
      loadWorkouts();
    }
  }, [currentPhase, currentPhaseInfo, authChecked, user]);
  
  // Function to update exercise history in state
  const updateExerciseHistory = (workoutId, exerciseId, newHistory) => {
    setWorkouts(prevWorkouts => {
      return prevWorkouts.map(workout => {
        if (workout.id === workoutId) {
          // Update the specific exercise in this workout
          const updatedExercises = workout.exercises.map(exercise => {
            if (exercise.id === exerciseId) {
              return { ...exercise, history: newHistory };
            }
            return exercise;
          });
          
          return { ...workout, exercises: updatedExercises };
        }
        return workout;
      });
    });
  };
  
  // Handle user authentication
  const handleAuthSuccess = (user) => {
    setUser(user);
    // Check if the user needs onboarding
    checkUserOnboardingStatus(user.uid);
    
    // Add console log to track authentication flow
    console.log("Authentication successful, user set:", user.email);
  };
  
  const handleLogout = () => {
    setUser(null);
    setNeedsOnboarding(false);
  };
  
  // Check if user needs onboarding
  const checkUserOnboardingStatus = async (userId) => {
    try {
      const settings = await getGoogleSheetSettings(userId);
      setNeedsOnboarding(!settings);
    } catch (error) {
      console.error("Error checking user onboarding status:", error);
      setNeedsOnboarding(true);
    }
  };
  
  // Extract unique weeks from current phase
  const weeks = [...new Set(workouts.map(workout => workout.week))].sort((a, b) => a - b);
  
  // Group weeks into blocks
  const weekBlocks = groupWeeksIntoBlocks(weeks);
  
  // Handle phase change
  const handlePhaseChange = (phaseId) => {
    if (phaseId !== currentPhase) {
      console.log(`Changing phase from ${currentPhase} to ${phaseId}`);
      setCurrentPhase(phaseId);
      // Force reload workouts when phase changes
      setIsLoading(true);
    }
  };
  
  // Protect routes that require authentication
  const ProtectedRoute = ({ children }) => {
    if (!authChecked) {
      return <div className="container mt-5 text-center">Checking authentication...</div>;
    }
    
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    return children;
  };
  
  if (!authChecked) {
    return <div className="container mt-5 text-center">Initializing app...</div>;
  }
  
  if (isLoading) {
    return (
      <Router>
        <Navigation user={user} onLogout={handleLogout} />
        <div className="container mt-5 text-center">Loading workouts...</div>
      </Router>
    );
  }
  
  if (error) {
    return (
      <Router>
        <Navigation user={user} onLogout={handleLogout} />
        <div className="container mt-5 text-center text-danger">{error}</div>
      </Router>
    );
  }

  return (
    <Router>
      <Navigation user={user} onLogout={handleLogout} />
      
      <div className="container my-4">
        <Routes>
          {/* Main App Routes */}
          <Route 
            path="/" 
            element={
              needsOnboarding && user ? (
                <Navigate to="/onboarding" />
              ) : (
                <BlockSelection 
                  weeks={weeks} 
                  weekBlocks={weekBlocks}
                  phases={TRAINING_PHASES} 
                  currentPhase={currentPhase}
                  workouts={workouts}
                  onPhaseChange={handlePhaseChange}
                  user={user}
                />
              )
            } 
          />
          <Route 
            path="/week/:weekId" 
            element={
              <WorkoutList 
                workouts={workouts} 
                currentPhase={currentPhase}
              />
            } 
          />
          <Route 
            path="/workout/:workoutId" 
            element={
              <WorkoutDetail 
                workouts={workouts} 
                currentPhase={currentPhase}
              />
            } 
          />
          <Route 
            path="/workout/:workoutId/exercise/:exerciseId" 
            element={
              <ExerciseDetail 
                workouts={workouts}
                updateExerciseHistory={updateExerciseHistory} 
              />
            } 
          />
          
          {/* Authentication Routes */}
          <Route 
            path="/login" 
            element={<AuthContainer onAuthSuccess={handleAuthSuccess} />} 
          />
          
          {/* Onboarding Route */}
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute>
                <OnboardingContainer user={user} />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <UserSettings />
              </ProtectedRoute>
            } 
          />
          
          {/* Help Routes */}
          <Route 
            path="/help" 
            element={<HelpCenter />} 
          />
        </Routes>
        
        {/* App Footer */}
        <footer className="mt-5 pt-3 text-center text-muted border-top">
          <p>Marathon Training App - Built with React & Firebase</p>
          {!user && (
            <p className="small">
              <Link to="/login" className="text-primary">Login</Link> to link your own Google Sheet and save your progress
            </p>
          )}
          {configService.isDevelopment && (
            <div className="small mt-2 py-1 px-2 bg-light rounded">
              <span className="badge bg-info text-dark me-2">ENV: {configService.env.toUpperCase()}</span>
              {Object.entries(configService.features)
                .filter(([name, enabled]) => enabled)
                .map(([name]) => (
                  <span key={name} className="badge bg-secondary me-1">{name}</span>
                ))}
            </div>
          )}
        </footer>
      </div>
    </Router>
  );
}

export default App;