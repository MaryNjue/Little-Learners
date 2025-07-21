import React from 'react';
import { Heart, Rainbow } from 'lucide-react';
import '../App.css';

function WelcomeBanner() {
  return (
    <div className="welcome-banner">
      <h2 className="welcome-banner-title">
        Welcome, Little Learner! <Heart className="heart-icon" />
      </h2>
      <p className="welcome-banner-text">
        Ready to explore, learn, and have fun today?
      </p>
      <p className="welcome-banner-sub-text">
        Choose your favorite learning adventure below! <Rainbow className="rainbow-icon" />
      </p>
    </div>
  );
}

export default WelcomeBanner;