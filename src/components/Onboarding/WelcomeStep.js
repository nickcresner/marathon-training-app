// src/components/Onboarding/WelcomeStep.js
import React from 'react';

function WelcomeStep({ nextStep, user }) {
  return (
    <div className="text-center">
      <h2 className="mb-4">Welcome to Your Marathon Training App!</h2>
      
      <div className="mb-4">
        <img 
          src="/images/welcome-runner.png" 
          alt="Runner" 
          className="img-fluid rounded mb-3"
          style={{ maxHeight: '200px' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/400x200?text=Marathon+Training';
          }}
        />
      </div>
      
      <p className="lead mb-4">
        Hi {user?.email?.split('@')[0] || 'there'}! Let's set up your personalized training plan in just a few easy steps.
      </p>
      
      <div className="alert alert-info mb-4">
        <h5 className="alert-heading">Here's what we'll do:</h5>
        <ol className="mb-0 text-start">
          <li>Connect your Google Sheet with your workout data</li>
          <li>Import your training schedule</li>
          <li>Start tracking your progress!</li>
        </ol>
      </div>
      
      <p className="mb-4">
        Already have your own workout spreadsheet? Great! We'll help you connect it.
        <br />
        Don't have one yet? No problem! We'll provide a template to get you started.
      </p>
      
      <button className="btn btn-primary btn-lg" onClick={nextStep}>
        Let's Get Started
      </button>
    </div>
  );
}

export default WelcomeStep;