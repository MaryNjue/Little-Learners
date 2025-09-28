import React, { useState, useEffect } from 'react';
import axios from 'axios';
// 🚨 FIX 1: Import 'Download' here. It was missing from the list.
import { ClipboardList, Clock, CheckCircle, Download } from 'lucide-react'; 
import AssignmentQuizView from './AssignmentQuizView'; 
import '../StudentManager/StudentAssignment.css';

const API_BASE_URL = 'https://little-learners-2i8y.onrender.com';

function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [viewState, setViewState] = useState('list'); // 'list' or 'quiz'
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get logged-in student ID from localStorage
  const loggedInStudentId = localStorage.getItem("studentUserId");

  // Fetch assignments from backend
  // 🚨 FIX 2: Define fetchAssignments inside useEffect's scope 
  // OR use useCallback, but for simple use, wrapping it in useEffect is cleanest.
  const fetchAssignments = () => {
    if (!loggedInStudentId) return;
    setIsLoading(true);

    console.log("Fetching assignments for studentId:", loggedInStudentId);

    axios.get(`${API_BASE_URL}/api/assignments/student/${loggedInStudentId}`)
      .then(res => {
        setAssignments(res.data);
      })
      .catch(err => {
        console.error("Failed to fetch assignments:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // 🚨 FIX 3: Include the stable function fetchAssignments in the dependency array
  useEffect(() => {
    fetchAssignments();
    // This dependency is now correct and avoids the warning.
  }, [loggedInStudentId]); 

  // Function to switch to quiz view
  const handleOpenQuiz = (assignment) => {
    setSelectedAssignment(assignment);
    setViewState('quiz');
  };

  // Function to return to the assignment list (used by AssignmentQuizView on finish)
  const handleReturnToList = () => {
    setSelectedAssignment(null);
    setViewState('list');
    // Re-fetch assignments to update status and grade after quiz submission
    fetchAssignments(); 
  };

  // ----------------------------------------------------
  // --- CONDITIONAL RENDERING ---
  // ----------------------------------------------------

  if (viewState === 'quiz') {
    // Render the new quiz component
    return (
      <AssignmentQuizView
        assignment={selectedAssignment}
        studentId={loggedInStudentId}
        onFinish={handleReturnToList}
      />
    );
  }

  // ----------------------------------------------------
  // --- LIST VIEW RENDERING ---
  // ----------------------------------------------------

  if (isLoading) {
    return (
      <div className="assignments-wrapper">
        <h2 className="assignments-title"><ClipboardList className="mr-2" /> My Assignments</h2>
        <p className="loading-text">Loading assignments...</p>
      </div>
    );
  }
  
  return (
    <div className="assignments-wrapper">
      <h2 className="assignments-title">
        <ClipboardList className="mr-2" /> My Assignments
      </h2>

      {assignments.length > 0 ? (
        <ul className="assignments-list">
          {assignments.map(a => (
            <li key={a.id} className="assignment-card">
              <div className="assignment-info">
                <p className="assignment-title">{a.title} ({a.subject})</p>
                <p className="assignment-due"><Clock size={16} /> Due: {a.dueDate}</p>
              <p className="assignment-status">
                Status: <span className={a.status === 'SUBMITTED_PENDING_GRADE' ? 'status-pending' : (a.status === 'GRADED' ? 'status-graded' : 'status-new')}>
                  {a.status || 'NEW'}
                </span>
                {a.grade !== null && <span> ({a.grade}/{a.maxMarks} marks)</span>}
              </p>

                {a.teacherFeedback && <p className="assignment-feedback">Feedback: {a.teacherFeedback}</p>}
              </div>

              <div className="assignment-actions">
                {/* File Download (Keep in case of supplementary files) */}
                {a.fileUrl && (
                  <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="download-button">
                    <Download size={16} /> Download
                  </a>
                )}
                
                {/* Action button based on status */}
                {a.status !== 'SUBMITTED_PENDING_GRADE' && a.status !== 'GRADED' ? (
                  <button onClick={() => handleOpenQuiz(a)} className="submit-button">
                    <CheckCircle size={16} /> Open & Answer
                  </button>
                ) : (
                  <span className={`status-tag ${a.status === 'GRADED' ? 'status-graded' : 'status-pending'}`}>
                    {a.status === 'GRADED' ? 'View Grade' : 'Awaiting Grade'}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-assignments">No assignments assigned yet.</p>
      )}
    </div>
  );
}

export default StudentAssignments;