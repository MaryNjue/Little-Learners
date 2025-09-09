import React, { useState, useEffect } from 'react';
import { Home, Bell, User, BookOpen, Calculator, Leaf, Music, Gamepad2, Award, Palette, ClipboardList, Megaphone, MessageCircle, Heart, Sparkles, Rainbow, FileText, CheckCircle, Clock } from 'lucide-react'; // Added FileText, CheckCircle, Clock for assignments view
import '../App.css'; // Ensure App.css is imported for general styles

function StudentPortal({ loggedInStudentId, loggedInStudentUsername }) {

  const [activeStudentView, setActiveStudentView] = useState('dashboard');
  
  const [myAssignments, setMyAssignments] = useState([]);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [selectedAssignmentForSubmission, setSelectedAssignmentForSubmission] = useState(null);

  


  useEffect(() => {
    console.log("StudentPortal is being rendered.");
    if (loggedInStudentId) {
      console.log(`StudentPortal received Student ID: ${loggedInStudentId}`);
      console.log(`StudentPortal received Student Username: ${loggedInStudentUsername}`);
    }
  }, [loggedInStudentId, loggedInStudentUsername]);
  // --- END DEBUGGING LOGS ---

  // Effect to fetch initial student data (subjects, assignments, content)
  useEffect(() => {
    if (loggedInStudentId) {
      console.log(`Fetching data for student ID: ${loggedInStudentId}`);
      // Simulate fetching assignments - replace with actual API calls later
      setMyAssignments([
        { id: 'assign1', title: 'Algebra Worksheet 1', subject: 'Mathematics', dueDate: '2025-08-10', status: 'PENDING', grade: null, maxMarks: 10 },
        { id: 'assign2', title: 'Grammar Quiz', subject: 'English', dueDate: '2025-08-12', status: 'GRADED', grade: 12, maxMarks: 15, teacherFeedback: 'Excellent work!' },
        { id: 'assign3', title: 'Science Project Plan', subject: 'Science', dueDate: '2025-08-05', status: 'MISSED', grade: null, maxMarks: 20 },
      ]);
      // You can add more data fetching for other sections like content, progress etc.
    }
  }, [loggedInStudentId]); // Re-run when student ID changes

  const handleOpenSubmissionModal = (assignment) => {
    setSelectedAssignmentForSubmission(assignment);
    setIsSubmissionModalOpen(true);
  };

  const handleCloseSubmissionModal = () => {
    setIsSubmissionModalOpen(false);
    setSelectedAssignmentForSubmission(null);
  };

  const handleAssignmentSubmission = (e) => {
    e.preventDefault();
    console.log('Assignment Submitted!');
    handleCloseSubmissionModal();
    alert('Assignment submitted successfully!');
    // In a real app: make API call to /api/submissions
    // For now, let's update the status client-side for demonstration
    setMyAssignments(prevAssignments =>
      prevAssignments.map(assign =>
        assign.id === selectedAssignmentForSubmission.id
          ? { ...assign, status: 'SUBMITTED_PENDING_GRADE' } // New status after submission
          : assign
      )
    );
  };

  // Function to render content based on activeStudentView state
  const renderStudentContent = () => {
    switch (activeStudentView) {
      case 'dashboard':
        return (
          <>
            {/* Welcome Banner Section */}
            <section className="welcome-banner">
              <h2 className="welcome-banner-title">
                <Heart className="heart-icon" />
                Welcome to MamaBear Digital!
                <Heart className="heart-icon" />
              </h2>
              <p className="welcome-banner-text">Ready to explore, learn, and have fun today, {loggedInStudentUsername || 'Little Learner'}?</p>
              <p className="welcome-banner-sub-text">
                Choose your favorite learning adventure below!
                <Rainbow className="rainbow-icon" />
              </p>
            </section>

            {/* Learning Categories Section */}
            <section className="learning-categories-section">
              <h2 className="section-title">
                <Palette />
                Choose Your Learning Adventure!
                <Sparkles />
              </h2>

              <div className="category-grid">
                {/* Card 1: Literacy & ABC */}
                <div className="category-card card-bg-literacy">
                  <div className="category-icon-wrapper">
                    <BookOpen className="category-icon" />
                  </div>
                  <h3 className="category-title">Literacy & ABC</h3>
                  <p className="category-description">Learn letters, sounds, and reading!</p>
                  <p className="activities-available">12 activities available</p>
                  <button className="category-button button-blue">Let's Go!</button>
                </div>

                {/* Card 2: Numbers & Counting */}
                <div className="category-card card-bg-numbers">
                  <div className="category-icon-wrapper">
                    <Calculator className="category-icon" />
                  </div>
                  <h3 className="category-title">Numbers & Counting</h3>
                  <p className="category-description">Fun with numbers and math!</p>
                  <p className="activities-available">8 activities available</p>
                  <button className="category-button button-green">Let's Go!</button>
                </div>

                {/* Card 3: Environment & Nature */}
                <div className="category-card card-bg-environment">
                  <div className="category-icon-wrapper">
                    <Leaf className="category-icon" />
                  </div>
                  <h3 className="category-title">Environment & Nature</h3>
                  <p className="category-description">Discover our amazing world!</p>
                  <p className="activities-available">10 activities available</p>
                  <button className="category-button button-emerald">Let's Go!</button>
                </div>

                {/* Card 4: Rhymes & Songs */}
                <div className="category-card card-bg-rhymes">
                  <div className="category-icon-wrapper">
                    <Music className="category-icon" />
                  </div>
                  <h3 className="category-title">Rhymes & Songs</h3>
                  <p className="category-description">Sing and dance with us!</p>
                  <p className="activities-available">15 activities available</p>
                  <button className="category-button button-purple">Let's Go!</button>
                </div>

                {/* Card 5: Fun Games */}
                <div className="category-card card-bg-games">
                  <div className="category-icon-wrapper">
                    <Gamepad2 className="category-icon" />
                  </div>
                  <h3 className="category-title">Fun Games</h3>
                  <p className="category-description">Play and learn together!</p>
                  <p className="activities-available">6 activities available</p>
                  <button className="category-button button-pink">Let's Go!</button>
                </div>

                {/* Card 6: My Assignments - THIS IS THE CARD WE ARE MODIFYING */}
                <div className="category-card card-bg-assignments">
                  <div className="category-icon-wrapper">
                    <ClipboardList className="category-icon" />
                  </div>
                  <h3 className="category-title">My Assignments</h3>
                  <p className="category-description">Your special tasks!</p>
                  {/* The number of assignments can be dynamic if you fetch it */}
                  <p className="activities-available">{myAssignments.length} assignments available</p>
                  {/* On click, change the active view to 'assignments' */}
                  <button
                    onClick={() => setActiveStudentView('assignments')}
                    className="category-button button-orange">
                    Let's Go!
                  </button>
                </div>

                {/* Card 7: Creative Arts */}
                <div className="category-card card-bg-creative">
                  <div className="category-icon-wrapper">
                    <Palette className="category-icon" />
                  </div>
                  <h3 className="category-title">Creative Arts</h3>
                  <p className="category-description">Draw, color, and create!</p>
                  <p className="activities-available">9 activities available</p>
                  <button className="category-button button-red">Let's Go!</button>
                </div>

                {/* Card 8: My Progress */}
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

            {/* Announcements and Message from Teacher Section */}
            <section className="info-panels-section">
              {/* Announcements Panel */}
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

              {/* Teacher Message Panel */}
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

              {/* Upcoming Activities Panel */}
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
        return (
          // Use 'main-content' to center the assignment view
          <div className="main-content">
            <button
              onClick={() => setActiveStudentView('dashboard')}
              className="back-button mb-6 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-gray-800 font-semibold flex items-center"
            >
              &larr; Back to Dashboard
            </button>

            <div className="mb-8 p-6 border rounded-lg bg-blue-50 shadow-md">
              <h3 className="text-2xl font-bold mb-4 text-blue-800 flex items-center">
                <ClipboardList className="mr-3" size={28}/> My Assignments
              </h3>
              {myAssignments.length > 0 ? (
                <ul className="space-y-4">
                  {myAssignments.map(assignment => (
                    <li key={assignment.id} className="p-4 border rounded-md shadow-sm bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between">
                      <div className="mb-2 sm:mb-0 sm:mr-4 flex-grow">
                        <p className="font-bold text-lg">{assignment.title} ({assignment.subject})</p>
                        <p className="text-sm text-gray-600 flex items-center"><Clock size={16} className="mr-1"/> Due: {assignment.dueDate}</p>
                        <p className="text-sm flex items-center">Status:
                          <span className={`font-semibold ml-1 ${
                            assignment.status === 'GRADED' ? 'text-green-600' :
                            assignment.status.includes('PENDING') ? 'text-yellow-600' : // Covers PENDING and SUBMITTED_PENDING_GRADE
                            'text-red-600'
                          }`}>
                            {assignment.status}
                          </span>
                          {assignment.grade !== null && <span className="ml-2 text-gray-700">({assignment.grade}/{assignment.maxMarks} marks)</span>}
                        </p>
                        {assignment.teacherFeedback && <p className="text-sm text-gray-500 italic mt-1">Teacher Feedback: "{assignment.teacherFeedback}"</p>}
                      </div>
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                        {/* Only allow submission if status is PENDING */}
                        {assignment.status === 'PENDING' && (
                          <button
                            onClick={() => handleOpenSubmissionModal(assignment)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center justify-center"
                          >
                            <CheckCircle size={16} className="mr-1"/> Submit
                          </button>
                        )}
                        {/* Optionally add a "View Submission" button if status is submitted/graded */}
                        {(assignment.status === 'GRADED' || assignment.status.includes('SUBMITTED')) && (
                            <button
                              // onClick={() => handleViewSubmission(assignment)} // Implement this later
                              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm flex items-center justify-center"
                              disabled // For now, it's just a placeholder
                            >
                              View Submission
                            </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 text-center py-4">No assignments assigned to you yet.</p>
              )}
            </div>
          </div>
        );

      default:
        return <div className="main-content">Oops! Something went wrong.</div>; // Fallback
    }
  };

  return (
    <div className="student-portal-main-wrapper">
      {/* This main wrapper will contain either the dashboard or the assignments view */}
      {renderStudentContent()}

      {/* Assignment Submission Modal - remains outside renderStudentContent for global access */}
      {isSubmissionModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50"> {/* Added z-50 for modal */}
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Submit Assignment: "{selectedAssignmentForSubmission?.title}"</h3>
            <p className="text-sm text-gray-600 mb-4">Due: {selectedAssignmentForSubmission?.dueDate}</p>
            <form onSubmit={handleAssignmentSubmission}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="submissionText">Your Submission (Text)</label>
                <textarea id="submissionText" name="submissionText" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" rows="6" placeholder="Type your answers here..."></textarea>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="submissionFile">Upload File (Optional)</label>
                <input type="file" id="submissionFile" name="submissionFile" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={handleCloseSubmissionModal} className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded">Cancel</button>
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded">Submit Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentPortal;