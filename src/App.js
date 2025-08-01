import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import StudentPortal from './Components/StudentPortal';
import TeacherPortal from './Components/TeacherPortal'; // Corrected path
import './App.css';

// Manually define Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID, // Optional
};

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseInitError, setFirebaseInitError] = useState(null);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [needsRoleSelection, setNeedsRoleSelection] = useState(false); // New state for role selection

  // Define appId and userId here to be accessible in the render block
  const appId = (process.env.REACT_APP_APP_ID || 'local-dev-app-id').split('#')[0].trim();
  const userId = user?.uid || 'unknown-user-id'; // Use optional chaining for user.uid

  useEffect(() => {
    let app, firestore, authInstance;
    let unsubscribeAuth = () => {};
    let unsubscribeFirestore = () => {};

    try {
      if (!firebaseConfig.projectId || !firebaseConfig.apiKey) {
        setFirebaseInitError("Firebase 'projectId' or 'apiKey' not provided in your .env file. Please check your .env configuration.");
        setLoading(false);
        return;
      }

      app = initializeApp(firebaseConfig);
      firestore = getFirestore(app);
      authInstance = getAuth(app);

      setDb(firestore);
      setAuth(authInstance);

      signInAnonymously(authInstance)
        .then(() => console.log("Signed in anonymously for local development."))
        .catch(error => {
          console.error("Error signing in anonymously:", error);
          setFirebaseInitError(`Authentication failed: ${error.message}.`);
          setLoading(false);
        });

      unsubscribeAuth = onAuthStateChanged(authInstance, async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          console.log("Current Authenticated User ID:", currentUser.uid);

          const userDocRef = doc(firestore, `artifacts/${appId}/users/${currentUser.uid}`);

          unsubscribeFirestore = onSnapshot(userDocRef, (userDocSnap) => {
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              setUserRole(userData.role);
              setNeedsRoleSelection(false); // Role found, no selection needed
              console.log("User role fetched (real-time):", userData.role);
            } else {
              // User document not found, prompt for role selection
              console.warn("User document not found. Prompting for role selection.");
              setUserRole(null); // Clear role until selected
              setNeedsRoleSelection(true); // Show role selection UI
            }
            setLoading(false);
          }, (error) => {
            console.error("Error listening to user document:", error);
            setFirebaseInitError(`Error accessing user data: ${error.message}. Check Firestore rules.`);
            setLoading(false);
          });

        } else {
          setUser(null);
          setUserRole(null);
          setNeedsRoleSelection(false); // No user, no role selection needed
          setLoading(false);
          console.log("User signed out or no user.");
        }
      });

      return () => {
        unsubscribeAuth();
        unsubscribeFirestore();
      };
    } catch (error) {
      console.error("Firebase initialization failed during try-catch block:", error);
      setFirebaseInitError(`Firebase initialization failed: ${error.message}. Please check your .env file.`);
      setLoading(false);
    }
  }, []);

  // Function to handle role selection
  const handleRoleSelection = async (role) => {
    if (user && db) {
      const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}`);
      try {
        await setDoc(userDocRef, { role: role });
        console.log(`Role set to: ${role} for user: ${user.uid}`);
        // onSnapshot will automatically update userRole state
      } catch (error) {
        console.error("Error setting user role:", error);
        setFirebaseInitError(`Failed to set role: ${error.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg font-semibold text-gray-700">Loading application...</p>
      </div>
    );
  }

  if (firebaseInitError) {
    return (
      <div className="app-container flex flex-col items-center justify-center min-h-screen text-red-700 p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Firebase Configuration Error</h2>
        <p className="text-lg mb-4">{firebaseInitError}</p>
        <p className="text-md text-gray-700">
          Please ensure your Firebase configuration is correctly set up in your `.env` file and Firestore rules are permissive enough.
          Check the browser console for more technical details.
        </p>
      </div>
    );
  }

  // New UI for role selection
  if (needsRoleSelection) {
    return (
      <div className="app-container flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h2 className="text-3xl font-bold mb-6 text-purple-700">Welcome to Little Learners!</h2>
        <p className="text-xl mb-8 text-gray-700">It looks like you're new here. Please select your role:</p>
        <div className="flex space-x-6">
          <button
            onClick={() => handleRoleSelection('student')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-200 ease-in-out transform hover:scale-105"
          >
            I am a Student
          </button>
          <button
            onClick={() => handleRoleSelection('teacher')}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-200 ease-in-out transform hover:scale-105"
          >
            I am a Teacher
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-8">
          Current App ID: **{appId}**<br/>
          Current User ID: **{userId}**
        </p>
      </div>
    );
  }

  // Conditional rendering based on user role (after selection)
  if (userRole === 'teacher') {
    return <TeacherPortal />;
  } else if (userRole === 'student') {
    return <StudentPortal />;
  } else {
    // Fallback if role is null but not in selection state (shouldn't happen with this logic)
    return (
      <div className="app-container flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Welcome to Little Learners!</h2>
        <p className="text-lg mb-8">Please ensure Firebase is configured and a user role is assigned.</p>
        <p className="text-sm text-gray-600">
          Current App ID: **{appId}**<br/>
          Current User ID: **{userId}**<br/>
          (If you're seeing this, check your browser console for more details and ensure a 'role' field is set for your user document in Firestore at `artifacts/{appId}/users/{userId}`.)
        </p>
      </div>
    );
  }
}

export default App;
