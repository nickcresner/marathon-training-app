// src/components/ExerciseDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import YouTube from 'react-youtube';
import { findExerciseVideo, getCoachNotes } from '../services/youtubeService';
import ExerciseHistory from './History/ExerciseHistory';

function ExerciseDetail({ workouts, updateExerciseHistory }) {
  const { workoutId, exerciseId } = useParams();
  const navigate = useNavigate();
  
  // State for the exercise and form data
  const [exercise, setExercise] = useState(null);
  const [workout, setWorkout] = useState(null);
  const [adjacentExercises, setAdjacentExercises] = useState({ prev: null, next: null });
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    actualSets: '',
    actualReps: '',
    actualLoad: '',
    notes: ''
  });
  
  // State for display mode
  const [showHistoryFromSheet, setShowHistoryFromSheet] = useState(true);
  
  // State for YouTube video ID and embed code
  const [videoData, setVideoData] = useState({ videoId: null, embedCode: null });
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  // Find the exercise on component mount
  // Find and set the current exercise data
  useEffect(() => {
    if (!workouts || workouts.length === 0) return;
    
    // Find the workout
    const foundWorkout = workouts.find(w => w.id === workoutId);
    if (!foundWorkout) return;
    
    // Find the exercise and its index
    const exerciseIndex = foundWorkout.exercises.findIndex(e => e.id === exerciseId);
    if (exerciseIndex === -1) return;
    
    const foundExercise = foundWorkout.exercises[exerciseIndex];
    
    setWorkout(foundWorkout);
    setExercise(foundExercise);
    
    // Find adjacent exercises
    const prevExercise = exerciseIndex > 0 ? foundWorkout.exercises[exerciseIndex - 1] : null;
    const nextExercise = exerciseIndex < foundWorkout.exercises.length - 1 
      ? foundWorkout.exercises[exerciseIndex + 1] 
      : null;
    
    setAdjacentExercises({
      prev: prevExercise,
      next: nextExercise
    });
    
    // Pre-fill form with prescription values
    setFormData(prev => ({
      ...prev,
      actualSets: foundExercise.sets,
      actualReps: foundExercise.reps,
      actualLoad: foundExercise.load
    }));
    
    // Try to find YouTube ID from exercise URL
    if (foundExercise.videoUrl) {
      const youtubeId = getYouTubeId(foundExercise.videoUrl);
      // Create embed code from videoId
      const embedCode = youtubeId ? 
        `<iframe width="560" height="315" src="https://www.youtube.com/embed/${youtubeId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>` : 
        null;
      
      setVideoData({ 
        videoId: youtubeId,
        embedCode: embedCode
      });
    } else {
      // If no direct URL, look for a matching video from Pinnacle FH Club
      setIsLoadingVideo(true);
      findExerciseVideo(foundExercise.name)
        .then(result => {
          if (result) {
            setVideoData(result);
          } else {
            setVideoData({ videoId: null, embedCode: null });
          }
          setIsLoadingVideo(false);
        })
        .catch(error => {
          console.error('Error finding exercise video:', error);
          setIsLoadingVideo(false);
          setVideoData({ videoId: null, embedCode: null });
        });
    }
    
    // Load history from localStorage if available
    const exerciseHistory = JSON.parse(localStorage.getItem(`exercise_${exerciseId}`) || '[]');
    if (exerciseHistory.length > 0) {
      // Update the exercise with stored history
      const updatedExercise = {
        ...foundExercise,
        history: exerciseHistory
      };
      setExercise(updatedExercise);
    }
  }, [workouts, workoutId, exerciseId]);
  
  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Left arrow key for previous exercise
      if (e.key === 'ArrowLeft' && adjacentExercises.prev) {
        navigate(`/workout/${workoutId}/exercise/${adjacentExercises.prev.id}`);
      }
      
      // Right arrow key for next exercise
      if (e.key === 'ArrowRight' && adjacentExercises.next) {
        navigate(`/workout/${workoutId}/exercise/${adjacentExercises.next.id}`);
      }
      
      // Escape key to go back to workout
      if (e.key === 'Escape') {
        navigate(`/workout/${workoutId}`);
      }
    };
    
    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, workoutId, adjacentExercises]);
  
  // Extract YouTube video ID from URL
  const getYouTubeId = (url) => {
    if (!url) return null;
    
    // Check if it's already an embed code
    if (url.includes('<iframe') && url.includes('youtube.com/embed/')) {
      const embedRegEx = /youtube\.com\/embed\/([^"&?\/\s]{11})/;
      const embedMatch = url.match(embedRegEx);
      return (embedMatch && embedMatch[1]) ? embedMatch[1] : null;
    }
    
    // Regular URL format
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Save exercise history
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!exercise) return;
    
    const historyEntry = {
      id: Date.now(),
      date: formData.date,
      sets: formData.actualSets,
      reps: formData.actualReps,
      load: formData.actualLoad,
      notes: formData.notes,
      fromApp: true // Mark this entry as coming from the app, not the sheet
    };
    
    // Add to exercise history
    const updatedHistory = [...(exercise.history || []), historyEntry];
    
    // Save to localStorage
    localStorage.setItem(`exercise_${exerciseId}`, JSON.stringify(updatedHistory));
    
    // Update in state and parent component if provided
    if (updateExerciseHistory) {
      updateExerciseHistory(workoutId, exerciseId, updatedHistory);
    }
    
    // Update local state
    setExercise({
      ...exercise,
      history: updatedHistory
    });
    
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      actualSets: exercise.sets,
      actualReps: exercise.reps,
      actualLoad: exercise.load,
      notes: ''
    });
    
    alert('Exercise history saved!');
  };
  
  // Delete a history entry
  const handleDeleteHistory = (historyId) => {
    if (!exercise || !exercise.history) return;
    
    const updatedHistory = exercise.history.filter(entry => entry.id !== historyId);
    
    // Save to localStorage
    localStorage.setItem(`exercise_${exerciseId}`, JSON.stringify(updatedHistory));
    
    // Update in state and parent component if provided
    if (updateExerciseHistory) {
      updateExerciseHistory(workoutId, exerciseId, updatedHistory);
    }
    
    // Update local state
    setExercise({
      ...exercise,
      history: updatedHistory
    });
  };
  
  if (!exercise || !workout) {
    return <div className="text-center my-5">Loading exercise details...</div>;
  }
  
  // The videoId state is now managed in the useEffect above
  
  return (
    <div className="exercise-detail container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <button 
            className="btn btn-outline-secondary me-2" 
            onClick={() => navigate(`/workout/${workoutId}`)}
          >
            Back to Workout
          </button>
          
          <button 
            className="btn btn-outline-primary" 
            onClick={() => navigate('/')}
          >
            Home
          </button>
        </div>
        
        <div className="btn-group">
          {adjacentExercises.prev && (
            <button
              className="btn btn-outline-primary"
              onClick={() => navigate(`/workout/${workoutId}/exercise/${adjacentExercises.prev.id}`)}
              title={adjacentExercises.prev.name}
            >
              &larr; Previous
            </button>
          )}
          
          {adjacentExercises.next && (
            <button
              className="btn btn-outline-primary ms-2"
              onClick={() => navigate(`/workout/${workoutId}/exercise/${adjacentExercises.next.id}`)}
              title={adjacentExercises.next.name}
            >
              Next &rarr;
            </button>
          )}
        </div>
      </div>
      
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0">
                {exercise.isPartOfSuperset && (
                  <span className="badge bg-light text-primary me-2">
                    {exercise.supersetId}{exercise.supersetOrder}
                  </span>
                )}
                {exercise.name}
              </h2>
              <div className="small">{workout.title}</div>
              {exercise.isPartOfSuperset && (
                <div className="mt-1">
                  <span className="badge bg-light text-primary">
                    Part of Superset {exercise.supersetId}
                  </span>
                </div>
              )}
            </div>
            
            <div className="d-flex">
              <div className="exercise-nav">
                {adjacentExercises.prev && (
                  <button
                    className="btn btn-sm btn-light text-primary me-2"
                    onClick={() => navigate(`/workout/${workoutId}/exercise/${adjacentExercises.prev.id}`)}
                    title={`Previous: ${adjacentExercises.prev.name}`}
                  >
                    &larr;
                  </button>
                )}
                
                <span className="text-light small">
                  Exercise {workout.exercises.findIndex(e => e.id === exerciseId) + 1} of {workout.exercises.length}
                </span>
                
                {adjacentExercises.next && (
                  <button
                    className="btn btn-sm btn-light text-primary ms-2"
                    onClick={() => navigate(`/workout/${workoutId}/exercise/${adjacentExercises.next.id}`)}
                    title={`Next: ${adjacentExercises.next.name}`}
                  >
                    &rarr;
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="mb-4">
                <h4>Exercise Prescription</h4>
                
                {exercise.isPartOfSuperset && (
                  <div className="alert alert-info mb-3">
                    <strong>Superset Information:</strong> This exercise is part of Superset {exercise.supersetId}.
                    Perform all exercises in this superset back-to-back with minimal rest between exercises.
                    Rest only after completing all exercises in the superset.
                  </div>
                )}
                
                <table className="table">
                  <tbody>
                    <tr>
                      <th>Sets</th>
                      <td>{exercise.sets}</td>
                    </tr>
                    <tr>
                      <th>Reps</th>
                      <td>{exercise.reps}</td>
                    </tr>
                    <tr>
                      <th>Tempo</th>
                      <td>{exercise.tempo}</td>
                    </tr>
                    <tr>
                      <th>Load</th>
                      <td>{exercise.load}</td>
                    </tr>
                    <tr>
                      <th>Rest</th>
                      <td>
                        {exercise.rest}
                        {exercise.isPartOfSuperset && (
                          <span className="text-muted ms-2">
                            (after completing all exercises in Superset {exercise.supersetId})
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <th>Notes</th>
                      <td>{exercise.notes}</td>
                    </tr>
                    {exercise.isPartOfSuperset && (
                      <tr>
                        <th>Superset Position</th>
                        <td>Exercise {exercise.supersetOrder} of Superset {exercise.supersetId}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="col-md-6">
              {isLoadingVideo ? (
                <div className="text-center p-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading video...</span>
                  </div>
                  <p className="mt-2">Finding exercise video...</p>
                </div>
              ) : videoData.embedCode ? (
                <div className="mb-4">
                  <h4>Exercise Technique Guide</h4>
                  
                  {/* Thumbnail preview */}
                  {videoData.thumbnailUrl && (
                    <div className="exercise-thumbnail-container mb-3">
                      <img 
                        src={videoData.thumbnailUrl} 
                        alt={`${exercise.name} demonstration`}
                        className="img-fluid exercise-thumbnail"
                      />
                      <div className="play-overlay" onClick={() => document.getElementById('exercise-video-player').scrollIntoView({ behavior: 'smooth' })}>
                        <i className="bi bi-play-circle-fill"></i>
                      </div>
                    </div>
                  )}
                  
                  {/* Coach notes */}
                  {videoData.coachNotes && (
                    <div className="coach-notes-container mb-3">
                      <h5 className="coach-notes-title">
                        <i className="bi bi-clipboard-check"></i> Coach Notes
                      </h5>
                      <p className="coach-notes-text">{videoData.coachNotes}</p>
                    </div>
                  )}
                  
                  {/* Video player */}
                  <div className="video-wrapper" id="exercise-video-player">
                    <div className="ratio ratio-16x9">
                      {videoData.videoId ? (
                        <>
                          {/* Fallback message that will show if iframe fails to load */}
                          <noscript>
                            <div className="alert alert-warning">
                              JavaScript is required to view this video. 
                              <a href={`https://www.youtube.com/watch?v=${videoData.videoId}`} target="_blank" rel="noopener noreferrer">
                                Watch on YouTube instead
                              </a>.
                            </div>
                          </noscript>
                          
                          {/* Primary embed using iframe - most reliable across browsers */}
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${videoData.videoId}?origin=https://nickcresner.github.io&modestbranding=1&playsinline=1&fs=1`}
                            title={`${exercise.name} demonstration video`}
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
                            <a href={`https://www.youtube.com/watch?v=${videoData.videoId}`} 
                               className="btn btn-sm btn-primary mt-2"
                               target="_blank" rel="noopener noreferrer">
                              Watch on YouTube
                            </a>
                          </div>
                        </>
                      ) : videoData.embedCode ? (
                        // Direct embed code as fallback
                        <div dangerouslySetInnerHTML={{ __html: videoData.embedCode }} />
                      ) : (
                        // Ultimate fallback - no video available
                        <div className="youtube-error">
                          <p>No video available for this exercise.</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-muted small mt-2">
                    Video courtesy of <a href="https://www.youtube.com/@pinnaclefhclub/videos" target="_blank" rel="noopener noreferrer">Pinnacle FH Club YouTube Channel</a>
                  </p>
                </div>
              ) : (
                <div className="exercise-fallback">
                  <div className="exercise-fallback-header">
                    <h4>Exercise Technique Guide</h4>
                  </div>
                  
                  {/* Coach notes even without video */}
                  <div className="coach-notes-container mb-4">
                    <h5 className="coach-notes-title">
                      <i className="bi bi-clipboard-check"></i> Coach Notes
                    </h5>
                    <p className="coach-notes-text">{getCoachNotes(exercise.name)}</p>
                  </div>
                  
                  <div className="no-video-container">
                    <div className="no-video-icon">
                      <i className="bi bi-film"></i>
                    </div>
                    <h5>Video Temporarily Unavailable</h5>
                    <p>We couldn't find a demonstration video for <strong>{exercise.name}</strong> in our system.</p>
                    <div className="fallback-options">
                      <button 
                        className="btn btn-primary mb-2"
                        onClick={() => window.open(`https://www.youtube.com/@pinnaclefhclub/videos`, '_blank')}
                      >
                        <i className="bi bi-youtube me-2"></i>
                        Visit Pinnacle FH Club Channel
                      </button>
                      <button 
                        className="btn btn-outline-primary mb-2"
                        onClick={() => window.open(`https://www.youtube.com/results?search_query=pinnacle+fh+club+${exercise.name.replace(/\s+/g, '+')}`, '_blank')}
                      >
                        <i className="bi bi-search me-2"></i>
                        Search for "{exercise.name}"
                      </button>
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => document.getElementById('coach-chat').scrollIntoView({ behavior: 'smooth' })}
                      >
                        <i className="bi bi-chat-dots me-2"></i>
                        Ask a Coach
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Exercise History Form */}
          <div className="mt-4">
            <h4>Log Your Progress</h4>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label htmlFor="date">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="col-md-2">
                  <div className="form-group mb-3">
                    <label htmlFor="actualSets">Sets</label>
                    <input
                      type="text"
                      className="form-control"
                      id="actualSets"
                      name="actualSets"
                      value={formData.actualSets}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="col-md-2">
                  <div className="form-group mb-3">
                    <label htmlFor="actualReps">Reps</label>
                    <input
                      type="text"
                      className="form-control"
                      id="actualReps"
                      name="actualReps"
                      value={formData.actualReps}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="col-md-2">
                  <div className="form-group mb-3">
                    <label htmlFor="actualLoad">Load</label>
                    <input
                      type="text"
                      className="form-control"
                      id="actualLoad"
                      name="actualLoad"
                      value={formData.actualLoad}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="col-12">
                  <div className="form-group mb-3">
                    <label htmlFor="notes">Notes</label>
                    <textarea
                      className="form-control"
                      id="notes"
                      name="notes"
                      rows="3"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="How did it feel? Any adjustments needed next time?"
                    ></textarea>
                  </div>
                </div>
                
                <div className="col-12">
                  <button type="submit" className="btn btn-success">
                    Save Progress
                  </button>
                </div>
              </div>
            </form>
          </div>
          
          {/* Coach Chat Section */}
          <div className="mt-5 coach-chat-section" id="coach-chat">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4><i className="bi bi-headset me-2"></i> Coach Communication</h4>
              <div className="coach-status">
                <span className="coach-status-indicator online"></span>
                <span className="coach-status-text">Coaches Available</span>
              </div>
            </div>
            
            <div className="chat-container">
              <div className="chat-messages">
                <div className="message coach-message">
                  <div className="message-avatar">
                    <img src={`${process.env.PUBLIC_URL}/images/logos/pinnaclelogo1.png`} alt="Coach" />
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-sender">Coach Michael</span>
                      <span className="message-time">Yesterday at 3:45 PM</span>
                    </div>
                    <div className="message-body">
                      <p>How's the {exercise.name} feeling? Remember to focus on form rather than weight initially. Let me know if you have any questions!</p>
                    </div>
                  </div>
                </div>
                
                <div className="message user-message">
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-sender">You</span>
                      <span className="message-time">Yesterday at 5:30 PM</span>
                    </div>
                    <div className="message-body">
                      <p>I'm feeling some discomfort in my lower back. Should I adjust my form?</p>
                    </div>
                  </div>
                  <div className="message-avatar">
                    <div className="user-avatar-placeholder">
                      <i className="bi bi-person-fill"></i>
                    </div>
                  </div>
                </div>
                
                <div className="message coach-message">
                  <div className="message-avatar">
                    <img src={`${process.env.PUBLIC_URL}/images/logos/pinnaclelogo1.png`} alt="Coach" />
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-sender">Coach Michael</span>
                      <span className="message-time">Today at 9:15 AM</span>
                    </div>
                    <div className="message-body">
                      <p>Good catch! For {exercise.name}, try lowering the weight by 10-15% and focus on engaging your core throughout the movement. Send me a video next session and I'll check your form.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="chat-input">
                <textarea 
                  className="form-control" 
                  placeholder="Type your message to the coach here..."
                  rows="2"
                ></textarea>
                <div className="chat-actions">
                  <button className="btn btn-outline-secondary me-2">
                    <i className="bi bi-paperclip"></i>
                  </button>
                  <button className="btn btn-primary">
                    <i className="bi bi-send me-2"></i>
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Exercise History */}
          <div className="mt-5">
            <h4><i className="bi bi-journal-text me-2"></i> Exercise History</h4>
            <div className="mb-3">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showSheetHistory"
                  checked={showHistoryFromSheet}
                  onChange={(e) => setShowHistoryFromSheet(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="showSheetHistory">
                  Include data from Google Sheet
                </label>
              </div>
              <small className="text-muted">
                Toggle to see your Google Sheet history or just your tracked progress in the app
              </small>
            </div>
            
            {exercise.history && exercise.history.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Sets</th>
                      <th>Reps</th>
                      <th>Load</th>
                      <th>Notes</th>
                      <th>Source</th>
                      {!showHistoryFromSheet && <th>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {exercise.history
                      .filter(entry => showHistoryFromSheet || entry.fromApp)
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((entry, index) => (
                        <tr key={`history-${index}`}>
                          <td>{new Date(entry.date).toLocaleDateString()}</td>
                          <td>{entry.actualSets || entry.sets || '-'}</td>
                          <td>{entry.actualReps || entry.reps || '-'}</td>
                          <td className="fw-bold">{entry.actualLoad || entry.load || '-'}</td>
                          <td>{entry.notes || '-'}</td>
                          <td>
                            <span className={`badge ${entry.fromApp ? 'bg-primary' : 'bg-secondary'}`}>
                              {entry.fromApp ? 'App' : 'Sheet'}
                            </span>
                          </td>
                          {!showHistoryFromSheet && entry.fromApp && (
                            <td>
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteHistory(entry.id)}
                              >
                                Delete
                              </button>
                            </td>
                          )}
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="alert alert-info">
                <p className="mb-0">No history recorded for this exercise yet. Log your first session above!</p>
              </div>
            )}
          </div>
          
          {/* Community Discussion */}
          <div className="mt-5 community-section">
            <h4><i className="bi bi-people-fill me-2"></i> Community Discussion</h4>
            <p className="text-muted mb-3">Connect with others working on {exercise.name}</p>
            
            <div className="community-posts">
              <div className="community-post">
                <div className="post-header d-flex align-items-center">
                  <div className="post-avatar">
                    <div className="user-avatar-placeholder">
                      <i className="bi bi-person-fill"></i>
                    </div>
                  </div>
                  <div className="post-meta">
                    <div className="post-author">SarahRunner92</div>
                    <div className="post-time">2 days ago</div>
                  </div>
                </div>
                <div className="post-content">
                  <p>I've found that doing this exercise with a slower tempo really helps engage the right muscles. Anyone else tried this?</p>
                </div>
                <div className="post-actions">
                  <button className="btn btn-sm btn-outline-secondary">
                    <i className="bi bi-hand-thumbs-up me-1"></i> 4 Likes
                  </button>
                  <button className="btn btn-sm btn-outline-secondary ms-2">
                    <i className="bi bi-reply me-1"></i> Reply
                  </button>
                </div>
              </div>
              
              <div className="community-post">
                <div className="post-header d-flex align-items-center">
                  <div className="post-avatar">
                    <div className="user-avatar-placeholder">
                      <i className="bi bi-person-fill"></i>
                    </div>
                  </div>
                  <div className="post-meta">
                    <div className="post-author">MarathonMike</div>
                    <div className="post-time">5 days ago</div>
                  </div>
                </div>
                <div className="post-content">
                  <p>I struggled with this one initially but after watching the technique video it clicked. Make sure you're not rushing through the eccentric portion!</p>
                </div>
                <div className="post-actions">
                  <button className="btn btn-sm btn-outline-secondary">
                    <i className="bi bi-hand-thumbs-up me-1"></i> 7 Likes
                  </button>
                  <button className="btn btn-sm btn-outline-secondary ms-2">
                    <i className="bi bi-reply me-1"></i> Reply
                  </button>
                </div>
              </div>
            </div>
            
            <div className="community-input mt-3">
              <textarea 
                className="form-control" 
                placeholder="Share your experience or ask a question about this exercise..."
                rows="2"
              ></textarea>
              <button className="btn btn-primary mt-2">
                <i className="bi bi-chat-dots me-2"></i>
                Post to Community
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Keyboard navigation tip */}
      <div className="text-center text-muted small mb-4">
        <p>
          <kbd>←</kbd> / <kbd>→</kbd> to navigate between exercises,
          <kbd>Esc</kbd> to return to workout
        </p>
      </div>
    </div>
  );
}

export default ExerciseDetail;