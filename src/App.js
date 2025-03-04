// src/App.js
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Firebase
import { getCurrentUser, getUserProfile } from './services/firebaseService';

// Components
import LoadingAnimation from './components/LoadingAnimation';
import Navigation from './components/Layout/Navigation';
import WorkoutList from './components/WorkoutList';
import WorkoutDetail from './components/WorkoutDetail';
import BlockSelection from './components/BlockSelection';
import ExerciseDetail from './components/ExerciseDetail';
import CustomWorkout from './components/CustomWorkout';
import DemoMode from './components/DemoMode';
import AuthContainer from './components/Auth/AuthContainer';
import UserSettings from './components/Settings/UserSettings';
import HelpCenter from './components/Help/HelpCenter';
import OnboardingContainer from './components/Onboarding/OnboardingContainer';

// Import data fetching service
import { fetchWorkouts, TRAINING_PHASES, groupWeeksIntoBlocks } from './data/workouts';
import { getGoogleSheetSettings } from './services/firebaseService';

// Add global polyfill for YouTube iframe API fallback
if (typeof window !== 'undefined') {
  window.onYouTubeIframeAPIReady = function() {
    console.log('YouTube iframe API ready');
    // This globally accessible function helps with YouTube iframe API issues
  };
}

// For Admin and Coach components, we'll implement lazy loading later
// Commenting out imports that aren't yet implemented to fix build

/*
// Admin Components
import AdminDashboard from './components/Admin/AdminDashboard';
import UserManagement from './components/Admin/UserManagement';
import AdminExerciseManager from './components/Admin/AdminExerciseManager';
import AdminWorkoutManager from './components/Admin/AdminWorkoutManager';
import AdminLogs from './components/Admin/AdminLogs';

// Coach Components
import CoachDashboard from './components/Coach/CoachDashboard';
import CoachExerciseManager from './components/Coach/CoachExerciseManager';
import CoachWorkoutManager from './components/Coach/CoachWorkoutManager';
import CoachClientManager from './components/Coach/CoachClientManager';
import CoachMessaging from './components/Coach/CoachMessaging';
*/


// Debug flag to force show loading animation - set to false by default
window.SHOW_LOADING_ANIMATION = false;

function App() {
  const [workouts, setWorkouts] = useState([]);
  const [currentPhase, setCurrentPhase] = useState('base');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // User authentication state
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [userRole, setUserRole] = useState('user'); // 'user', 'coach', or 'admin'
  
  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        // Check if user needs onboarding and get user role
        if (currentUser) {
          await checkUserOnboardingStatus(currentUser.uid);
          
          // Get user profile data including role
          const userProfile = await getUserProfile(currentUser.uid);
          if (userProfile && userProfile.role) {
            setUserRole(userProfile.role);
            console.log(`User role: ${userProfile.role}`);
          }
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
  
  // Log initialization and load saved phase
  useEffect(() => {
    if (authChecked) {
      console.log('App initialized with user:', user ? user.email : 'none');
      
      // Try to load saved phase from localStorage
      const savedPhase = localStorage.getItem('selectedPhase');
      if (savedPhase && TRAINING_PHASES.some(p => p.id === savedPhase)) {
        setCurrentPhase(savedPhase);
      }
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
        
        // Get custom workouts from localStorage
        const customWorkouts = JSON.parse(localStorage.getItem('customWorkouts') || '[]');
        
        // Combine regular workouts with custom workouts
        let allWorkouts = [...data];
        
        // Add custom workouts if we're on custom phase or all phases
        if (currentPhase === 'custom' || currentPhase === 'all') {
          allWorkouts = [...allWorkouts, ...customWorkouts];
        }
        
        // If we're using test data, ensure the week numbers align with the correct phase
        const processedData = allWorkouts.map(workout => {
          // Skip custom workouts as they don't need week adjustment
          if (workout.phase === 'custom') return workout;
          
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
  const handleAuthSuccess = async (user) => {
    setUser(user);
    
    // Check if the user needs onboarding
    await checkUserOnboardingStatus(user.uid);
    
    // Get user role
    try {
      const userProfile = await getUserProfile(user.uid);
      if (userProfile && userProfile.role) {
        setUserRole(userProfile.role);
      }
    } catch (error) {
      console.error("Error getting user role:", error);
    }
    
    // Add console log to track authentication flow
    console.log("Authentication successful, user set:", user.email);
  };
  
  const handleLogout = () => {
    setUser(null);
    setNeedsOnboarding(false);
    setUserRole('user');  // Reset to default role
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
      // Save selection to localStorage
      localStorage.setItem('selectedPhase', phaseId);
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
      return <Navigate to="/demo" />;
    }
    
    return children;
  };
  
  // Admin-only route protection
  const AdminRoute = ({ children }) => {
    if (!authChecked) {
      return <div className="container mt-5 text-center">Checking authentication...</div>;
    }
    
    if (!user) {
      return <Navigate to="/demo" />;
    }
    
    if (userRole !== 'admin') {
      return <Navigate to="/" />;
    }
    
    return children;
  };
  
  // Coach or Admin route protection
  const CoachRoute = ({ children }) => {
    if (!authChecked) {
      return <div className="container mt-5 text-center">Checking authentication...</div>;
    }
    
    if (!user) {
      return <Navigate to="/demo" />;
    }
    
    if (userRole !== 'coach' && userRole !== 'admin') {
      return <Navigate to="/" />;
    }
    
    return children;
  };
  
  if (!authChecked) {
    return <div className="container mt-5 text-center">Initializing app...</div>;
  }
  
  // Use the debug flag to force show the loading animation
  if (isLoading || window.SHOW_LOADING_ANIMATION) {
    return (
      <Router>
        <Navigation user={user} onLogout={handleLogout} />
        <LoadingAnimation />
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
              user === null ? (
                <Navigate to="/demo" />
              ) : needsOnboarding ? (
                <Navigate to="/onboarding" />
              ) : userRole === 'admin' ? (
                <Navigate to="/admin" />
              ) : userRole === 'coach' ? (
                <Navigate to="/coach" />
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
          
          {/* Custom Workout Creator */}
          <Route 
            path="/custom-workout" 
            element={<CustomWorkout />} 
          />
          <Route
            path="/custom-workout/:workoutId"
            element={<WorkoutDetail workouts={workouts} currentPhase="custom" />}
          />
          
          {/* Demo Mode */}
          <Route 
            path="/demo" 
            element={<DemoMode />} 
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
          
          {/* Admin Routes - Temporarily disabled until they're fully implemented
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <div className="alert alert-info">Admin dashboard coming soon.</div>
              </AdminRoute>
            } 
          />
          */}
          
          {/* Temporary admin route placeholder */}
          <Route 
            path="/admin" 
            element={
              user && userRole === 'admin' ? (
                <div className="alert alert-info p-5 text-center">
                  <h2>Admin Dashboard</h2>
                  <p>Admin features are coming soon in the next update.</p>
                  <Link to="/" className="btn btn-primary mt-3">Return to Workouts</Link>
                </div>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          
          {/* Coach Routes - Temporarily disabled until they're fully implemented
          <Route 
            path="/coach" 
            element={
              <CoachRoute>
                <div className="alert alert-info">Coach dashboard coming soon.</div>
              </CoachRoute>
            } 
          />
          */}
          
          {/* Temporary coach route placeholder */}
          <Route 
            path="/coach" 
            element={
              user && userRole === 'coach' ? (
                <div className="alert alert-info p-5 text-center">
                  <h2>Coach Dashboard</h2>
                  <p>Coach features are coming soon in the next update.</p>
                  <Link to="/" className="btn btn-primary mt-3">Return to Workouts</Link>
                </div>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
        </Routes>
        
        {/* App Footer */}
        <footer className="mt-5 pt-3 text-center text-muted border-top">
          <div className="d-flex justify-content-center align-items-center mb-2">
            <img 
              src="https://nickcresner.github.io/marathon-training-app/images/logos/alzheimersheroeslogo.png" 
              alt="Alzheimer's Heroes Logo" 
              style={{ height: '50px', marginRight: '10px' }} 
            />
            <p className="mb-0" style={{ color: '#FF9900', fontWeight: 'bold' }}>
              Built for <a 
                href="https://alzheimersheroes.co.uk" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ color: '#FF9900', fontWeight: 'bold', textDecoration: 'underline' }}
              >
                Alzheimer's Heroes
              </a>
            </p>
          </div>
          {!user && (
            <p className="small">
              <Link to="/login" className="text-primary">Login</Link> to link your own Google Sheet and save your progress or try our <Link to="/demo" className="text-primary">Demo Mode</Link>
            </p>
          )}
        </footer>
      </div>
    </Router>
  );
}

export default App;