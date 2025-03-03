// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWH7oMh6VMXT1Powtp5bgofNsX6LwdRJQ",
  authDomain: "marathon-training-app-15f96.firebaseapp.com",
  projectId: "marathon-training-app-15f96",
  storageBucket: "marathon-training-app-15f96.appspot.com",
  messagingSenderId: "43452731757",
  appId: "1:43452731757:web:b804db5a666e3c28434a64",
  measurementId: "G-6XLJV2C1D5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };