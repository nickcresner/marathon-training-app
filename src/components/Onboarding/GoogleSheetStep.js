// src/components/Onboarding/GoogleSheetStep.js
import React, { useState } from 'react';

function GoogleSheetStep({ prevStep, nextStep, sheetData, onChange, loading, existingSettings }) {
  const [error, setError] = useState(null);
  const [useTemplate, setUseTemplate] = useState(false);
  
  const TEMPLATE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1QtyPEKBS8Qfzzjp16kbSuZs0Cv4HjNgxlYObaLkYRJU/edit?usp=sharing';
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...sheetData, [name]: value });
  };
  
  const handleUseTemplateToggle = () => {
    if (!useTemplate) {
      // If switching to template, update the URL
      onChange({ ...sheetData, url: TEMPLATE_SHEET_URL });
    }
    setUseTemplate(!useTemplate);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate the URL
    if (!sheetData.url) {
      setError("Please enter a Google Sheet URL");
      return;
    }
    
    // Simple validation to ensure it's a Google Sheets URL
    if (!sheetData.url.includes('docs.google.com/spreadsheets')) {
      setError("Please enter a valid Google Sheets URL");
      return;
    }
    
    nextStep();
  };
  
  const createCopy = () => {
    window.open(TEMPLATE_SHEET_URL, '_blank');
  };
  
  return (
    <div>
      <h2 className="mb-4 text-center">Connect Your Training Data</h2>
      
      {error && (
        <div className="alert alert-danger mb-4">
          {error}
        </div>
      )}
      
      {existingSettings && (
        <div className="alert alert-info mb-4">
          <h5>You already have a connected sheet:</h5>
          <p className="mb-0"><strong>{existingSettings.name}</strong></p>
          <p className="mb-1 small text-truncate">{existingSettings.url}</p>
          <p className="small text-muted mb-0">
            Last updated: {new Date(existingSettings.lastUpdated).toLocaleString()}
          </p>
        </div>
      )}
      
      <div className="mb-4">
        <div className="form-check form-switch mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="useTemplateSwitch"
            checked={useTemplate}
            onChange={handleUseTemplateToggle}
          />
          <label className="form-check-label" htmlFor="useTemplateSwitch">
            Use our template spreadsheet
          </label>
        </div>
        
        {useTemplate ? (
          <div className="alert alert-success">
            <h5>Perfect! We'll use our template.</h5>
            <p>
              The template contains pre-configured workout plans for base, build and peak phases of marathon training.
              You can customize it after making a copy to your Google Drive.
            </p>
            <button 
              className="btn btn-outline-success"
              onClick={createCopy}
            >
              Make a copy of the template
            </button>
          </div>
        ) : (
          <div className="alert alert-light border">
            <h5>Using your own spreadsheet?</h5>
            <p>Your sheet should be structured with:</p>
            <ul>
              <li>Different tabs for training phases</li>
              <li>Day headers (Day 1, Day 2, etc.)</li>
              <li>Exercise details below each day</li>
            </ul>
            <button 
              className="btn btn-sm btn-outline-primary"
              onClick={() => setUseTemplate(true)}
            >
              Actually, I'll use the template instead
            </button>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Training Plan Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={sheetData.name}
            onChange={handleInputChange}
            placeholder="My Marathon Plan"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="url" className="form-label">Google Sheet URL</label>
          <input
            type="text"
            className="form-control"
            id="url"
            name="url"
            value={sheetData.url}
            onChange={handleInputChange}
            placeholder="https://docs.google.com/spreadsheets/d/..."
            required
          />
          <div className="form-text">
            Make sure your sheet is <strong>published to the web</strong> (File → Share → Publish to web).
          </div>
        </div>
        
        <div className="alert alert-warning mb-4">
          <h5 className="alert-heading">Important!</h5>
          <ol className="mb-0">
            <li>Your Google Sheet must be <strong>published to the web</strong></li>
            <li>Go to <strong>File → Share → Publish to web</strong></li>
            <li>Select "Entire Document" and "Comma-separated values (.csv)"</li>
            <li>Click "Publish" and copy the link</li>
          </ol>
        </div>
        
        <div className="d-flex justify-content-between">
          <button 
            type="button"
            className="btn btn-outline-secondary"
            onClick={prevStep}
          >
            Back
          </button>
          
          <button 
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Connecting...' : 'Connect and Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default GoogleSheetStep;