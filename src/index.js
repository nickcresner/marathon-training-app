import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import configService from './services/configService';

// Log the current environment
configService.logDebug('Starting application in', configService.env, 'environment');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Configure analytics based on environment
if (configService.isFeatureEnabled('enableAnalytics')) {
  console.log('Analytics enabled for production environment');
  // Initialize analytics here
  reportWebVitals(console.log);
} else {
  // In non-production environments, just log to console if debugging is enabled
  if (configService.isFeatureEnabled('enableDebugLogging')) {
    reportWebVitals(console.log);
  } else {
    reportWebVitals();
  }
}
