// src/components/Help/GoogleSheetHelp.js
import React, { useState } from 'react';

function GoogleSheetHelp() {
  const [activeStep, setActiveStep] = useState(1);
  
  const steps = [
    {
      title: "Create a Google Sheet",
      content: (
        <>
          <p>Start by creating a Google Sheet for your marathon training plan. You can:</p>
          <ul>
            <li>Create a new Google Sheet from scratch</li>
            <li>Use a template (recommended for beginners)</li>
            <li>Import an existing spreadsheet file</li>
          </ul>
          <p>
            <a 
              href="https://docs.google.com/spreadsheets/create" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-outline-primary btn-sm"
            >
              Create New Google Sheet
            </a>
          </p>
        </>
      )
    },
    {
      title: "Format Your Workout Data",
      content: (
        <>
          <p>Your Google Sheet should be formatted as follows:</p>
          <ul>
            <li>Each training phase (Base, Build, Peak, Taper) should be in a separate tab/sheet</li>
            <li>Workouts should start with <strong>Day X</strong> (e.g., "Day 1", "Day 2")</li>
            <li>Include a description of the workout in the next column</li>
            <li>List exercises below each workout day</li>
            <li>Include sets, reps, tempo, load, rest and notes for each exercise</li>
            <li>Add YouTube links to exercise demonstration videos in the notes column</li>
          </ul>
          <p>Here's an example format:</p>
          <div className="table-responsive">
            <table className="table table-sm table-bordered">
              <thead className="table-light">
                <tr>
                  <th>A</th>
                  <th>B</th>
                  <th>C</th>
                  <th>D</th>
                  <th>E</th>
                  <th>F</th>
                  <th>G</th>
                </tr>
              </thead>
              <tbody>
                <tr className="table-primary">
                  <td>Day 1</td>
                  <td>Upper Body Focus</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr>
                  <td>A1</td>
                  <td>Push Up</td>
                  <td>3</td>
                  <td>10-12</td>
                  <td>2-0-1</td>
                  <td>Bodyweight</td>
                  <td>https://youtube.com/...</td>
                </tr>
                <tr>
                  <td>A2</td>
                  <td>Band Pull Apart</td>
                  <td>3</td>
                  <td>15</td>
                  <td>2-1-2</td>
                  <td>Band</td>
                  <td>https://youtube.com/...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )
    },
    {
      title: "Publish Your Google Sheet",
      content: (
        <>
          <p>To make your Google Sheet accessible to the app:</p>
          <ol>
            <li>Open your Google Sheet</li>
            <li>Click on <strong>File</strong> in the menu</li>
            <li>Select <strong>Share</strong> and then <strong>Publish to the web</strong></li>
            <li>In the "Link" tab, set the following options:
              <ul>
                <li>First dropdown: "Entire Document"</li>
                <li>Second dropdown: "Web page"</li>
              </ul>
            </li>
            <li>Click the <strong>Publish</strong> button</li>
            <li>Click "OK" in the confirmation dialog</li>
            <li>Copy the published URL that appears</li>
          </ol>
          <div className="alert alert-warning">
            <strong>Important:</strong> Publishing your sheet makes it publicly accessible. Don't include personal information in your sheet.
          </div>
        </>
      )
    },
    {
      title: "Link Your Google Sheet",
      content: (
        <>
          <p>Now connect your published Google Sheet to the app:</p>
          <ol>
            <li>Go to <strong>Settings</strong> in this app</li>
            <li>Select the <strong>Google Sheet</strong> tab</li>
            <li>Enter a name for your training plan</li>
            <li>Paste the published URL from the previous step</li>
            <li>Click <strong>Save Settings</strong></li>
          </ol>
          <p>Once saved, the app will use your Google Sheet data to populate your training plan.</p>
          <div className="alert alert-info">
            <strong>Tip:</strong> If you update your Google Sheet, those changes will be reflected in the app the next time you load it. You don't need to update the URL again.
          </div>
        </>
      )
    }
  ];
  
  return (
    <div className="card">
      <div className="card-header bg-primary text-white">
        <h4 className="mb-0">Google Sheet Setup Guide</h4>
      </div>
      <div className="card-body">
        <div className="mb-4">
          <p>
            This app allows you to connect your own Google Sheet to provide personalized workout data. 
            Follow this step-by-step guide to set up your training plan.
          </p>
        </div>
        
        {/* Progress */}
        <div className="progress mb-4">
          <div 
            className="progress-bar" 
            role="progressbar" 
            style={{ width: `${(activeStep / steps.length) * 100}%` }}
            aria-valuenow={activeStep} 
            aria-valuemin="0" 
            aria-valuemax={steps.length}
          >
            Step {activeStep} of {steps.length}
          </div>
        </div>
        
        {/* Step Tabs */}
        <ul className="nav nav-tabs mb-3">
          {steps.map((step, index) => (
            <li className="nav-item" key={index}>
              <button 
                className={`nav-link ${activeStep === index + 1 ? 'active' : ''}`}
                onClick={() => setActiveStep(index + 1)}
              >
                Step {index + 1}
              </button>
            </li>
          ))}
        </ul>
        
        {/* Step Content */}
        <div className="step-content p-3">
          <h5>{steps[activeStep - 1].title}</h5>
          {steps[activeStep - 1].content}
        </div>
        
        {/* Navigation Buttons */}
        <div className="d-flex justify-content-between mt-4">
          <button 
            className="btn btn-outline-secondary" 
            onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
            disabled={activeStep === 1}
          >
            Previous
          </button>
          
          <button 
            className="btn btn-primary" 
            onClick={() => setActiveStep(Math.min(steps.length, activeStep + 1))}
            disabled={activeStep === steps.length}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default GoogleSheetHelp;