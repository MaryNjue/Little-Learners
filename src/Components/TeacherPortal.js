import React from 'react';
import { Users, BookOpen, MessageSquare, CalendarDays, BarChart2, Settings, LogOut, Home } from 'lucide-react'; // Import necessary icons
import '../App.css'; // Import the main CSS file for global styles (like font-family)
import './TeacherPortal.css'; // Import specific styles for TeacherPortal

function TeacherPortal() {
  // Dummy data for dashboard overview
  const totalStudents = 25;
  const activeAssignments = 10;
  const unreadMessages = 3;
  const upcomingEvents = 2;

  return (
    <div className="teacher-portal-container">
      {/* Sidebar Navigation */}
      <aside className="teacher-sidebar">
        <div>
          <div className="teacher-sidebar-header">
            <Home className="teacher-sidebar-icon" />
            <h2 className="teacher-sidebar-title">Teacher Portal</h2>
          </div>
          <nav className="teacher-nav"> {/* Added teacher-nav class */}
            <ul>
              <li className="teacher-nav-item">
                <a href="#" className="teacher-nav-link">
                  <BarChart2 className="teacher-nav-link-icon" />
                  Dashboard
                </a>
              </li>
              <li className="teacher-nav-item">
                <a href="#" className="teacher-nav-link">
                  <Users className="teacher-nav-link-icon" />
                  Student Management
                </a>
              </li>
              <li className="teacher-nav-item">
                <a href="#" className="teacher-nav-link">
                  <BookOpen className="teacher-nav-link-icon" />
                  Content & Assignments
                </a>
              </li>
              <li className="teacher-nav-item">
                <a href="#" className="teacher-nav-link">
                  <MessageSquare className="teacher-nav-link-icon" />
                  Communication
                </a>
              </li>
              <li className="teacher-nav-item">
                <a href="#" className="teacher-nav-link">
                  <CalendarDays className="teacher-nav-link-icon" />
                  Calendar
                </a>
              </li>
            </ul>
          </nav>
        </div>
        {/* Logout Button */}
        <div> {/* Removed mt-8 as it's handled by teacher-logout-button margin-top */}
          <button className="teacher-logout-button">
            <LogOut className="teacher-nav-link-icon" /> {/* Reusing icon class */}
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="teacher-main-content">
        <div className="teacher-header-bar">
          <h1 className="teacher-dashboard-title">Teacher Dashboard</h1>
          <div className="teacher-header-actions">
            <button className="teacher-action-button message">
              <MessageSquare className="teacher-action-button-icon" />
            </button>
            <button className="teacher-action-button settings">
              <Settings className="teacher-action-button-icon" />
            </button>
            <div className="teacher-avatar-info">
              <img src="https://placehold.co/40x40/FFC107/FFFFFF?text=TE" alt="Teacher Avatar" className="teacher-avatar-img" />
              <span className="teacher-name">Miss Emily</span>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="dashboard-cards-grid">
          <DashboardCard
            title="Total Students"
            value={totalStudents}
            icon={<Users className="dashboard-card-icon" />}
            bgColorClass="bg-blue-50"
          />
          <DashboardCard
            title="Active Assignments"
            value={activeAssignments}
            icon={<BookOpen className="dashboard-card-icon" />}
            bgColorClass="bg-green-50"
          />
          <DashboardCard
            title="Unread Messages"
            value={unreadMessages}
            icon={<MessageSquare className="dashboard-card-icon" />}
            bgColorClass="bg-yellow-50"
          />
          <DashboardCard
            title="Upcoming Events"
            value={upcomingEvents}
            icon={<CalendarDays className="dashboard-card-icon" />}
            bgColorClass="bg-red-50"
          />
        </div>

        {/* Quick Actions / Recent Activity (Placeholder) */}
        <div className="quick-actions-section">
          <h2 className="quick-actions-title">Quick Actions & Recent Activity</h2>
          <div className="quick-actions-grid">
            <div className="quick-action-card">
              <h3 className="quick-action-card-title">Manage Students</h3>
              <p className="quick-action-card-text">Add new students, view profiles, or update information.</p>
              <button className="quick-action-button">
                Go to Students
              </button>
            </div>
            <div className="quick-action-card indigo"> {/* Added 'indigo' class for specific styling */}
              <h3 className="quick-action-card-title">Create New Assignment</h3>
              <p className="quick-action-card-text">Design and assign new learning activities for your class.</p>
              <button className="quick-action-button indigo"> {/* Added 'indigo' class here too */}
                Create Assignment
              </button>
            </div>
          </div>
          <div className="recent-activity-section">
            <h3 className="recent-activity-title">Recent Student Activity</h3>
            <ul className="recent-activity-list">
              <li className="recent-activity-item">John D. completed "Alphabet Practice" activity.</li>
              <li className="recent-activity-item">Sarah K. submitted "Counting to 10" assignment.</li>
              <li className="recent-activity-item">New message from Parent of Timmy L.</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

// Reusable Dashboard Card Component
function DashboardCard({ title, value, icon, bgColorClass }) {
  return (
    <div className={`dashboard-card ${bgColorClass}`}>
      <div className="dashboard-card-icon-wrapper">
        {icon}
      </div>
      <div>
        <h3 className="dashboard-card-title">{title}</h3>
        <p className="dashboard-card-value">{value}</p>
      </div>
    </div>
  );
}

export default TeacherPortal;
