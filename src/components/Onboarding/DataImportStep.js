// src/components/Onboarding/DataImportStep.js
import React, { useState, useEffect } from 'react';
import { fetchWorkouts, TRAINING_PHASES } from '../../data/workouts';

function DataImportStep({ prevStep, nextStep, sheetData }) {
  const [importStatus, setImportStatus] = useState({
    base: { status: 'pending', count: 0 },
    build: { status: 'pending', count: 0 },
    peak: { status: 'pending', count: 0 },
    taper: { status: 'pending', count: 0 }
  });
  const [currentPhase, setCurrentPhase] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState(null);
  
  // Automatically test import when component mounts
  useEffect(() => {
    testImport();
  }, []);
  
  const testImport = async () => {
    setIsImporting(true);
    setError(null);
    
    const phases = ['base', 'build', 'peak', 'taper'];
    let allSuccess = true;
    
    for (const phase of phases) {
      try {
        setCurrentPhase(phase);
        setImportStatus(prev => ({
          ...prev,
          [phase]: { ...prev[phase], status: 'importing' }
        }));
        
        // Fetch workouts for this phase
        const workouts = await fetchWorkouts(phase, sheetData.url);
        
        // Update status
        setImportStatus(prev => ({
          ...prev,
          [phase]: { 
            status: workouts.length > 0 ? 'success' : 'warning',
            count: workouts.length
          }
        }));
        
        if (workouts.length === 0) {
          allSuccess = false;
        }
      } catch (error) {
        console.error(`Error importing ${phase} phase:`, error);
        setImportStatus(prev => ({
          ...prev,
          [phase]: { ...prev[phase], status: 'error' }
        }));
        allSuccess = false;
      }
    }
    
    setCurrentPhase(null);
    setIsImporting(false);
    setIsComplete(true);
    
    if (!allSuccess) {
      setError("Some phases couldn't be imported properly. You can still continue, but please check your Google Sheet structure.");
    }
  };
  
  const getPhaseInfo = (phaseId) => {
    return TRAINING_PHASES.find(phase => phase.id === phaseId) || { name: phaseId };
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return <span className="badge bg-success">Success</span>;
      case 'warning':
        return <span className="badge bg-warning text-dark">No data</span>;
      case 'error':
        return <span className="badge bg-danger">Error</span>;
      case 'importing':
        return <span className="badge bg-primary">Importing...</span>;
      default:
        return <span className="badge bg-secondary">Pending</span>;
    }
  };
  
  return (
    <div>
      <h2 className="mb-4 text-center">Importing Your Data</h2>
      
      {error && (
        <div className="alert alert-warning mb-4">
          {error}
        </div>
      )}
      
      <div className="alert alert-info mb-4">
        <h5>Connected to:</h5>
        <p className="mb-0"><strong>{sheetData.name}</strong></p>
        <p className="mb-1 small text-truncate">{sheetData.url}</p>
      </div>
      
      <div className="mb-4">
        <h5 className="mb-3">Import Status:</h5>
        <div className="list-group">
          {Object.entries(importStatus).map(([phaseId, status]) => (
            <div key={phaseId} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>{getPhaseInfo(phaseId).name}</strong>
                {status.status === 'success' && (
                  <span className="ms-2 text-muted">
                    ({status.count} workouts)
                  </span>
                )}
              </div>
              <div>
                {currentPhase === phaseId ? (
                  <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : null}
                {getStatusBadge(status.status)}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {isImporting && (
        <div className="text-center mb-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Importing...</span>
          </div>
          <p className="mt-2">Testing connection to your Google Sheet...</p>
        </div>
      )}
      
      {isComplete && (
        <div className="alert alert-success mb-4">
          <h5 className="alert-heading">Import Complete!</h5>
          <p className="mb-0">
            Your training data has been connected successfully.
            {error ? " Some phases had issues, but you can still proceed." : ""}
          </p>
        </div>
      )}
      
      <div className="d-flex justify-content-between">
        <button 
          type="button"
          className="btn btn-outline-secondary"
          onClick={prevStep}
          disabled={isImporting}
        >
          Back
        </button>
        
        <button 
          type="button"
          className="btn btn-primary"
          onClick={nextStep}
          disabled={isImporting}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default DataImportStep;