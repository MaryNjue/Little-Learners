// App.js
import React, { useState, useEffect } from 'react';
import firebaseApp from './firebaseConfig'; // ✅ Import the initialized Firebase app
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

import LoginPage from './Components/Auth/LoginPage';
import StudentPortal from './Components/StudentPortal';
import TeacherPortal from './Components/TeacherPortal';
import './App.css';

const app_id = (process.env.REACT_APP_APP_ID || 'local-dev-app-id').split('#')[0].trim();

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        console.log("App.js: Current Authenticated User ID (Firebase UID):", currentUser.uid);

        // ✅ Get Firebase JWT (ID Token)
        const idToken = await currentUser.getIdToken(/* forceRefresh */ true);
        console.log("App.js: Firebase ID Token (JWT):", idToken);

        // ✅ Send the token to your Spring Boot backend for verification
        try {
          const response = await fetch("https://your-backend.onrender.com/api/auth/firebase-auth", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ idToken }),
          });

          const data = await response.json();
          console.log("App.js: Backend response:", data);
        } catch (err) {
          console.error("App.js: Error calling backend:", err);
        }

        // ✅ Continue checking Firestore for role
        const userDocRef = doc(db, `artifacts/${app_id}/users/${currentUser.uid}`);
        const unsubscribeFirestore = onSnapshot(userDocRef, (userDocSnap) => {
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserRole(userData.role ? userData.role.toLowerCase() : null);
            console.log("App.js: User role fetched from Firestore (normalized):", userData.role ? userData.role.toLowerCase() : null);
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

  }, [auth, db]);

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
    console.log("App.js: User authenticated, but role not yet fetched or found.");
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

  console.log("App.js - Final userRole state:", userRole);
  console.log("App.js - Is TeacherPortal supposed to render?", userRole === 'teacher');
  console.log("App.js - Is StudentPortal supposed to render?", userRole === 'student');

  return (
    <div className="App">
      <header className="app-header">
        <h1>Little Learners Portal</h1>
        <nav>
          <span className="user-info">Logged in as {user.email} ({userRole.toUpperCase()})</span>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </nav>
      </header>
      {userRole === 'teacher' && (
        <TeacherPortal
          loggedInTeacherId={user.uid}
          loggedInTeacherUsername={user.email}
          handleLogout={handleLogout}
        />
      )}
      {userRole === 'student' && (
        <StudentPortal
          loggedInStudentId={user.uid}
          loggedInStudentUsername={user.email}
        />
      )}
    </div>
  );
}

export default App;
