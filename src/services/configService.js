// src/services/configService.js
import { environment } from '../firebase';

/**
 * Configuration service for managing environment-specific settings
 */
class ConfigService {
  constructor() {
    this.env = environment;
    this.isDevelopment = this.env === 'development';
    this.isTest = this.env === 'test';
    this.isProduction = this.env === 'production';
    
    // Feature flags
    this.features = {
      enableDebugLogging: this.isDevelopment || this.isTest,
      useMockData: this.isDevelopment,
      enableAnalytics: this.isProduction,
    };
    
    // API endpoints
    this.apiEndpoints = {
      development: 'http://localhost:8080/api',
      test: 'https://test-api.marathon-training-app.com',
      production: 'https://api.marathon-training-app.com',
    };
  }
  
  /**
   * Get the current API endpoint based on environment
   */
  getApiEndpoint() {
    return this.apiEndpoints[this.env];
  }
  
  /**
   * Log a debug message only in non-production environments
   */
  logDebug(...args) {
    if (this.features.enableDebugLogging) {
      console.log(`[${this.env.toUpperCase()}]`, ...args);
    }
  }
  
  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(featureName) {
    return this.features[featureName] === true;
  }
}

// Create a singleton instance
const configService = new ConfigService();

export default configService;