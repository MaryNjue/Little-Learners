import React, { useState, useEffect } from 'react';
import { 
  Home, Bell, User, BookOpen, Calculator, Leaf, Music, Gamepad2, Award, Palette, 
  ClipboardList, Megaphone, MessageCircle, Heart, Sparkles, Rainbow 
} from 'lucide-react';
import '../App.css';
import StudentAssignments from '../Components/StudentManager/StudentAssignment';

function StudentPortal({ loggedInStudentId, loggedInStudentUsername }) {
  const [activeStudentView, setActiveStudentView] = useState('dashboard');

  // --- Debugging logs ---
  useEffect(() => {
    console.log("StudentPortal is being rendered.");
    if (loggedInStudentId) {
      console.log(`StudentPortal received Student ID: ${loggedInStudentId}`);
      console.log(`StudentPortal received Student Username: ${loggedInStudentUsername}`);
    }
  }, [loggedInStudentId, loggedInStudentUsername]);

  const renderStudentContent = () => {
    switch (activeStudentView) {
      case 'dashboard':
        return (
          <>
            {/* Welcome Banner */}
            <section className="welcome-banner">
              <h2 className="welcome-banner-title">
                <Heart className="heart-icon" />
                Welcome to MamaBear Digital!
                <Heart className="heart-icon" />
              </h2>
              <p className="welcome-banner-text">
                Ready to explore, learn, and have fun today, {loggedInStudentUsername || 'Little Learner'}?
              </p>
              <p className="welcome-banner-sub-text">
                Choose your favorite learning adventure below!
                <Rainbow className="rainbow-icon" />
              </p>
            </section>

            {/* Learning Categories */}
            <section className="learning-categories-section">
              <h2 className="section-title">
                <Palette /> Choose Your Learning Adventure! <Sparkles />
              </h2>

              <div className="category-grid">
                {/* Literacy */}
                <div className="category-card card-bg-literacy">
                  <div className="category-icon-wrapper">
                    <BookOpen className="category-icon" />
                  </div>
                  <h3 className="category-title">Literacy & ABC</h3>
                  <p className="category-description">Learn letters, sounds, and reading!</p>
                  <p className="activities-available">12 activities available</p>
                  <button className="category-button button-blue">Let's Go!</button>
                </div>

                {/* Numbers */}
                <div className="category-card card-bg-numbers">
                  <div className="category-icon-wrapper">
                    <Calculator className="category-icon" />
                  </div>
                  <h3 className="category-title">Numbers & Counting</h3>
                  <p className="category-description">Fun with numbers and math!</p>
                  <p className="activities-available">8 activities available</p>
                  <button className="category-button button-green">Let's Go!</button>
                </div>

                {/* Environment */}
                <div className="category-card card-bg-environment">
                  <div className="category-icon-wrapper">
                    <Leaf className="category-icon" />
                  </div>
                  <h3 className="category-title">Environment & Nature</h3>
                  <p className="category-description">Discover our amazing world!</p>
                  <p className="activities-available">10 activities available</p>
                  <button className="category-button button-emerald">Let's Go!</button>
                </div>

                {/* Rhymes & Songs */}
                <div className="category-card card-bg-rhymes">
                  <div className="category-icon-wrapper">
                    <Music className="category-icon" />
                  </div>
                  <h3 className="category-title">Rhymes & Songs</h3>
                  <p className="category-description">Sing and dance with us!</p>
                  <p className="activities-available">15 activities available</p>
                  <button className="category-button button-purple">Let's Go!</button>
                </div>

                {/* Fun Games */}
                <div className="category-card card-bg-games">
                  <div className="category-icon-wrapper">
                    <Gamepad2 className="category-icon" />
                  </div>
                  <h3 className="category-title">Fun Games</h3>
                  <p className="category-description">Play and learn together!</p>
                  <p className="activities-available">6 activities available</p>
                  <button className="category-button button-pink">Let's Go!</button>
                </div>

                {/* My Assignments */}
                <div className="category-card card-bg-assignments">
                  <div className="category-icon-wrapper">
                    <ClipboardList className="category-icon" />
                  </div>
                  <h3 className="category-title">My Assignments</h3>
                  <p className="category-description">Your special tasks!</p>
                  <button
                    onClick={() => setActiveStudentView('assignments')}
                    className="category-button button-orange"
                  >
                    Let's Go!
                  </button>
                </div>

                {/* Creative Arts */}
                <div className="category-card card-bg-creative">
                  <div className="category-icon-wrapper">
                    <Palette className="category-icon" />
                  </div>
                  <h3 className="category-title">Creative Arts</h3>
                  <p className="category-description">Draw, color, and create!</p>
                  <p className="activities-available">9 activities available</p>
                  <button className="category-button button-red">Let's Go!</button>
                </div>

                {/* My Progress */}
                <div className="category-card card-bg-progress">
                  <div className="category-icon-wrapper">
                    <Award className="category-icon" />
                  </div>
                  <h3 className="category-title">My Progress</h3>
                  <p className="category-description">See how great you are!</p>
                  <button className="category-button button-yellow">View Progress</button>
                </div>
              </div>
            </section>

            {/* Info Panels */}
            <section className="info-panels-section">
              {/* Announcements */}
              <div className="announcement-panel">
                <div className="announcement-panel-header">
                  <Megaphone className="icon" />
                  <h3>Announcements</h3>
                </div>
                <div className="announcement-content-wrapper">
                  <ul className="announcement-list">
                    <li className="announcement-item">
                      <Sparkles className="lucide-icon-sparkles" />
                      <div>
                        <div className="announcement-item-top">
                          <span className="announcement-item-title">New Fun Games Added!</span>
                          <span className="announcement-item-time">Today</span>
                        </div>
                        <span className="announcement-item-teacher">Teacher Sarah</span>
                      </div>
                    </li>
                    <li className="announcement-item">
                      <BookOpen className="lucide-icon-book" />
                      <div>
                        <div className="announcement-item-top">
                          <span className="announcement-item-title">Story Time Tomorrow</span>
                          <span className="announcement-item-time">Tomorrow</span>
                        </div>
                        <span className="announcement-item-teacher">Teacher Mike</span>
                      </div>
                    </li>
                    <li className="announcement-item">
                      <Award className="lucide-icon-award" />
                      <div>
                        <div className="announcement-item-top">
                          <span className="announcement-item-title">Great Work This Week!</span>
                          <span className="announcement-item-time">2 days ago</span>
                        </div>
                        <span className="announcement-item-teacher">Principal Jones</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Teacher Message */}
              <div className="teacher-message-panel">
                <div className="teacher-message-panel-header">
                  <MessageCircle className="icon" />
                  <h3>Message from Teacher</h3>
                </div>
                <div className="teacher-message-content-wrapper">
                  <div className="teacher-avatar-wrapper">
                    <User className="teacher-avatar-icon" />
                  </div>
                  <p className="teacher-name">Miss Emily</p>
                  <p className="teacher-message-text">
                    <Sparkles className="sparkles-icon" />
                    "Hello my wonderful little learners! I'm so proud of how hard you're all working. Remember to ask questions and have fun while learning!"
                  </p>
                  <button className="teacher-button">
                    Send Message <Heart className="heart-icon" />
                  </button>
                </div>
              </div>

              {/* Upcoming Activities */}
              <div className="upcoming-activities-panel">
                <div className="upcoming-activities-panel-header">
                  <Bell className="icon" />
                  <h3>Upcoming Activities</h3>
                </div>
                <div className="upcoming-activities-content-wrapper">
                  <ul className="activity-list">
                    <li className="activity-item">
                      <span className="activity-bullet"></span>
                      <div>
                        <p className="activity-title">Story Time with Teacher Mike</p>
                        <p className="activity-time">Monday, Aug 5th, 10:00 AM</p>
                      </div>
                    </li>
                    <li className="activity-item">
                      <span className="activity-bullet"></span>
                      <div>
                        <p className="activity-title">Outdoor Exploration Day</p>
                        <p className="activity-time">Wednesday, Aug 7th, 2:00 PM</p>
                      </div>
                    </li>
                    <li className="activity-item">
                      <span className="activity-bullet"></span>
                      <div>
                        <p className="activity-title">Art Class: Painting with Colors</p>
                        <p className="activity-time">Friday, Aug 9th, 11:00 AM</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </>
        );

      case 'assignments':
        return <StudentAssignments loggedInStudentId={loggedInStudentId} />;

      default:
        return <div className="main-content">Oops! Something went wrong.</div>;
    }
  };

  return (
    <div className="student-portal-main-wrapper">
      {renderStudentContent()}
    </div>
  );
}

export default StudentPortal;
