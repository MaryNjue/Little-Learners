import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, Clock, CheckCircle, Download } from 'lucide-react';
import '../StudentManager/StudentAssignment.css';


function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Get logged-in student ID from localStorage
  const loggedInStudentId = localStorage.getItem("studentUserId");

  // Fetch assignments from backend
  useEffect(() => {
    if (!loggedInStudentId) return;

    console.log("Fetching assignments for studentId:", loggedInStudentId);

    axios.get(`https://little-learners-2i8y.onrender.com/api/assignments/student/${loggedInStudentId}`)
      .then(res => {
        setAssignments(res.data);
      })
      .catch(err => {
        console.error("Failed to fetch assignments:", err);
        alert("Failed to load assignments. Please try again later.");
      });
  }, [loggedInStudentId]);

  // Open submission modal
  const handleOpenModal = (assignment) => {
    setSelectedAssignment(assignment);
    setIsSubmissionModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedAssignment(null);
    setIsSubmissionModalOpen(false);
  };

  // Submit assignment
  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    const fileInput = e.target.submissionFile.files[0];
    if (!fileInput) return alert("Please select a file to submit!");

    const formData = new FormData();
    formData.append("file", fileInput);

    try {
      await axios.post(
        `https://little-learners-2i8y.onrender.com/api/assignments/${selectedAssignment.id}/submit?userId=${loggedInStudentId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("Assignment submitted successfully!");
      setAssignments(prev =>
        prev.map(a =>
          a.id === selectedAssignment.id ? { ...a, status: 'SUBMITTED_PENDING_GRADE' } : a
        )
      );

      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert("Failed to submit assignment. Try again.");
    }
  };

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
  Status: <span className={a.status?.includes('PENDING') ? 'status-pending' : 'status-graded'}>
    {a.status || 'UNKNOWN'}
  </span>
  {a.grade !== null && <span> ({a.grade}/{a.maxMarks} marks)</span>}
</p>

                {a.teacherFeedback && <p className="assignment-feedback">Feedback: {a.teacherFeedback}</p>}
              </div>

              <div className="assignment-actions">
  {a.fileUrl && (
    <a href={a.fileUrl} target="_blank" rel="noopener noreferrer">
  Download Assignment
</a>
  )}
  {a.status === 'PENDING' && (
    <button onClick={() => handleOpenModal(a)} className="submit-button">
      <CheckCircle size={16} /> Submit
    </button>
  )}
</div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-assignments">No assignments assigned yet.</p>
      )}

      {/* Submission Modal */}
      {isSubmissionModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Submit Assignment: "{selectedAssignment?.title}"</h3>
            <p>Due: {selectedAssignment?.dueDate}</p>
            <form onSubmit={handleSubmitAssignment}>
              <div className="form-group">
                <label htmlFor="submissionFile">Upload File</label>
                <input type="file" id="submissionFile" name="submissionFile" required />
              </div>
              <div className="modal-buttons">
                <button type="button" onClick={handleCloseModal} className="cancel-btn">Cancel</button>
                <button type="submit" className="submit-btn">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentAssignments;
