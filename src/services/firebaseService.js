// src/services/firebaseService.js
import { db, auth } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut 
} from 'firebase/auth';
import Papa from 'papaparse';

// Firebase collections
const COLLECTIONS = {
  USERS: 'users',
  EXERCISE_HISTORY: 'exerciseHistory',
  SETTINGS: 'settings',
  WORKOUT_DATA: 'workoutData'
};

// Authentication functions
export const registerUser = async (email, password) => {
  try {
    console.log("Attempting Firebase registration with:", email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Firebase registration successful:", userCredential);
    return userCredential.user;
  } catch (error) {
    console.error("Firebase registration error:", error);
    // Preserve the error code for better error handling
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    console.log("Attempting Firebase login with:", email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Firebase login successful:", userCredential);
    return userCredential.user;
  } catch (error) {
    console.error("Firebase login error:", error);
    // Preserve the error code for better error handling
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

export const resetPassword = async (email) => {
  try {
    console.log("Sending password reset email to:", email);
    await sendPasswordResetEmail(auth, email);
    console.log("Password reset email sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

// User data functions
export const saveUserSettings = async (userId, settings) => {
  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      await updateDoc(userDocRef, { settings });
    } else {
      await setDoc(userDocRef, { settings });
    }
    
    return true;
  } catch (error) {
    console.error("Error saving user settings:", error);
    throw error;
  }
};

export const getUserSettings = async (userId) => {
  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data().settings || {};
    }
    
    return {};
  } catch (error) {
    console.error("Error getting user settings:", error);
    throw error;
  }
};

// Exercise history functions
export const saveExerciseHistory = async (userId, exerciseId, historyData) => {
  try {
    const historyDocRef = doc(db, COLLECTIONS.EXERCISE_HISTORY, `${userId}_${exerciseId}`);
    const historyDoc = await getDoc(historyDocRef);
    
    if (historyDoc.exists()) {
      await updateDoc(historyDocRef, { entries: historyData });
    } else {
      await setDoc(historyDocRef, { 
        userId, 
        exerciseId, 
        entries: historyData 
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error saving exercise history:", error);
    throw error;
  }
};

export const getExerciseHistory = async (userId, exerciseId) => {
  try {
    const historyDocRef = doc(db, COLLECTIONS.EXERCISE_HISTORY, `${userId}_${exerciseId}`);
    const historyDoc = await getDoc(historyDocRef);
    
    if (historyDoc.exists()) {
      return historyDoc.data().entries || [];
    }
    
    return [];
  } catch (error) {
    console.error("Error getting exercise history:", error);
    throw error;
  }
};

// Google Sheet integration
export const saveGoogleSheetUrl = async (userId, sheetUrl, sheetName) => {
  try {
    const settingsDocRef = doc(db, COLLECTIONS.SETTINGS, userId);
    const settingsDoc = await getDoc(settingsDocRef);
    
    const sheetData = {
      url: sheetUrl,
      name: sheetName || 'My Training Plan',
      lastUpdated: new Date().toISOString()
    };
    
    if (settingsDoc.exists()) {
      await updateDoc(settingsDocRef, { googleSheet: sheetData });
    } else {
      await setDoc(settingsDocRef, { googleSheet: sheetData });
    }
    
    return true;
  } catch (error) {
    console.error("Error saving Google Sheet URL:", error);
    throw error;
  }
};

export const getGoogleSheetSettings = async (userId) => {
  try {
    const settingsDocRef = doc(db, COLLECTIONS.SETTINGS, userId);
    const settingsDoc = await getDoc(settingsDocRef);
    
    if (settingsDoc.exists() && settingsDoc.data().googleSheet) {
      return settingsDoc.data().googleSheet;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting Google Sheet settings:", error);
    throw error;
  }
};

// Function to parse CSV data from Google Sheets via a proxy API
export const fetchGoogleSheetData = async (sheetUrl, sheetId) => {
  try {
    // Note: In a real implementation, you would need a proxy server or Firebase Cloud Function
    // to handle CORS and fetch data from Google Sheets
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(sheetUrl)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const csvData = await response.text();
    
    // Parse CSV data
    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error("Error fetching Google Sheet data:", error);
    throw error;
  }
};

// Function to save processed workout data to Firestore
export const saveWorkoutData = async (userId, phaseId, workouts) => {
  try {
    const workoutDocRef = doc(db, COLLECTIONS.WORKOUT_DATA, `${userId}_${phaseId}`);
    
    await setDoc(workoutDocRef, {
      userId,
      phaseId,
      workouts,
      lastUpdated: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error("Error saving workout data:", error);
    throw error;
  }
};

// Function to get processed workout data from Firestore
export const getWorkoutData = async (userId, phaseId) => {
  try {
    const workoutDocRef = doc(db, COLLECTIONS.WORKOUT_DATA, `${userId}_${phaseId}`);
    const workoutDoc = await getDoc(workoutDocRef);
    
    if (workoutDoc.exists()) {
      return workoutDoc.data().workouts || [];
    }
    
    return [];
  } catch (error) {
    console.error("Error getting workout data:", error);
    throw error;
  }
};