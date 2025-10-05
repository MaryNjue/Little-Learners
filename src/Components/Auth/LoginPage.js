import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const API_BASE_URL = "https://little-learners-2i8y.onrender.com";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Step 1️⃣ - normal login
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      const data = response.data;
      console.log("Login response:", data);

      // Keep existing keys untouched for others
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("role", data.role);

      // Step 2️⃣ - fetch correct studentId (new endpoint)
      if (data.role === "STUDENT") {
        try {
          const res = await axios.get(
            `${API_BASE_URL}/api/students/getStudentId?userId=${data.userId}`
          );
          const studentId = res.data.studentId;
          console.log("✅ Actual Student ID:", studentId);

          // store this safely under a NEW key
          localStorage.setItem("loggedInStudentId", studentId);
        } catch (err) {
          console.error("Failed to fetch correct studentId:", err);
        }

        navigate("/student-dashboard");
      } else if (data.role === "TEACHER") {
        navigate("/teacher-dashboard");
      } else if (data.role === "ADMIN") {
        navigate("/admin-dashboard");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid credentials or server error.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login to Little Learners</h2>
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>

        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

export default LoginPage;
