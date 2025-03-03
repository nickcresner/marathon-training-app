// src/components/Settings/UserSettings.js
import React, { useState, useEffect } from 'react';
import { getCurrentUser, getUserSettings, saveUserSettings } from '../../services/firebaseService';
import GoogleSheetSettings from './GoogleSheetSettings';

function UserSettings() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({});
  const [activeTab, setActiveTab] = useState('googlesheet');
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function loadUserData() {
      try {
        // Get current user
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          setError("You must be logged in to access settings");
          setIsLoading(false);
          return;
        }
        
        setUser(currentUser);
        
        // Get user settings
        const userSettings = await getUserSettings(currentUser.uid);
        setSettings(userSettings);
      } catch (error) {
        console.error("Error loading user data:", error);
        setError("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadUserData();
  }, []);
  
  const handleSettingsUpdate = async (newSettings) => {
    try {
      if (!user) return;
      
      await saveUserSettings(user.uid, {
        ...settings,
        ...newSettings
      });
      
      setSettings({
        ...settings,
        ...newSettings
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      setError("Failed to save settings");
    }
  };
  
  if (isLoading) {
    return <div className="text-center py-5">Loading your settings...</div>;
  }
  
  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="alert alert-warning" role="alert">
        Please log in to access your settings.
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="mb-4">Settings</h2>
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'googlesheet' ? 'active' : ''}`}
            onClick={() => setActiveTab('googlesheet')}
          >
            Google Sheet
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            Account
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            Appearance
          </button>
        </li>
      </ul>
      
      {activeTab === 'googlesheet' && (
        <GoogleSheetSettings 
          userId={user.uid}
          onUpdateComplete={() => {}}
        />
      )}
      
      {activeTab === 'account' && (
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0">Account Settings</h4>
          </div>
          <div className="card-body">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Account created:</strong> {user.metadata.creationTime}</p>
            <p><strong>Last sign in:</strong> {user.metadata.lastSignInTime}</p>
          </div>
        </div>
      )}
      
      {activeTab === 'appearance' && (
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0">Appearance Settings</h4>
          </div>
          <div className="card-body">
            <p>Appearance settings coming soon!</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserSettings;