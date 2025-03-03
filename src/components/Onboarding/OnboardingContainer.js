// src/components/Onboarding/OnboardingContainer.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeStep from './WelcomeStep';
import GoogleSheetStep from './GoogleSheetStep';
import DataImportStep from './DataImportStep';
import SuccessStep from './SuccessStep';
import { getGoogleSheetSettings, saveGoogleSheetUrl } from '../../services/firebaseService';

function OnboardingContainer({ user }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [existingSettings, setExistingSettings] = useState(null);
  const [sheetData, setSheetData] = useState({
    url: '',
    name: 'My Training Plan'
  });
  const navigate = useNavigate();
  
  // Check if user already has settings
  useEffect(() => {
    async function checkSettings() {
      if (!user) return;
      
      try {
        setLoading(true);
        const settings = await getGoogleSheetSettings(user.uid);
        setExistingSettings(settings);
        
        if (settings) {
          setSheetData({
            url: settings.url || '',
            name: settings.name || 'My Training Plan'
          });
        }
      } catch (error) {
        console.error("Error checking settings:", error);
      } finally {
        setLoading(false);
      }
    }
    
    checkSettings();
  }, [user]);
  
  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  const handleSheetDataChange = (data) => {
    setSheetData(data);
  };
  
  const handleSheetSave = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      await saveGoogleSheetUrl(user.uid, sheetData.url, sheetData.name);
      nextStep();
    } catch (error) {
      console.error("Error saving Google Sheet URL:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFinish = () => {
    navigate('/');
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep nextStep={nextStep} user={user} />;
      case 2:
        return (
          <GoogleSheetStep 
            prevStep={prevStep} 
            nextStep={handleSheetSave}
            sheetData={sheetData}
            onChange={handleSheetDataChange}
            loading={loading}
            existingSettings={existingSettings}
          />
        );
      case 3:
        return <DataImportStep prevStep={prevStep} nextStep={nextStep} sheetData={sheetData} />;
      case 4:
        return <SuccessStep onFinish={handleFinish} />;
      default:
        return <WelcomeStep nextStep={nextStep} user={user} />;
    }
  };
  
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Set Up Your Training Plan</h3>
              <div className="progress mt-2" style={{ height: '8px' }}>
                <div 
                  className="progress-bar" 
                  role="progressbar"
                  style={{ width: `${currentStep * 25}%` }}
                  aria-valuenow={currentStep * 25}
                  aria-valuemin="0" 
                  aria-valuemax="100"
                >
                </div>
              </div>
            </div>
            <div className="card-body p-4">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading your information...</p>
                </div>
              ) : (
                renderStep()
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingContainer;