// src/components/Onboarding/SuccessStep.js
import React from 'react';

function SuccessStep({ onFinish }) {
  return (
    <div className="text-center">
      <div className="mb-4">
        <span className="display-1 text-success">
          <i className="bi bi-check-circle-fill"></i>
          ✓
        </span>
      </div>
      
      <h2 className="mb-4">Setup Complete!</h2>
      
      <p className="lead mb-4">
        Your training plan is ready to use. You can now start tracking your workouts and progress.
      </p>
      
      <div className="alert alert-info mb-4">
        <h5 className="alert-heading">What's next?</h5>
        <ul className="mb-0 text-start">
          <li>Browse your training plan by week</li>
          <li>View workout details and exercise instructions</li>
          <li>Watch demonstration videos for proper technique</li>
          <li>Track your progress for each exercise</li>
        </ul>
      </div>
      
      <p className="mb-4">
        You can always update your Google Sheet settings from the Settings page if needed.
      </p>
      
      <button className="btn btn-success btn-lg" onClick={onFinish}>
        Start Training
      </button>
    </div>
  );
}

export default SuccessStep;