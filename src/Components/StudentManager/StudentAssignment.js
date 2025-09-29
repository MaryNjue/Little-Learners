import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, Clock, CheckCircle, Download, Star } from 'lucide-react'; 
import AssignmentQuizView from './AssignmentQuizView'; 
import '../StudentManager/StudentAssignment.css';

const API_BASE_URL = 'https://little-learners-2i8y.onrender.com';

function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [viewState, setViewState] = useState('list'); 
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const loggedInStudentId = localStorage.getItem("studentUserId");

  const fetchAssignments = () => {
    if (!loggedInStudentId) return;
    setIsLoading(true);

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

  useEffect(() => {
    fetchAssignments();
  }, [loggedInStudentId]); 

  const handleOpenQuiz = (assignment) => {
    setSelectedAssignment(assignment);
    setViewState('quiz');
  };

  const handleReturnToList = () => {
    setSelectedAssignment(null);
    setViewState('list');
    fetchAssignments(); 
  };

  if (viewState === 'quiz') {
    return (
      <AssignmentQuizView
        assignment={selectedAssignment}
        studentId={loggedInStudentId}
        onFinish={handleReturnToList}
      />
    );
  }

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
                
                {/* ✅ Status & Score */}
                <p className="assignment-status">
                  Status:{" "}
                  <span 
                    className={
                      a.status === 'COMPLETED' 
                        ? 'status-completed' 
                        : (a.status === 'GRADED' ? 'status-graded' : 'status-pending')
                    }
                  >
                    {a.status || 'PENDING'}
                  </span>

                  {/* Show grade if available */}
                  {a.grade !== null && a.maxMarks && (
                    <span className="grade-badge">
                      <Star size={14} className="mr-1 text-yellow-400" />
                      {a.grade}/{a.maxMarks}
                    </span>
                  )}
                </p>

                {a.teacherFeedback && (
                  <p className="assignment-feedback">Feedback: {a.teacherFeedback}</p>
                )}
              </div>

              <div className="assignment-actions">
                {a.fileUrl && (
                  <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="download-button">
                    <Download size={16} /> Download
                  </a>
                )}
                
                {/* ✅ Only show button if NOT completed */}
                {a.status !== 'COMPLETED' && a.status !== 'GRADED' ? (
                  <button onClick={() => handleOpenQuiz(a)} className="submit-button">
                    <CheckCircle size={16} /> Open & Answer
                  </button>
                ) : (
                  <span className="status-tag done">
                    {a.status === 'GRADED' ? 'View Grade' : 'Completed'}
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
