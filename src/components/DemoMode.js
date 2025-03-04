import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './DemoMode.css';

// Demo data
const DEMO_WORKOUTS = [
  {
    id: 'demo-week1-day1',
    title: 'Day 1: Strength Foundations',
    description: 'Build a solid strength base with this foundational workout',
    phase: 'strength',
    week: 1,
    day: 'Day 1',
    duration: '45 mins',
    type: 'strength',
    difficulty: 'beginner',
    featured: true,
    exercises: [
      {
        id: 'demo-ex1',
        name: 'Goblet Squat',
        sets: '3',
        reps: '10-12',
        tempo: '2-1-2',
        load: 'Medium',
        rest: '60s',
        notes: 'Keep chest up, knees in line with toes',
        videoUrl: 'https://www.youtube.com/watch?v=mF5tnEBqOpU', // Pinnacle FH Club Goblet Squat
        target: 'lower',
        equipment: 'dumbbell'
      },
      {
        id: 'demo-ex2',
        name: 'Push-up',
        sets: '3',
        reps: '8-10',
        tempo: '2-0-2',
        load: 'Body weight',
        rest: '60s',
        notes: 'Maintain plank position throughout',
        videoUrl: 'https://www.youtube.com/watch?v=4lJ80wDcW8E', // Pinnacle FH Club Bench Press (similar to push-up)
        target: 'upper',
        equipment: 'bodyweight'
      },
      {
        id: 'demo-ex3',
        name: 'Romanian Deadlift',
        sets: '3',
        reps: '10',
        tempo: '3-1-1',
        load: 'Light-Medium',
        rest: '75s',
        notes: 'Hinge at hips, slight knee bend',
        videoUrl: 'https://www.youtube.com/watch?v=ka9iZ3qkJ6s', // Pinnacle FH Club RDL
        target: 'lower',
        equipment: 'barbell'
      },
      {
        id: 'demo-ex4',
        name: 'Dumbbell Row',
        sets: '3',
        reps: '12 each',
        tempo: '2-1-2',
        load: 'Medium',
        rest: '60s',
        notes: 'Keep back flat, pull elbow back',
        videoUrl: 'https://www.youtube.com/watch?v=F-Yx89MR4FM', // Pinnacle FH Club Horizontal Rows
        target: 'upper',
        equipment: 'dumbbell'
      },
      {
        id: 'demo-ex5',
        name: 'Plank',
        sets: '3',
        reps: '30-45 sec',
        tempo: 'Hold',
        load: 'Body weight',
        rest: '45s',
        notes: 'Keep body in straight line',
        videoUrl: 'https://www.youtube.com/watch?v=e-mqV4Dbqc4', // Pinnacle FH Club Deadbug (similar core exercise)
        target: 'core',
        equipment: 'bodyweight'
      }
    ]
  },
  {
    id: 'demo-week1-day2',
    title: 'Day 2: Mobility & Core Focus',
    description: 'Improve flexibility and core strength',
    phase: 'strength',
    week: 1,
    day: 'Day 2',
    duration: '35 mins',
    type: 'mobility',
    difficulty: 'beginner',
    featured: false,
    exercises: [
      {
        id: 'demo-ex6',
        name: 'Cat-Cow',
        sets: '2',
        reps: '10 each',
        tempo: 'Slow',
        load: 'Body weight',
        rest: '30s',
        notes: 'Move smoothly between positions',
        videoUrl: 'https://www.youtube.com/watch?v=kqnua4rHVVA',
        target: 'core',
        equipment: 'bodyweight'
      },
      {
        id: 'demo-ex7',
        name: 'Bird Dog',
        sets: '3',
        reps: '8 each side',
        tempo: '2-2-2',
        load: 'Body weight',
        rest: '45s',
        notes: 'Keep hips level, extend opposite arm and leg',
        videoUrl: 'https://www.youtube.com/watch?v=7YVnpQPjPB8', // Pinnacle FH Club Bird Dog
        target: 'core',
        equipment: 'bodyweight'
      }
    ]
  },
  {
    id: 'demo-week5-day1',
    title: 'Day 1: Power & Strength',
    description: 'Develop explosive power and strength',
    phase: 'conditioning',
    week: 5,
    day: 'Day 1',
    duration: '50 mins',
    type: 'power',
    difficulty: 'intermediate',
    featured: true,
    exercises: [
      {
        id: 'demo-ex8',
        name: 'Box Jump',
        sets: '4',
        reps: '6',
        tempo: 'Explosive',
        load: 'Body weight',
        rest: '90s',
        notes: 'Land softly, step down',
        videoUrl: 'https://www.youtube.com/watch?v=mF5tnEBqOpU', // Pinnacle FH Club Goblet Squat (similar to box jump)
        target: 'lower',
        equipment: 'box'
      },
      {
        id: 'demo-ex9',
        name: 'Medicine Ball Throw',
        sets: '4',
        reps: '8',
        tempo: 'Explosive',
        load: 'Medium',
        rest: '75s',
        notes: 'Engage core and throw powerfully',
        videoUrl: 'https://www.youtube.com/watch?v=AH_QZLGhQGE', // Pinnacle FH Club Pallof Press (similar core exercise)
        target: 'upper',
        equipment: 'medicine ball'
      }
    ]
  },
  {
    id: 'demo-week9-day1',
    title: 'Day 1: Endurance Building',
    description: 'Increase muscular and cardiovascular endurance',
    phase: 'mobility',
    week: 9,
    day: 'Day 1',
    duration: '55 mins',
    type: 'endurance',
    difficulty: 'advanced',
    featured: true,
    exercises: [
      {
        id: 'demo-ex10',
        name: 'Kettlebell Swing',
        sets: '3',
        reps: '20',
        tempo: 'Dynamic',
        load: 'Medium-Heavy',
        rest: '60s',
        notes: 'Power from hips, not arms',
        videoUrl: 'https://www.youtube.com/watch?v=3qT5ZcYJskc', // Pinnacle FH Club Pull Down (similar dynamic movement)
        target: 'full',
        equipment: 'kettlebell'
      }
    ]
  }
];

function DemoMode() {
  const navigate = useNavigate();
  const [activePhase, setActivePhase] = useState('strength');
  const [featuredWorkouts, setFeaturedWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [showTip, setShowTip] = useState(true);
  const [tipIndex, setTipIndex] = useState(0);
  
  // Demo tips to guide users
  const demoTips = [
    "Welcome to Marathon Training App Demo! Explore workouts from different training phases.",
    "Click on any workout card to view detailed exercises and instructions.",
    "Try the Custom Workout Creator to build your own workout routine.",
    "Connect your Google Sheet to access your personalized training plan.",
    "Track your progress by marking workouts as complete."
  ];
  
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      const featured = DEMO_WORKOUTS.filter(workout => workout.featured);
      setFeaturedWorkouts(featured);
      setActiveWorkout(featured[0]);
      setLoading(false);
    }, 1500);
    
    // Rotate tips every 6 seconds
    const tipInterval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % demoTips.length);
    }, 6000);
    
    return () => clearInterval(tipInterval);
  }, []);
  
  // Handle phase change
  const handlePhaseChange = (phase) => {
    setLoading(true);
    setActivePhase(phase);
    
    // Simulate loading data for the new phase
    setTimeout(() => {
      const phaseWorkouts = DEMO_WORKOUTS.filter(workout => workout.phase === phase);
      setFeaturedWorkouts(phaseWorkouts);
      setActiveWorkout(phaseWorkouts.length > 0 ? phaseWorkouts[0] : null);
      setLoading(false);
    }, 800);
  };
  
  // Extract YouTube video ID from URL and validate it's from Pinnacle FH Club
  const getYouTubeId = (url) => {
    if (!url) return null;
    
    // Regular URL format
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    
    // Only allow videos from specific demo IDs that are from Pinnacle FH Club
    const allowedVideos = [
      'fZZ5wYkIeXk', // Hip Bridge
      '4lJ80wDcW8E', // Bench Press
      'F-Yx89MR4FM', // Horizontal Rows
      'oBGeXxnigsQ', // Overhead Press
      '3qT5ZcYJskc', // Pull Down
      'kwG2ipFRgfo', // Bicep Curls
      'jQr-Zo4E1o4', // Tricep Extensions
      'AH_QZLGhQGE', // Pallof Press
      'e-mqV4Dbqc4', // Deadbug
      'kqnua4rHVVA', // Cat Cow
      'l2VQ_WZ8Bto', // Shoulder Mobility
      'mF5tnEBqOpU', // Goblet Squat
      'ka9iZ3qkJ6s', // RDL
      'c9SPIgq_vhc', // Calf Raise
      '7YVnpQPjPB8'  // Bird Dog
    ];
    
    // Return the ID only if it's in our allowed list
    return allowedVideos.includes(videoId) ? videoId : 'mF5tnEBqOpU'; // Default to Goblet Squat if not found
  };

  // Handle workout selection
  const handleWorkoutSelect = (workout) => {
    setActiveWorkout(workout);
    
    // Scroll to workout detail section
    const detailSection = document.getElementById('workout-detail');
    if (detailSection) {
      detailSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="demo-mode-container">
      {/* Demo mode banner */}
      {showTip && (
        <div className="demo-tip-banner">
          <div className="demo-tip-content">
            <i className="bi bi-info-circle-fill me-2"></i>
            <span className="demo-tip-text">{demoTips[tipIndex]}</span>
          </div>
          <button className="btn-close" onClick={() => setShowTip(false)} aria-label="Close"></button>
        </div>
      )}
      
      {/* Hero section */}
      <div className="demo-hero">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="demo-hero-title">Marathon Training Made Simple</h1>
              <p className="demo-hero-subtitle">Structured workouts to prepare you for race day</p>
              <div className="hero-buttons">
                <button 
                  className="btn btn-primary btn-lg me-3"
                  onClick={() => navigate('/login')}
                >
                  <i className="bi bi-person-fill me-2"></i>
                  Login
                </button>
                <Link 
                  to="/custom-workout"
                  className="btn btn-outline-light btn-lg"
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Custom Workout
                </Link>
              </div>
            </div>
            <div className="col-lg-6 d-none d-lg-block">
              <div className="demo-hero-image">
                <img src={`${process.env.PUBLIC_URL}/images/logos/alzheimersheroeslogo.png`} alt="Training" className="img-fluid" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Phase selector */}
      <div className="phase-selector-container">
        <div className="container">
          <div className="phase-selector">
            <button 
              className={`phase-btn ${activePhase === 'strength' ? 'active' : ''}`}
              onClick={() => handlePhaseChange('strength')}
            >
              <i className="bi bi-activity"></i>
              <span>Week 1-4</span>
            </button>
            <button 
              className={`phase-btn ${activePhase === 'conditioning' ? 'active' : ''}`}
              onClick={() => handlePhaseChange('conditioning')}
            >
              <i className="bi bi-heart-pulse"></i>
              <span>Week 5-8</span>
            </button>
            <button 
              className={`phase-btn ${activePhase === 'mobility' ? 'active' : ''}`}
              onClick={() => handlePhaseChange('mobility')}
            >
              <i className="bi bi-person-walking"></i>
              <span>Week 9-12</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Featured workouts section */}
      <section className="featured-workouts-section">
        <div className="container">
          <h2 className="section-title">
            <span className="highlight">{activePhase === 'strength' ? 'Week 1-4' : activePhase === 'conditioning' ? 'Week 5-8' : 'Week 9-12'}</span> Featured Workouts
          </h2>
          
          {loading ? (
            <div className="loading-container">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>Loading workouts...</p>
            </div>
          ) : (
            <div className="row">
              {featuredWorkouts.length > 0 ? (
                featuredWorkouts.map(workout => (
                  <div key={workout.id} className="col-md-6 col-lg-4 mb-4">
                    <div 
                      className={`workout-card animate-in ${activeWorkout && activeWorkout.id === workout.id ? 'active' : ''}`}
                      onClick={() => handleWorkoutSelect(workout)}
                    >
                      <div className="workout-card-header">
                        <span className={`workout-type ${workout.type}`}>{workout.type}</span>
                        <span className="workout-difficulty">{workout.difficulty}</span>
                      </div>
                      <h3 className="workout-title">{workout.title}</h3>
                      <div className="workout-meta">
                        <span><i className="bi bi-clock"></i> {workout.duration}</span>
                        <span><i className="bi bi-lightning"></i> {workout.exercises.length} exercises</span>
                      </div>
                      <p className="workout-desc">{workout.description}</p>
                      <div className="view-details">
                        <span>View Details</span>
                        <i className="bi bi-arrow-right"></i>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-workouts">
                  <p>No workouts available for this phase in demo mode.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      
      {/* Workout detail section */}
      {activeWorkout && (
        <section id="workout-detail" className="workout-detail-section">
          <div className="container">
            <div className="workout-detail-card">
              <div className="workout-detail-header">
                <h2 className="workout-detail-title">{activeWorkout.title}</h2>
                <div className="workout-tags">
                  <span className={`workout-tag ${activeWorkout.type}`}>{activeWorkout.type}</span>
                  <span className="workout-tag difficulty">{activeWorkout.difficulty}</span>
                  <span className="workout-tag duration">{activeWorkout.duration}</span>
                </div>
              </div>
              
              <div className="workout-exercises">
                <h3 className="exercises-title">Exercises</h3>
                <div className="exercise-list">
                  {activeWorkout.exercises.map((exercise, index) => (
                    <div key={exercise.id} className="exercise-item animate-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="exercise-header">
                        <div className="exercise-number">{index + 1}</div>
                        <h4 className="exercise-name">{exercise.name}</h4>
                        <div className="exercise-tags">
                          <span className="exercise-tag target">{exercise.target}</span>
                          <span className="exercise-tag equipment">{exercise.equipment}</span>
                        </div>
                      </div>
                      
                      <div className="exercise-details">
                        <div className="detail-item">
                          <span className="detail-label">Sets</span>
                          <span className="detail-value">{exercise.sets}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Reps</span>
                          <span className="detail-value">{exercise.reps}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Tempo</span>
                          <span className="detail-value">{exercise.tempo}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Load</span>
                          <span className="detail-value">{exercise.load}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Rest</span>
                          <span className="detail-value">{exercise.rest}</span>
                        </div>
                      </div>
                      
                      <div className="exercise-notes">
                        <p><strong>Notes:</strong> {exercise.notes}</p>
                      </div>
                      
                      {exercise.videoUrl && (
                        <div className="exercise-video mt-3">
                          <div className="ratio ratio-16x9">
                            <>
                              {/* Fallback message that will show if iframe fails to load */}
                              <noscript>
                                <div className="alert alert-warning">
                                  JavaScript is required to view this video. 
                                  <a href={`https://www.youtube.com/watch?v=${getYouTubeId(exercise.videoUrl)}`} target="_blank" rel="noopener noreferrer">
                                    Watch on YouTube instead
                                  </a>.
                                </div>
                              </noscript>
                              
                              <iframe 
                                src={`https://www.youtube-nocookie.com/embed/${getYouTubeId(exercise.videoUrl)}?origin=https://nickcresner.github.io&modestbranding=1&playsinline=1&fs=1`}
                                title={`${exercise.name} demonstration`}
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-downgrade"
                                loading="lazy"
                                allowFullScreen
                              ></iframe>
                              
                              {/* Fallback link that will be visible if iframe somehow fails */}
                              <div className="youtube-error" style={{display: 'none'}}>
                                Video could not be loaded. 
                                <a href={`https://www.youtube.com/watch?v=${getYouTubeId(exercise.videoUrl)}`} 
                                   className="btn btn-sm btn-primary mt-2"
                                   target="_blank" rel="noopener noreferrer">
                                  Watch on YouTube
                                </a>
                              </div>
                            </>
                          </div>
                          <p className="mt-2 text-muted small">Technique demonstration for {exercise.name}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="workout-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => alert('Feature disabled in demo mode. Login to track your workouts!')}
                >
                  <i className="bi bi-check-circle me-2"></i>
                  Mark as Complete
                </button>
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/custom-workout')}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Create Custom Workout
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Features section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">
            Take Your Training to the <span className="highlight">Next Level</span>
          </h2>
          
          <div className="row features-grid">
            <div className="col-md-4 mb-4">
              <div className="feature-card animate-in">
                <div className="feature-icon">
                  <i className="bi bi-google"></i>
                </div>
                <h3 className="feature-title">Connect Google Sheet</h3>
                <p className="feature-desc">Import your personalized training plan from Google Sheets for a customized experience.</p>
              </div>
            </div>
            
            <div className="col-md-4 mb-4">
              <div className="feature-card animate-in" style={{ animationDelay: '0.2s' }}>
                <div className="feature-icon">
                  <i className="bi bi-clipboard-check"></i>
                </div>
                <h3 className="feature-title">Track Progress</h3>
                <p className="feature-desc">Keep track of your completed workouts and monitor your training progression.</p>
              </div>
            </div>
            
            <div className="col-md-4 mb-4">
              <div className="feature-card animate-in" style={{ animationDelay: '0.4s' }}>
                <div className="feature-icon">
                  <i className="bi bi-sliders"></i>
                </div>
                <h3 className="feature-title">Customize Workouts</h3>
                <p className="feature-desc">Create and save custom workouts tailored to your specific training needs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Start Your Marathon Journey?</h2>
            <p className="cta-subtitle">Create an account or connect your Google Sheet to access all features</p>
            <div className="cta-buttons">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
                Get Started
              </button>
              <Link to="/help" className="btn btn-outline-light btn-lg">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DemoMode;