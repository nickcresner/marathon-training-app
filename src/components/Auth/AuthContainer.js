// src/components/Auth/AuthContainer.js
import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import ResetPassword from './ResetPassword';

function AuthContainer({ onAuthSuccess }) {
  const [authView, setAuthView] = useState('login'); // 'login', 'register', or 'resetPassword'
  
  const handleSwitchToRegister = () => {
    setAuthView('register');
  };
  
  const handleSwitchToLogin = () => {
    setAuthView('login');
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
              onLogin={onAuthSuccess} 
              onSwitchToRegister={handleSwitchToRegister}
              onSwitchToResetPassword={handleSwitchToResetPassword}
            />
          )}
          
          {authView === 'register' && (
            <Register 
              onRegister={onAuthSuccess} 
              onSwitchToLogin={handleSwitchToLogin} 
            />
          )}
          
          {authView === 'resetPassword' && (
            <ResetPassword
              onSwitchToLogin={handleSwitchToLogin}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthContainer;