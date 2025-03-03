const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs } = require('firebase/firestore');

// Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCWH7oMh6VMXT1Powtp5bgofNsX6LwdRJQ",
    authDomain: "marathon-training-app-15f96.firebaseapp.com",
    projectId: "marathon-training-app-15f96",
    storageBucket: "marathon-training-app-15f96.firebasestorage.app",
    messagingSenderId: "43452731757",
    appId: "1:43452731757:web:b804db5a666e3c28434a64",
    measurementId: "G-6XLJV2C1D5"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirebase() {
  try {
    console.log("Adding test document...");
    const docRef = await addDoc(collection(db, "test"), {
      message: "Hello from test script",
      timestamp: new Date()
    });
    console.log("Document added with ID:", docRef.id);
    
    console.log("Reading documents...");
    const querySnapshot = await getDocs(collection(db, "test"));
    querySnapshot.forEach((doc) => {
      console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
    });
    
    console.log("Firebase connection successful!");
  } catch (error) {
    console.error("Error:", error);
  }
}

testFirebase();