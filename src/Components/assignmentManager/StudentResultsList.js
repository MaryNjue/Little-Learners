import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import StudentAnswersView from './StudentAnswersView';

const API_BASE_URL = 'https://little-learners-2i8y.onrender.com'

const StudentResultsList = ({ assignmentId, onBack }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/answers/teacher/assignment/${assignmentId}`);
        const data = await res.json();

        // Compute total score for each student
        const mapped = data.map(student => ({
          ...student,
          totalScore: student.answers.filter(a => a.isCorrect).length,
          totalQuestions: student.answers.length
        }));
        setStudents(mapped);
      } catch (err) {
        console.error('Failed to fetch student results', err);
      } finally {
        setLoading(false);
      }
    };
    if (assignmentId) {
      fetchResults();
    }
  }, [assignmentId]);

  if (selectedStudent) {
    return (
      <StudentAnswersView
        student={selectedStudent}
        assignmentId={assignmentId}   // ✅ pass assignmentId only
        onBack={() => setSelectedStudent(null)}
      />
    );
  }

  return (
    <div className="assignment-dashboard-container">
      <button onClick={onBack} className="back-to-dashboard-button mb-4">
        <ArrowLeft size={20} /> Back to Assignments
      </button>

      <h2 className="section-title mb-4">Student Results</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="student-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Total Score</th>
              <th>Total Questions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.studentId}>
                <td>{student.studentName}</td>
                <td>{student.totalScore}</td>
                <td>{student.totalQuestions}</td>
                <td>
                  <button
                    onClick={() => setSelectedStudent(student)}
                    className="table-action-button view"
                    title="View Answers"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StudentResultsList;
