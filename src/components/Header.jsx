import React from 'react';
import { Home, Bell, User } from 'lucide-react';
import '../App.css'; // Import the CSS file where header styles are defined

// Header Component
function Header() {
  return (
    // The header bar, applying styles from App.css
    <header className="header">
      {/* Left section: Logo and Site Title */}
      <div className="header-left">
        {/* Home icon with a rounded background */}
        <Home className="header-home-icon" />
        <div>
          {/* Site main title */}
          <h1 className="header-title">Little Learners</h1>
          {/* Site subtitle */}
          <p className="header-subtitle">Preschool E-Learning Portal</p>
        </div>
      </div>
      {/* Right section: Notifications and Login buttons */}
      <div className="header-right">
        {/* Notifications button */}
        <button className="header-button header-notifications-button">
          <Bell className="w-5 h-5" /> {/* Bell icon */}
          <span>Notifications</span>
        </button>
        {/* Login button */}
        <button className="header-button header-login-button">
          <User className="w-5 h-5" /> {/* User icon */}
          <span>Login</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
