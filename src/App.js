import React, { useState, useEffect } from 'react';
// Import firebaseApp from index.js
import { firebaseApp } from './index'; // <-- IMPORTANT: Import the initialized app here

// Import Firebase service functions, now they will take 'firebaseApp' as an argument
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

import LoginPage from './Components/Auth/LoginPage';
import StudentPortal from './Components/StudentPortal';
import TeacherPortal from './Components/TeacherPortal';
import './App.css';

const app_id = (process.env.REACT_APP_APP_ID || 'local-dev-app-id').split('#')[0].trim();

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // This is the state variable
  const [loading, setLoading] = useState(true);

  // Get auth and db instances using the initialized firebaseApp
  const auth = getAuth(firebaseApp);   // <-- Pass firebaseApp here
  const db = getFirestore(firebaseApp); // <-- Pass firebaseApp here

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        console.log("App.js: Current Authenticated User ID (Firebase UID):", currentUser.uid);

        const userDocRef = doc(db, `artifacts/${app_id}/users/${currentUser.uid}`);
        const unsubscribeFirestore = onSnapshot(userDocRef, (userDocSnap) => {
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            // FIX: Normalize the role to lowercase here for reliable comparison
            setUserRole(userData.role ? userData.role.toLowerCase() : null);
            console.log("App.js: User role fetched from Firestore (real-time, normalized):", userData.role ? userData.role.toLowerCase() : null);
          } else {
            console.warn("App.js: User document not found. They may be a new user.");
            setUserRole(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("App.js: Error listening to user document:", error);
          setLoading(false);
        });

        return () => unsubscribeFirestore();

      } else {
        setUserRole(null);
        setLoading(false);
        console.log("App.js: User signed out or no user.");
      }
    });

    return () => unsubscribeAuth();

  }, [auth, db]); // Dependencies are still auth and db instances

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("App.js: User logged out successfully.");
    } catch (error) {
      console.error('App.js: Logout error:', error.message);
      alert('Error logging out. Check console for details.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg font-semibold text-gray-700">Loading authentication state...</p>
      </div>
    );
  }

  if (!user) {
    console.log("App.js: No authenticated user, rendering LoginPage.");
    return <LoginPage />;
  }
  
  if (!userRole) {
     console.log("App.js: User authenticated, but role not yet fetched or found (rendering setup message).");
     return (
        <div className="app-container flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl font-bold mb-4">Welcome Back!</h2>
          <p className="text-lg mb-8">We are setting up your profile...</p>
          <p className="text-sm text-gray-600">
            (If you're stuck on this page, a role might not be assigned in Firestore.
            Check the browser console for details.)
          </p>
        </div>
      );
  }

  // --- DEBUGGING LOGS (Now safely using the state variable 'userRole') ---
  console.log("App.js - Final userRole state:", userRole);
  console.log("App.js - Is TeacherPortal supposed to render?", userRole === 'teacher');
  console.log("App.js - Is StudentPortal supposed to render?", userRole === 'student');
  // --- END DEBUGGING LOGS ---

  return (
    <div className="App">
      <header className="app-header">
        <h1>Little Learners Portal</h1>
        <nav>
          {/* Display userRole in uppercase for consistency with screenshot format */}
          <span className="user-info">Logged in as {user.email} ({userRole.toUpperCase()})</span>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </nav>
      </header>
      {userRole === 'teacher' &&
        <TeacherPortal
          loggedInTeacherId={user.uid} // Pass Firebase UID as teacher ID
          loggedInTeacherUsername={user.email} // Pass user email as username
          handleLogout={handleLogout} // Pass the handleLogout function to TeacherPortal
        />
      }
      {userRole === 'student' &&
        <StudentPortal
          loggedInStudentId={user.uid} // Pass Firebase UID as student ID
          loggedInStudentUsername={user.email} // Pass user email as username
        />
      }
    </div>
  );
}

export default App;