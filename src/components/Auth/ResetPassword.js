// src/components/Auth/ResetPassword.js
import React, { useState } from 'react';
import { resetPassword, getCurrentUser } from '../../services/firebaseService';

function ResetPassword({ onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already logged in
  React.useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          console.log("User already logged in during password reset");
          // Pre-fill email if we have a logged in user
          setEmail(currentUser.email || '');
        }
      } catch (error) {
        console.error("Error checking current user:", error);
      }
    };
    
    checkCurrentUser();
  }, []);

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
            <h5 className="alert-heading"><i className="bi bi-check-circle me-2"></i>Reset Email Sent!</h5>
            <p>Check your inbox for a password reset link. Follow these steps:</p>
            <ol className="mb-0">
              <li>Open the email from Pinnacle Marathon Training</li>
              <li>Click the reset link in the email</li>
              <li>Create a new password when prompted</li>
              <li>Return here to log in with your new password</li>
            </ol>
            <hr/>
            <p className="mb-0 small"><strong>Note:</strong> If you don't see the email, check your spam folder or request another reset.</p>
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
            onClick={() => {
              // Check if the user is already logged in before switching back
              (async () => {
                try {
                  const currentUser = await getCurrentUser();
                  if (currentUser) {
                    console.log("User already authenticated after reset, redirecting");
                    // This will redirect to home with the auth status updated
                    window.location.href = '/marathon-training-app/';
                    return;
                  }
                  onSwitchToLogin();
                } catch (err) {
                  console.error("Error when returning to login:", err);
                  onSwitchToLogin();
                }
              })();
            }}
          >
            Return to Login
          </button>
        )}
        
        {!success && (
          <div className="mt-3 text-center">
            <p>
              <button 
                className="btn btn-link p-0" 
                onClick={() => {
                  // Also check auth status when going back to login
                  (async () => {
                    try {
                      const currentUser = await getCurrentUser();
                      if (currentUser) {
                        console.log("User already authenticated, redirecting");
                        window.location.href = '/marathon-training-app/';
                        return;
                      }
                      onSwitchToLogin();
                    } catch (err) {
                      onSwitchToLogin();
                    }
                  })();
                }}
              >
                Back to Login
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;