import React from 'react';
import { Home, Bell, User, Book, Calculator, Leaf, Music, Gamepad, Folder, Paintbrush, Award, ChevronRight, MessageSquare, CalendarDays, Rocket, Sparkles, Rainbow, Heart } from 'lucide-react';
import './App.css'; // Import our CSS file

// Main App Component
function App() {
  return (
    <div className="app-container">
      {/* Header */}
      <Header />

      <main className="main-content">
        {/* Welcome Banner */}
        <WelcomeBanner />

        {/* Learning Adventures Section */}
        <section className="learning-categories-section">
          <h2 className="section-title">
            <span style={{ color: '#ff4081' }}>🎨</span> {/* Pink palette emoji */}
            Choose Your Learning Adventure!
            <span style={{ color: '#448aff' }}>🧩</span> {/* Blue puzzle emoji */}
          </h2>
          <div className="category-grid">
            <CategoryCard
              icon={<Book className="category-icon" style={{ color: '#2196f3' }} />} /* Blue */
              title="Literacy & ABC"
              description="Learn letters, sounds, and reading!"
              activitiesAvailable={12}
              buttonClass="button-blue"
              cardBackgroundClass="card-bg-literacy" // Applied here
            />
            <CategoryCard
              icon={<Calculator className="category-icon" style={{ color: '#4CAF50' }} />} /* Green */
              title="Numbers & Counting"
              description="Fun with numbers and math!"
              activitiesAvailable={8}
              buttonClass="button-green"
              cardBackgroundClass="card-bg-numbers" // Applied here
            />
            <CategoryCard
              icon={<Leaf className="category-icon" style={{ color: '#00C853' }} />} /* Emerald */
              title="Environment & Nature"
              description="Discover our amazing world!"
              activitiesAvailable={10}
              buttonClass="button-emerald"
              cardBackgroundClass="card-bg-environment" // Applied here
            />
            <CategoryCard
              icon={<Music className="category-icon" style={{ color: '#9C27B0' }} />} /* Purple */
              title="Rhymes & Songs"
              description="Sing and dance with us!"
              activitiesAvailable={15}
              buttonClass="button-purple"
              cardBackgroundClass="card-bg-rhymes" // Applied here
            />
            <CategoryCard
              icon={<Gamepad className="category-icon" style={{ color: '#E91E63' }} />} /* Pink */
              title="Fun Games"
              description="Play and learn together!"
              activitiesAvailable={6}
              buttonClass="button-pink"
              cardBackgroundClass="card-bg-games" // Applied here
            />
            <CategoryCard
              icon={<Folder className="category-icon" style={{ color: '#FF9800' }} />} /* Orange */
              title="My Assignments"
              description="Your special tasks!"
              activitiesAvailable={3}
              buttonClass="button-orange"
              cardBackgroundClass="card-bg-assignments" // Applied here
            />
            <CategoryCard
              icon={<Paintbrush className="category-icon" style={{ color: '#F44336' }} />} /* Red */
              title="Creative Arts"
              description="Draw, color, and create!"
              activitiesAvailable={9}
              buttonClass="button-red"
              cardBackgroundClass="card-bg-creative" // Applied here
            />
            <CategoryCard
              icon={<Award className="category-icon" style={{ color: '#FFEB3B' }} />} /* Yellow */
              title="My Progress"
              description="See how great you are!"
              activitiesAvailable={0} // No activities, just a button to view progress
              buttonClass="button-yellow"
              buttonText="View Progress" // Custom text for this button
              cardBackgroundClass="card-bg-progress" // Applied here
            />
          </div>
        </section>

        {/* Info Panels Section */}
        <section className="info-panels-section">
          <AnnouncementsPanel />
          <TeacherMessagePanel />
          <UpcomingActivitiesPanel />
        </section>
      </main>
    </div>
  );
}

// Header Component
function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <Home className="header-home-icon" />
        <div>
          <h1 className="header-title">Little Learners</h1>
          <p className="header-subtitle">Preschool E-Learning Portal</p>
        </div>
      </div>
      <div className="header-right">
        <button className="header-button header-notifications-button">
          <Bell className="w-5 h-5" />
          <span>Notifications</span>
        </button>
        <button className="header-button header-login-button">
          <User className="w-5 h-5" />
          <span>Login</span>
        </button>
      </div>
    </header>
  );
}

// Welcome Banner Component
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

// Category Card Component (Updated to accept cardBackgroundClass)
function CategoryCard({ icon, title, description, activitiesAvailable, buttonClass, buttonText = "Let's Go!", cardBackgroundClass }) {
  return (
    <div className={`category-card ${cardBackgroundClass}`}> {/* Apply card background class here */}
      <div className="category-icon-wrapper">
        {icon}
      </div>
      <h3 className="category-title">{title}</h3>
      <p className="category-description">{description}</p>
      {activitiesAvailable > 0 && (
        <p className="activities-available">{activitiesAvailable} activities available</p>
      )}
      <button className={`category-button ${buttonClass}`}>
        <span>{buttonText}</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// Announcements Panel Component
function AnnouncementsPanel() {
  const announcements = [
    { title: "New Fun Games Added!", time: "Today", teacher: "Teacher Sarah" },
    { title: "Story Time Tomorrow", time: "Tomorrow", teacher: "Teacher Mike" },
    { title: "Great Work This Week!", time: "2 days ago", teacher: "Principal Jones" },
  ];

  return (
    <div className="announcement-panel">
      <div className="announcement-panel-header">
        <Bell className="icon" />
        <h3>Announcements</h3>
      </div>
      <ul className="announcement-list">
        {announcements.map((announcement, index) => (
          <li key={index} className="announcement-item">
            <div className="announcement-item-top">
              <p className="announcement-item-title">{announcement.title}</p>
              <span className="announcement-item-time">{announcement.time}</span>
            </div>
            <p className="announcement-item-teacher">A {announcement.teacher}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Message from Teacher Panel Component
function TeacherMessagePanel() {
  return (
    <div className="teacher-message-panel">
      <div className="teacher-message-panel-header">
        <MessageSquare className="icon" />
        <h3>Message from Teacher</h3>
      </div>
      <div className="teacher-avatar-wrapper">
        {/* Placeholder for teacher's image/avatar */}
        <User className="teacher-avatar-icon" />
      </div>
      <p className="teacher-name">Miss Emily</p>
      <p className="teacher-message-text">
        "Hello my wonderful little learners! <Sparkles className="sparkles-icon" /> I'm so proud of how hard you're all working. Remember to ask questions and have fun while learning!"
      </p>
      <button className="teacher-button">
        Your favorite teacher
      </button>
    </div>
  );
}

// Upcoming Activities Panel Component
function UpcomingActivitiesPanel() {
  const activities = [
    { title: "Art & Craft Session", day: "Monday", time: "11:00 AM" },
    { title: "Science Discovery", day: "Wednesday", time: "10:30 AM" },
    { title: "Music & Movement", day: "Friday", time: "2:00 PM" },
    { title: "Show and Tell", day: "Next Monday", time: "9:00 AM" },
  ];

  return (
    <div className="upcoming-activities-panel">
      <div className="upcoming-activities-panel-header">
        <CalendarDays className="icon" />
        <h3>Upcoming Activities</h3>
      </div>
      <ul className="activity-list">
        {activities.map((activity, index) => (
          <li key={index} className="activity-item">
            <span className="activity-bullet"></span>
            <div>
              <p className="activity-title">{activity.title}</p>
              <p className="activity-time">{activity.day}, {activity.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
