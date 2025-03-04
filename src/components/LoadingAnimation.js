// src/components/LoadingAnimation.js
import React, { useState, useEffect } from 'react';
import './LoadingAnimation.css';

function LoadingAnimation() {
  const [loadingText, setLoadingText] = useState('Loading your workout data');
  const [dots, setDots] = useState('');

  // Create animated ellipsis effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  // Update loading text with dots
  useEffect(() => {
    setLoadingText(`Loading your workout data${dots}`);
  }, [dots]);

  return (
    <div className="loading-container">
      <div className="logo-container">
        <img 
          src={`${process.env.PUBLIC_URL}/images/logos/alzheimersheroeslogo.png`}
          alt="Alzheimer's Heroes" 
          className="alzheimers-logo"
        />
      </div>
      
      <div className="spinner"></div>
      
      <div className="loading-text">{loadingText}</div>
      
    </div>
  );
}

export default LoadingAnimation;