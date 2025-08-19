import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; // Import Firebase auth functions
import './LoginPage.css'; // We'll create this CSS file next

function LoginPage({ onLoginSuccess }) { // onLoginSuccess prop will be used later
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('STUDENT'); // Default to STUDENT
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const auth = getAuth(); // Get the Firebase Auth instance

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Authenticate with Firebase first
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log('Firebase user authenticated:', firebaseUser);

      // --- IMPORTANT: Backend Role Verification and JWT will go here ---
      // For now, we'll just simulate success and pass selected role
      // In the next step, we'll make an API call to your Spring Boot backend
      // to verify the Firebase ID Token and fetch the user's *actual* role(s)
      // from your PostgreSQL database, then get a JWT from Spring Boot.
      // We will *not* trust the `selectedRole` directly yet.
      // -----------------------------------------------------------------

      // Simulate successful login for now, this will be replaced
      alert(`Successfully logged in as ${firebaseUser.email} with selected role: ${selectedRole}!`);
      if (onLoginSuccess) {
        // In a real app, you'd pass the actual role determined by backend
        onLoginSuccess(firebaseUser.email, selectedRole);
      }

    } catch (err) {
      console.error('Login error:', err.message);
      let errorMessage = 'Login failed. Please check your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      setError(errorMessage);
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
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                checked={selectedRole === 'STUDENT'}
                onChange={() => setSelectedRole('STUDENT')}
              />
              <label htmlFor="studentRole">Student</label>

              <input
                type="radio"
                id="teacherRole"
                name="role"
                value="TEACHER"
                checked={selectedRole === 'TEACHER'}
                onChange={() => setSelectedRole('TEACHER')}
              />
              <label htmlFor="teacherRole">Teacher</label>
            </div>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging In...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;