import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import StudentPortal from './Components/StudentPortal';
import TeacherPortal from './Components/TeacherPortal'; // Adjusted path based on common structure
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

  // Define appId and userId here to be accessible in the render block
  // Ensure we trim any comments or extra whitespace from the .env value
  const appId = (process.env.REACT_APP_APP_ID || 'local-dev-app-id').split('#')[0].trim();
  const userId = user?.uid || 'unknown-user-id'; // Use optional chaining for user.uid

  useEffect(() => {
    let app, firestore, authInstance;
    let unsubscribeAuth = () => {}; // Placeholder for auth listener cleanup
    let unsubscribeFirestore = () => {}; // Placeholder for firestore listener cleanup

    try {
      // Check if essential config is present
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

      // In local development, we'll sign in anonymously by default
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
          // Log the current user's UID directly here
          console.log("Current Authenticated User ID:", currentUser.uid);

          const userDocRef = doc(firestore, `artifacts/${appId}/users/${currentUser.uid}`);

          // Set up real-time listener for the user document
          unsubscribeFirestore = onSnapshot(userDocRef, (userDocSnap) => {
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              setUserRole(userData.role);
              console.log("User role fetched (real-time):", userData.role);
            } else {
              // If user document doesn't exist, create it with a default 'student' role
              console.warn("User document not found. Creating with default 'student' role.");
              setDoc(userDocRef, { role: 'student' })
                .then(() => setUserRole('student'))
                .catch(error => console.error("Error setting default role:", error));
            }
            // Only set loading to false once the role is determined (initial load)
            // This ensures the correct portal is shown after the first fetch/creation
            setLoading(false);
          }, (error) => {
            console.error("Error listening to user document:", error);
            setFirebaseInitError(`Error accessing user data: ${error.message}. Check Firestore rules.`);
            setLoading(false);
          });

        } else {
          setUser(null);
          setUserRole(null);
          setLoading(false); // If no user, stop loading and show login prompt
          console.log("User signed out or no user.");
        }
      });

      // Cleanup subscriptions on unmount
      return () => {
        unsubscribeAuth();
        unsubscribeFirestore();
      };
    } catch (error) {
      console.error("Firebase initialization failed during try-catch block:", error);
      setFirebaseInitError(`Firebase initialization failed: ${error.message}. Please check your .env file.`);
      setLoading(false);
    }
  }, []); // Empty dependency array means this effect runs once on mount

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

  if (userRole === 'teacher') {
    return <TeacherPortal />;
  } else if (userRole === 'student') {
    return <StudentPortal />;
  } else {
    // Default view if no role or unauthenticated
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
