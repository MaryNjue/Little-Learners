import React, { useState, useEffect } from 'react';
import { Users, BookOpen, MessageSquare, CalendarDays, BarChart2, Settings, LogOut, Home, FileText, Plus } from 'lucide-react';
import '../App.css'; // Import the main CSS file for global styles
import './TeacherPortal.css'; // Import specific styles for TeacherPortal
import StudentManagement from './StudentManager/StudentManagement';
import AssignmentManager from './assignmentManager/Assignment';
import AddSubject from '../Components/Subject/Subject'; // <-- ADDED: Import the new component

function TeacherPortal({ loggedInTeacherId, loggedInTeacherUsername, handleLogout }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // <-- ADDED: State for students and mock data
  const [students, setStudents] = useState([]);
  const mockStudents = [
    { id: 'student123', name: 'Timmy L.', gradeLevel: 'K' },
    { id: 'student456', name: 'Sarah K.', gradeLevel: '1' },
    { id: 'student789', name: 'John D.', gradeLevel: '2' },
  ];

  // UseEffect to manage loading state based on required props being available
  useEffect(() => {
    console.log("TeacherPortal: Received Teacher ID:", loggedInTeacherId);
    console.log("TeacherPortal: Received Teacher Username:", loggedInTeacherUsername);

    // Set loading to false once loggedInTeacherId and Username are available.
    if (loggedInTeacherId && loggedInTeacherUsername) {
      setLoading(false);
      // <-- ADDED: Set the mock student data
      setStudents(mockStudents);
    } else {
      // If for some reason props are not immediately available, keep loading
      setLoading(true);
    }
  }, [loggedInTeacherId, loggedInTeacherUsername]);

  // Dummy data for dashboard overview (remains as in your original file)
  const totalStudents = 25;
  const activeAssignments = 10;
  const unreadMessages = 3;
  const upcomingEvents = 2;

  // Function to render the content based on activeView
  const renderContent = () => {
    if (loading) {
      // Show a loading message while TeacherPortal waits for props from App.js
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 text-lg">Loading Teacher Portal content...</p>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard':
        return (
          <>
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
                  {/* Display loggedInTeacherUsername here */}
                  <img src="https://placehold.co/40x40/FFC107/FFFFFF?text=TE" alt="Teacher Avatar" className="teacher-avatar-img" />
                  <span className="teacher-name">{loggedInTeacherUsername || 'Teacher'}</span>
                </div>
              </div>
            </div>

            {/* Overview Cards (structure remains as per your original file) */}
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
                  <button
                    onClick={() => setActiveView('student-management')}
                    className="quick-action-button"
                  >
                    Go to Students
                  </button>
                </div>
                <div className="quick-action-card indigo">
                  <h3 className="quick-action-card-title">Create New Assignment</h3>
                  <p className="quick-action-card-text">Design and assign new learning activities for your class.</p>
                  <button
                    onClick={() => setActiveView('assignments')}
                    className="quick-action-button indigo"
                  >
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
          </>
        );
      case 'student-management':
        // Pass necessary props to StudentManagement
        return (
          <StudentManagement
            loggedInTeacherId={loggedInTeacherId}
            loggedInTeacherUsername={loggedInTeacherUsername}
          />
        );
      case 'assignments':
        return (
          <AssignmentManager
            loggedInTeacherId={loggedInTeacherId}
            loggedInTeacherUsername={loggedInTeacherUsername}
          />
        );
      case 'add-subject': // <-- ADDED: New case to render the AddSubject component
        return <AddSubject loggedInTeacherId={loggedInTeacherId} students={students} />;
      case 'analytics':
        return <h2>Analytics and Reports</h2>;
      case 'settings':
        return <h2>Settings</h2>;
      default:
        return <div>Page not found.</div>;
    }
  };

  return (
    <div className="teacher-portal-container">
      {/* Sidebar Navigation (structure remains as per your original file) */}
      <aside className="teacher-sidebar">
        <div>
          <div className="teacher-sidebar-header">
            <Home className="teacher-sidebar-icon" />
            <h2 className="teacher-sidebar-title">Teacher Portal</h2>
          </div>
          <nav className="teacher-nav">
            <ul>
              <li className="teacher-nav-item">
                <a
                  href="#"
                  onClick={() => setActiveView('dashboard')}
                  className={`teacher-nav-link ${activeView === 'dashboard' ? 'active' : ''}`}
                >
                  <BarChart2 className="teacher-nav-link-icon" />
                  Dashboard
                </a>
              </li>
              <li className="teacher-nav-item">
                <a
                  href="#"
                  onClick={() => setActiveView('student-management')}
                  className={`teacher-nav-link ${activeView === 'student-management' ? 'active' : ''}`}
                >
                  <Users className="teacher-nav-link-icon" />
                  Student Management
                </a>
              </li>
              <li className="teacher-nav-item">
                <a
                  href="#"
                  onClick={() => setActiveView('assignments')}
                  className={`teacher-nav-link ${activeView === 'assignments' ? 'active' : ''}`}
                >
                  <FileText className="teacher-nav-link-icon" />
                  Content & Assignments
                </a>
              </li>
              {/* <-- ADDED: New navigation item for Add Subject --> */}
              <li className="teacher-nav-item">
                <a
                  href="#"
                  onClick={() => setActiveView('add-subject')}
                  className={`teacher-nav-link ${activeView === 'add-subject' ? 'active' : ''}`}
                >
                  <Plus className="teacher-nav-link-icon" />
                  Add Subject
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
        <div>
          {/* Now uses the handleLogout prop passed from App.js */}
          <button className="teacher-logout-button" onClick={handleLogout}> {/* <-- ADDED onClick={handleLogout} */}
            <LogOut className="teacher-nav-link-icon" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="teacher-main-content">
        {renderContent()}
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
