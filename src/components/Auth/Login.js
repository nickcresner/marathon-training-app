// src/components/Auth/Login.js
import React, { useState } from 'react';
import { loginUser, getCurrentUser } from '../../services/firebaseService';

function Login({ onLogin, onSwitchToRegister, onSwitchToResetPassword, justResetPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Set success message if user just completed password reset
  React.useEffect(() => {
    if (justResetPassword) {
      setSuccessMessage("Password reset complete! Please log in with your new password.");
    } else {
      setSuccessMessage(null);
    }
  }, [justResetPassword]);
  
  // Also check for current user on mount
  React.useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          console.log("User already logged in in Login component");
          onLogin(currentUser);
        }
      } catch (error) {
        console.error("Error checking current user:", error);
      }
    };
    
    checkCurrentUser();
  }, [onLogin]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    // Validate inputs
    if (!email || !password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Attempting login with:", email);
      const user = await loginUser(email, password);
      console.log("Login successful:", user);
      
      // Add slight delay to ensure the user sees the loading state
      setTimeout(() => {
        onLogin(user);
      }, 500);
    } catch (error) {
      console.error("Login error:", error);
      // Provide more user-friendly error messages
      if (error.code === 'auth/user-not-found') {
        setError("No account exists with this email. Please register first.");
      } else if (error.code === 'auth/wrong-password') {
        // Special message for potentially recent password reset
        setError(
          <>
            <strong>Incorrect password.</strong> 
            {" "}If you recently reset your password, please make sure you're using your new password. 
            {" "}<button 
              className="btn btn-link p-0 text-decoration-underline"
              onClick={onSwitchToResetPassword}
            >
              Reset password again
            </button>
          </>
        );
      } else if (error.code === 'auth/invalid-credential') {
        setError(
          <>
            <strong>Invalid login credentials.</strong> 
            {" "}Please verify your email and password are correct. If you forgot your password, you can 
            {" "}<button 
              className="btn btn-link p-0 text-decoration-underline"
              onClick={onSwitchToResetPassword}
            >
              reset it here
            </button>
          </>
        );
      } else if (error.code === 'auth/too-many-requests') {
        setError("Too many failed login attempts. Please try again later or reset your password.");
      } else if (error.code === 'auth/configuration-not-found') {
        setError("Authentication service is not configured properly. Please contact support.");
      } else {
        setError(`Login failed: ${error.message || "Unknown error"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header bg-primary text-white">
        <h3 className="mb-0">Login</h3>
      </div>
      <div className="card-body">
        <div className="text-center mb-4">
          <img 
            src={`${process.env.PUBLIC_URL}/images/logos/pinnaclelogo1.png`}
            alt="Pinnacle Fitness & Health" 
            className="img-fluid" 
            style={{ maxWidth: '150px' }}
          />
        </div>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="alert alert-success" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>
            {successMessage}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="text-end mt-1">
              <button 
                type="button" 
                className="btn btn-link p-0 text-decoration-none small"
                onClick={onSwitchToResetPassword}
              >
                Forgot Password?
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100 position-relative"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Logging in...
              </>
            ) : 'Login'}
          </button>
        </form>
        <div className="mt-3 text-center">
          <p>Don't have an account? <button className="btn btn-link p-0" onClick={onSwitchToRegister}>Register</button></p>
        </div>
      </div>
    </div>
  );
}

export default Login;