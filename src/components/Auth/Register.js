// src/components/Auth/Register.js
import React, { useState } from 'react';
import { registerUser } from '../../services/firebaseService';

function Register({ onRegister, onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate email
    if (!email) {
      setError("Please enter an email address");
      return;
    }
    
    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    // Validate password strength
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Attempting registration with:", email);
      const user = await registerUser(email, password);
      console.log("Registration successful:", user);
      onRegister(user);
    } catch (error) {
      console.error("Registration error:", error);
      // Provide more user-friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        setError("This email is already in use. Please login instead.");
      } else if (error.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (error.code === 'auth/weak-password') {
        setError("Password is too weak. Please use at least 6 characters.");
      } else if (error.code === 'auth/network-request-failed') {
        setError("Network error. Please check your internet connection.");
      } else if (error.code === 'auth/configuration-not-found') {
        setError("Authentication service is not configured properly. Please contact support.");
      } else {
        setError(`Registration failed: ${error.message || "Unknown error"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header bg-primary text-white">
        <h3 className="mb-0">Register</h3>
      </div>
      <div className="card-body">
        <div className="text-center mb-4">
          <img 
            src="/marathon-training-app/images/logos/pinnaclelogo1.png" 
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
            <div className="form-text">Password must be at least 6 characters</div>
          </div>
          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div className="mt-3 text-center">
          <p>Already have an account? <button className="btn btn-link p-0" onClick={onSwitchToLogin}>Login</button></p>
        </div>
      </div>
    </div>
  );
}

export default Register;