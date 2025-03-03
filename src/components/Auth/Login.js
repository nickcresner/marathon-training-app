// src/components/Auth/Login.js
import React, { useState } from 'react';
import { loginUser } from '../../services/firebaseService';

function Login({ onLogin, onSwitchToRegister, onSwitchToResetPassword }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
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
      onLogin(user);
    } catch (error) {
      console.error("Login error:", error);
      // Provide more user-friendly error messages
      if (error.code === 'auth/user-not-found') {
        setError("No account exists with this email. Please register first.");
      } else if (error.code === 'auth/wrong-password') {
        setError("Incorrect password. Please try again.");
      } else if (error.code === 'auth/invalid-credential') {
        setError("Invalid login credentials. Please check your email and password.");
      } else if (error.code === 'auth/too-many-requests') {
        setError("Too many failed login attempts. Please try again later.");
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
            className="btn btn-primary w-100"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
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