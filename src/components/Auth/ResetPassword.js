// src/components/Auth/ResetPassword.js
import React, { useState } from 'react';
import { resetPassword } from '../../services/firebaseService';

function ResetPassword({ onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    // Validate email
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await resetPassword(email);
      setSuccess(true);
      setEmail(''); // Clear the form
    } catch (error) {
      console.error("Reset password error:", error);
      
      // Provide user-friendly error messages
      if (error.code === 'auth/user-not-found') {
        setError("No account found with this email address");
      } else if (error.code === 'auth/invalid-email') {
        setError("Please enter a valid email address");
      } else if (error.code === 'auth/too-many-requests') {
        setError("Too many requests. Please try again later");
      } else if (error.code === 'auth/network-request-failed') {
        setError("Network error. Please check your internet connection");
      } else {
        setError(`Failed to send reset email: ${error.message || "Unknown error"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header bg-primary text-white">
        <h3 className="mb-0">Reset Password</h3>
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
        
        {success && (
          <div className="alert alert-success" role="alert">
            <p>Password reset email sent! Please check your inbox.</p>
            <p className="mb-0">If you don't see it, please check your spam folder.</p>
          </div>
        )}
        
        {!success ? (
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
                placeholder="Enter your registered email"
              />
              <div className="form-text">
                We'll send a password reset link to this email
              </div>
            </div>
            
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <button
            className="btn btn-success w-100"
            onClick={onSwitchToLogin}
          >
            Return to Login
          </button>
        )}
        
        <div className="mt-3 text-center">
          <p>
            <button className="btn btn-link p-0" onClick={onSwitchToLogin}>
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;