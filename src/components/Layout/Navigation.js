// src/components/Layout/Navigation.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '../../services/firebaseService';

function Navigation({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);
  
  // Check if we're on mobile and update on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 576);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Handle which nav item is active
  const isActive = (path) => location.pathname === path;
  
  const handleLogout = async () => {
    try {
      await logoutUser();
      if (onLogout) {
        onLogout();
      }
      navigate('/');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  
  return (
    <>
      {/* Traditional Top Navigation - Always visible */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <img 
              src="/marathon-training-app/images/logos/pinnaclelogo1.png" 
              alt="Pinnacle Fitness & Health" 
              className="brand-logo" 
            />
            Marathon Training
          </Link>
          
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
            aria-controls="navbarNav" 
            aria-expanded="false" 
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>
              
              {user && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/help">Help</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/settings">Settings</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/onboarding">Setup Wizard</Link>
                  </li>
                </>
              )}
            </ul>
            
            <div className="navbar-nav">
              {user ? (
                <div className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle" 
                    href="#" 
                    id="navbarDropdown" 
                    role="button" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    {user.email}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    <li>
                      <Link className="dropdown-item" to="/settings">Settings</Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <Link className="nav-link" to="/login">Login</Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* iOS-style Bottom Tab Navigation - Only visible on mobile */}
      {isMobile && user && (
        <div className="mobile-bottom-nav">
          <Link to="/" className={`mobile-bottom-nav-item ${isActive('/') ? 'active' : ''}`}>
            <i className="bi bi-house mobile-bottom-nav-icon"></i>
            <span>Home</span>
          </Link>
          
          <Link to="/week/1" className={`mobile-bottom-nav-item ${location.pathname.startsWith('/week') ? 'active' : ''}`}>
            <i className="bi bi-calendar-week mobile-bottom-nav-icon"></i>
            <span>Workouts</span>
          </Link>
          
          <Link to="/help" className={`mobile-bottom-nav-item ${isActive('/help') ? 'active' : ''}`}>
            <i className="bi bi-question-circle mobile-bottom-nav-icon"></i>
            <span>Help</span>
          </Link>
          
          <Link to="/settings" className={`mobile-bottom-nav-item ${isActive('/settings') ? 'active' : ''}`}>
            <i className="bi bi-gear mobile-bottom-nav-icon"></i>
            <span>Settings</span>
          </Link>
        </div>
      )}
    </>
  );
}

export default Navigation;