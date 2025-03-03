// src/components/Auth/AuthContainer.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import ResetPassword from './ResetPassword';
import { getCurrentUser } from '../../services/firebaseService';

function AuthContainer({ onAuthSuccess }) {
  const navigate = useNavigate();
  console.log("AuthContainer rendered");
  const [authView, setAuthView] = useState('login'); // 'login', 'register', or 'resetPassword'
  const [justResetPassword, setJustResetPassword] = useState(false);
  
  // Check if user is already logged in
  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          console.log("User already logged in, redirecting to home");
          onAuthSuccess(currentUser);
          navigate('/');
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
      }
    }
    
    checkAuth();
  }, [navigate, onAuthSuccess]);
  
  // Handle authentication success
  const handleAuthSuccess = (user) => {
    console.log("Auth success in container, passing to parent");
    onAuthSuccess(user);
    navigate('/');
  };
  
  const handleSwitchToRegister = () => {
    setAuthView('register');
    setJustResetPassword(false);
  };
  
  const handleSwitchToLogin = (fromReset = false) => {
    setAuthView('login');
    setJustResetPassword(fromReset);
  };
  
  const handleSwitchToResetPassword = () => {
    setAuthView('resetPassword');
  };
  
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          {authView === 'login' && (
            <Login 
              onLogin={handleAuthSuccess} 
              onSwitchToRegister={handleSwitchToRegister}
              onSwitchToResetPassword={handleSwitchToResetPassword}
              justResetPassword={justResetPassword}
            />
          )}
          
          {authView === 'register' && (
            <Register 
              onRegister={handleAuthSuccess} 
              onSwitchToLogin={() => handleSwitchToLogin(false)} 
            />
          )}
          
          {authView === 'resetPassword' && (
            <ResetPassword
              onSwitchToLogin={() => handleSwitchToLogin(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthContainer;