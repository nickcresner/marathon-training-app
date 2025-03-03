// src/components/Help/HelpCenter.js
import React, { useState } from 'react';
import GoogleSheetHelp from './GoogleSheetHelp';

function HelpCenter() {
  const [activeTab, setActiveTab] = useState('googlesheet');
  
  return (
    <div className="container mt-4">
      <h2 className="mb-4">Help Center</h2>
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'googlesheet' ? 'active' : ''}`}
            onClick={() => setActiveTab('googlesheet')}
          >
            Google Sheet Setup
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'app' ? 'active' : ''}`}
            onClick={() => setActiveTab('app')}
          >
            App Usage
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'faq' ? 'active' : ''}`}
            onClick={() => setActiveTab('faq')}
          >
            FAQ
          </button>
        </li>
      </ul>
      
      {activeTab === 'googlesheet' && <GoogleSheetHelp />}
      
      {activeTab === 'app' && (
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0">App Usage Guide</h4>
          </div>
          <div className="card-body">
            <h5>Navigating the App</h5>
            <ul>
              <li><strong>Training Phases:</strong> Select your training phase (Base, Build, Peak, Taper) from the top of the main page.</li>
              <li><strong>Week Blocks:</strong> Choose a training block to view all weeks in that block.</li>
              <li><strong>Weeks:</strong> Select a specific week to view workouts for that week.</li>
              <li><strong>Workouts:</strong> Click on a workout to see the exercises for that day.</li>
              <li><strong>Exercises:</strong> Click on an exercise name to view details and demonstration videos.</li>
            </ul>
            
            <h5>Tracking Your Progress</h5>
            <ul>
              <li><strong>Marking Workouts as Complete:</strong> Use the "Mark as Complete" button on the workout detail page.</li>
              <li><strong>Exercise History:</strong> Record your sets, reps, weights, and notes for each exercise.</li>
              <li><strong>View History:</strong> Check your past performance in the history section of each exercise.</li>
            </ul>
            
            <h5>Settings and Customization</h5>
            <ul>
              <li><strong>Google Sheet:</strong> Connect your own training plan with the Google Sheet settings.</li>
              <li><strong>Account:</strong> Manage your account information.</li>
              <li><strong>Appearance:</strong> Customize the app's appearance (coming soon).</li>
            </ul>
          </div>
        </div>
      )}
      
      {activeTab === 'faq' && (
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0">Frequently Asked Questions</h4>
          </div>
          <div className="card-body">
            <div className="accordion" id="faqAccordion">
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingOne">
                  <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                    Do I need to create a Google Sheet?
                  </button>
                </h2>
                <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#faqAccordion">
                  <div className="accordion-body">
                    <p>No, it's optional. The app comes with built-in test data, but for a personalized experience, you can connect your own Google Sheet with your training plan.</p>
                  </div>
                </div>
              </div>
              
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingTwo">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                    How do I add exercise videos?
                  </button>
                </h2>
                <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#faqAccordion">
                  <div className="accordion-body">
                    <p>Add YouTube URLs to the notes column in your Google Sheet for each exercise. The app will automatically detect and display these videos on the exercise detail page.</p>
                  </div>
                </div>
              </div>
              
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingThree">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                    Is my workout data private?
                  </button>
                </h2>
                <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#faqAccordion">
                  <div className="accordion-body">
                    <p>Your exercise history is stored in your browser (localStorage) by default. If you're logged in, it's securely stored in your personal Firebase account. Your Google Sheet needs to be publicly accessible, so don't include personal information in it.</p>
                  </div>
                </div>
              </div>
              
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingFour">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour">
                    How do I format a superset in my spreadsheet?
                  </button>
                </h2>
                <div id="collapseFour" className="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#faqAccordion">
                  <div className="accordion-body">
                    <p>Use letters followed by numbers (e.g., A1, A2, B1, B2) in the first column to group exercises into supersets. All exercises with the same letter (A, B, etc.) will be displayed as a superset in the app.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HelpCenter;