// App.js
import React, { useState, useEffect } from "react";
import firebaseApp from "./firebaseConfig";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";

import LoginPage from "./Components/Auth/LoginPage";
import StudentPortal from "./Components/StudentPortal";
import TeacherPortal from "./Components/TeacherPortal";
import "./App.css";

const app_id = (process.env.REACT_APP_APP_ID || "local-dev-app-id")
  .split("#")[0]
  .trim();

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);

  useEffect(() => {
    // 🔹 Step 1: Check if a student session exists in localStorage
    const localToken = localStorage.getItem("studentToken");
    const localRole = localStorage.getItem("role");

    if (localToken && localRole === "student") {
      console.log("App.js: Found student session in localStorage.");
      const storedUsername = localStorage.getItem("studentUsername");
      const storedFullName = localStorage.getItem("studentFullName"); 

      console.log("DEBUG storedFullName:", storedFullName);
  console.log("DEBUG storedUsername:", storedUsername);
  
      setUser({
        uid: "student-local",
        email: storedUsername,
        displayName: storedFullName, // ✅ NEW
      });
      setUserRole("student");
      setLoading(false);
      return;
    }

    // 🔹 Step 2: Fallback to Firebase (teachers)
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        console.log("App.js: Firebase Authenticated User:", currentUser.uid);

        try {
          const idToken = await currentUser.getIdToken(true);
          await fetch("http://localhost:8080/api/auth/firebase-auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });

          const userDocRef = doc(
            db,
            `artifacts/${app_id}/users/${currentUser.uid}`
          );
          const unsubscribeFirestore = onSnapshot(
            userDocRef,
            (snap) => {
              if (snap.exists()) {
                const data = snap.data();
                setUserRole(data.role ? data.role.toLowerCase() : "teacher");
              } else {
                setUserRole("teacher"); // default
              }
              setLoading(false);
            },
            (error) => {
              console.error("Firestore error:", error);
              setLoading(false);
            }
          );
          return () => unsubscribeFirestore();
        } catch (err) {
          console.error("Backend verification failed:", err);
          setLoading(false);
        }
      } else {
        setUser(null);
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth, db]);

  const handleLogout = async () => {
    const role = localStorage.getItem("role");

    if (role === "student") {
      localStorage.removeItem("studentToken");
      localStorage.removeItem("role");
      localStorage.removeItem("studentUsername"); // ✅ cleanup
      localStorage.removeItem("studentFullName"); // ✅ cleanup
      setUser(null);
      setUserRole(null);
      console.log("App.js: Student logged out.");
    } else {
      await signOut(auth);
      console.log("App.js: Teacher logged out.");
    }
  };

  // ✅ Handler for LoginPage
  const handleLoginSuccess = (loggedInUser, role) => {
    console.log("App.js: Login success callback:", role, loggedInUser);
    setUser(loggedInUser);
    setUserRole(role);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg font-semibold text-gray-700">
          Loading authentication state...
        </p>
      </div>
    );
  }

  if (!user) {
    console.log("App.js: No authenticated user → show LoginPage");
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>Mama Bear Digital</h1>
        <nav>
          <span className="user-info">
            Logged in as {user.displayName || user.email || "Student"} (
            {userRole?.toUpperCase()})
          </span>
          {userRole !== 'teacher' && (
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          )}
        </nav>
      </header>

      {userRole === "teacher" && (
        <TeacherPortal
          loggedInTeacherId={user.uid}
          loggedInTeacherUsername={user.email}
          handleLogout={handleLogout}
        />
      )}

      {userRole === "student" && (
        <StudentPortal
          loggedInStudentId={user.uid}
          loggedInStudentUsername={
            user.displayName || user.email || "Student"
          } // ✅ now shows fullName
        />
      )}
    </div>
  );
}

export default App;
