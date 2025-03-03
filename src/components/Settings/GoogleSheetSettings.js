// src/components/Settings/GoogleSheetSettings.js
import React, { useState, useEffect } from 'react';
import { 
  saveGoogleSheetUrl, 
  getGoogleSheetSettings 
} from '../../services/firebaseService';

function GoogleSheetSettings({ userId, onUpdateComplete }) {
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('My Training Plan');
  const [currentSettings, setCurrentSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Load existing settings on component mount
  useEffect(() => {
    async function loadSettings() {
      if (!userId) return;
      
      try {
        const settings = await getGoogleSheetSettings(userId);
        setCurrentSettings(settings);
        
        if (settings) {
          setSheetUrl(settings.url || '');
          setSheetName(settings.name || 'My Training Plan');
        }
      } catch (error) {
        console.error("Error loading Google Sheet settings:", error);
        setError("Failed to load your Google Sheet settings. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadSettings();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSaving(true);
    
    try {
      // Validate URL format
      if (!isValidUrl(sheetUrl)) {
        setError("Please enter a valid Google Sheets URL");
        setIsSaving(false);
        return;
      }
      
      // Save the settings
      await saveGoogleSheetUrl(userId, sheetUrl, sheetName);
      
      // Update the current settings state
      setCurrentSettings({
        url: sheetUrl,
        name: sheetName,
        lastUpdated: new Date().toISOString()
      });
      
      setSuccessMessage("Google Sheet settings saved successfully!");
      
      // Notify parent component
      if (onUpdateComplete) {
        onUpdateComplete();
      }
    } catch (error) {
      console.error("Error saving Google Sheet settings:", error);
      setError("Failed to save your Google Sheet settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to validate URL format
  const isValidUrl = (urlString) => {
    try {
      const url = new URL(urlString);
      return url.hostname.includes('google.com') || url.hostname.includes('docs.google.com');
    } catch (e) {
      return false;
    }
  };

  // Display loading state
  if (isLoading) {
    return <div className="text-center py-4">Loading your settings...</div>;
  }

  return (
    <div className="card mb-4">
      <div className="card-header bg-primary text-white">
        <h4 className="mb-0">Google Sheet Settings</h4>
      </div>
      <div className="card-body">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="alert alert-success" role="alert">
            {successMessage}
          </div>
        )}
        
        {currentSettings && (
          <div className="alert alert-info mb-4">
            <h5>Current Google Sheet</h5>
            <p className="mb-0"><strong>Name:</strong> {currentSettings.name}</p>
            <p className="mb-0"><strong>URL:</strong> {currentSettings.url}</p>
            <p className="mb-0 text-muted">
              Last updated: {new Date(currentSettings.lastUpdated).toLocaleString()}
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="sheetName" className="form-label">Sheet Name</label>
            <input
              type="text"
              className="form-control"
              id="sheetName"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              required
            />
            <div className="form-text">
              A descriptive name for your training plan
            </div>
          </div>
          
          <div className="mb-3">
            <label htmlFor="sheetUrl" className="form-label">Google Sheet URL</label>
            <input
              type="url"
              className="form-control"
              id="sheetUrl"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              required
            />
            <div className="form-text">
              This must be a public Google Sheet URL. Make sure your Google Sheet is <strong>published to the web</strong>.
            </div>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
        
        <div className="mt-4">
          <h5>How to prepare your Google Sheet</h5>
          <ol className="small">
            <li>Create a Google Sheet with your workout plan</li>
            <li>Use separate tabs/sheets for each training phase (Base, Build, Peak, Taper)</li>
            <li>Format your workouts following the example template</li>
            <li>Go to File → Share → Publish to the web</li>
            <li>Select "Entire Document" and format as "Web page"</li>
            <li>Click "Publish" and copy the URL</li>
            <li>Paste the URL here and save</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default GoogleSheetSettings;