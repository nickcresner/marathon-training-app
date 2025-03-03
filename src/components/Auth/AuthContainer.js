// src/components/Auth/AuthContainer.js
import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

function AuthContainer({ onAuthSuccess }) {
  const [showLogin, setShowLogin] = useState(true);
  
  const handleSwitchToRegister = () => {
    setShowLogin(false);
  };
  
  const handleSwitchToLogin = () => {
    setShowLogin(true);
  };
  
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          {showLogin ? (
            <Login 
              onLogin={onAuthSuccess} 
              onSwitchToRegister={handleSwitchToRegister} 
            />
          ) : (
            <Register 
              onRegister={onAuthSuccess} 
              onSwitchToLogin={handleSwitchToLogin} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthContainer;