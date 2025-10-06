import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import "./LoginPage.css";

function LoginPage({ onLoginSuccess }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("STUDENT");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const auth = getAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (selectedRole === "STUDENT") {
        // 🔹 Student login against your backend
        const response = await fetch("https://little-learners-2i8y.onrender.com/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: identifier, // admission number
            password: password,
          }),
        });

        if (!response.ok) throw new Error("Invalid admission number or password.");

        const data = await response.json();
        console.log("Student login success:", data);

        // ✅ Save session in localStorage (must match App.js)
        localStorage.setItem("studentUserId", data.userId);
        localStorage.setItem("studentToken", data.token || data.userId);
        localStorage.setItem("studentId", data.userId); 
        localStorage.setItem("loggedInStudentId", data.userId);
        localStorage.setItem("role", "student");
        localStorage.setItem("studentUsername", data.username || identifier);
        localStorage.setItem("studentFullName", data.fullName || "Student");
        console.log("Saved to localStorage →", data.fullName, data.username);


        console.log("LoginPage: Student session saved to localStorage.");

        onLoginSuccess(
    {
      uid: data.userId,
      email: data.username,
      displayName: data.fullName,
    },
    "student"
  );

        // ✅ Reload so App.js picks it up
        window.location.reload();
      } else {
        // 🔹 Teacher login via Firebase
        const userCredential = await signInWithEmailAndPassword(
          auth,
          identifier,
          password
        );
        const firebaseUser = userCredential.user;

        console.log("Firebase Teacher authenticated:", firebaseUser);

        localStorage.setItem("role", "teacher");
        if (onLoginSuccess) {
          onLoginSuccess(firebaseUser, "teacher");
        }
      }
    } catch (err) {
      console.error("Login error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Mama Bear Digital Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="identifier">
              {selectedRole === "STUDENT" ? "Admission Number:" : "Email:"}
            </label>
            <input
              type={selectedRole === "STUDENT" ? "text" : "email"}
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group role-selection">
            <label>Login As:</label>
            <div className="radio-group">
              <input
                type="radio"
                id="studentRole"
                name="role"
                value="STUDENT"
                checked={selectedRole === "STUDENT"}
                onChange={() => setSelectedRole("STUDENT")}
              />
              <label htmlFor="studentRole">Student</label>

              <input
                type="radio"
                id="teacherRole"
                name="role"
                value="TEACHER"
                checked={selectedRole === "TEACHER"}
                onChange={() => setSelectedRole("TEACHER")}
              />
              <label htmlFor="teacherRole">Teacher</label>
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Logging In..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
