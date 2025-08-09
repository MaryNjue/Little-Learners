import React, { useState, useEffect } from 'react';
import '../StudentManager/StudentManager.css';
import firebaseApp from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Search, Users, Plus, TrendingUp, TrendingDown, X } from 'lucide-react';

// Initialize Firebase services
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

function StudentManagement({ loggedInTeacherId, loggedInTeacherUsername }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 7;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!auth.currentUser) {
        throw new Error("User not authenticated");
      }
      
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`http://localhost:8080/api/students/teacher/${auth.currentUser.uid}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      setError("Failed to load students. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student =>
    student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.regNum.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalStudentsCount = students.length;
  const mostPerformingStudent = students.length > 0 ? 
    students.reduce((prev, current) => (prev.performanceScore > current.performanceScore ? prev : current), students[0]) : null;
  const leastPerformingStudent = students.length > 0 ? 
    students.reduce((prev, current) => (prev.performanceScore < current.performanceScore ? prev : current), students[0]) : null;

  const handleToggleActive = async (studentId) => {
    try {
      const studentToUpdate = students.find(student => student.id === studentId);
      if (!studentToUpdate) return;

      const updatedStudentData = { 
        ...studentToUpdate, 
        isActive: !studentToUpdate.isActive,
        teacherFirebaseUid: auth.currentUser.uid
      };

      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`http://localhost:8080/api/students/${studentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedStudentData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchStudents();
    } catch (err) {
      console.error("Failed to toggle student status:", err);
      setError("Failed to update student status.");
    }
  };

  const handleAddStudent = () => {
    setCurrentStudent(null);
    setIsModalOpen(true);
  };

  const handleEditStudent = (studentId) => {
    const studentToEdit = students.find(student => student.id === studentId);
    setCurrentStudent(studentToEdit);
    setIsModalOpen(true);
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`http://localhost:8080/api/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchStudents();
    } catch (err) {
      console.error("Failed to delete student:", err);
      setError("Failed to delete student.");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentStudent(null);
  };

  const handleSubmitStudentForm = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.target);
      const studentData = {
        fullName: formData.get('fullName'),
        regNum: formData.get('regNum'),
        grade: parseInt(formData.get('grade')),
        gender: formData.get('gender'),
        parentName: formData.get('parentName'),
        performanceScore: parseInt(formData.get('performanceScore')),
        isActive: formData.get('isActive') === 'on',
        teacherFirebaseUid: auth.currentUser.uid
      };

      let url = 'http://localhost:8080/api/students';
      let method = 'POST';

      if (currentStudent) {
        url = `http://localhost:8080/api/students/${currentStudent.id}`;
        method = 'PUT';
      }

      const token = await auth.currentUser.getIdToken();
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      await fetchStudents();
      alert(`Student ${studentData.fullName} ${currentStudent ? 'updated' : 'added'} successfully!`);
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save student:", err);
      setError(err.message || "Failed to save student.");
    }
  };

  // Your existing UI code remains exactly the same below this point
  return (
    <div className="student-management-container">
      {/* Overview Cards Section */}
      <div className="overview-cards-grid">
        <div className="overview-card total-students-card">
          <div className="card-icon"><Users /></div>
          <div className="card-content">
            <span className="card-label">Total Students</span>
            <span className="card-value">{totalStudentsCount}</span>
          </div>
        </div>
        <div className="overview-card most-performing-card">
          <div className="card-icon"><TrendingUp /></div>
          <div className="card-content">
            <span className="card-label">Most Performing Student</span>
            <span className="card-value">{mostPerformingStudent ? mostPerformingStudent.fullName : 'N/A'}</span>
            <span className="card-sub-value">Score: {mostPerformingStudent ? mostPerformingStudent.performanceScore : 'N/A'}%</span>
          </div>
        </div>
        <div className="overview-card least-performing-card">
          <div className="card-icon"><TrendingDown /></div>
          <div className="card-content">
            <span className="card-label">Least Performing Student</span>
            <span className="card-value">{leastPerformingStudent ? leastPerformingStudent.fullName : 'N/A'}</span>
            <span className="card-sub-value">Score: {leastPerformingStudent ? leastPerformingStudent.performanceScore : 'N/A'}%</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search student by Reg No or Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="add-student-button" onClick={handleAddStudent}>
          <Plus className="add-student-icon" />
          Add Student
        </button>
      </div>

      {/* Conditional rendering for loading, error, and no students */}
      {loading && <p className="loading-message">Loading students...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && students.length === 0 && (
        <p className="no-students-message">No students found. Add one now!</p>
      )}

      {/* Student List Table */}
      {!loading && !error && students.length > 0 && (
        <div className="student-list-section">
          <table className="student-table">
            <thead>
              <tr>
                <th><input type="checkbox" /></th>
                <th>Full Name</th>
                <th>Reg Num</th>
                <th>Grade</th>
                <th>Gender</th>
                <th>Active</th>
                <th>Parent's Name</th>
                <th>Performance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map(student => (
                <tr key={student.id}>
                  <td><input type="checkbox" /></td>
                  <td className="student-name-cell">
                    {student.fullName}
                  </td>
                  <td>{student.regNum}</td>
                  <td>{student.grade}</td>
                  <td>{student.gender}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={student.isActive}
                      onChange={() => handleToggleActive(student.id)}
                      className="active-checkbox"
                    />
                  </td>
                  <td>{student.parentName}</td>
                  <td>{student.performanceScore}%</td>
                  <td>
                    <button onClick={() => handleEditStudent(student.id)} className="table-action-button view">Edit</button>
                    <button onClick={() => handleDeleteStudent(student.id)} className="table-action-button delete">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="pagination-button">
              ← Previous
            </button>
            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`page-number-button ${currentPage === i + 1 ? 'active' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-button">
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Student Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{currentStudent ? 'Edit Student' : 'Add New Student'}</h2>
              <button className="modal-close-button" onClick={handleCloseModal}>
                <X />
              </button>
            </div>
            <form onSubmit={handleSubmitStudentForm} className="modal-form">
              <div className="form-group">
                <label htmlFor="fullName">Full Name:</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  defaultValue={currentStudent ? currentStudent.fullName : ''}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="regNum">Registration Number:</label>
                <input
                  type="text"
                  id="regNum"
                  name="regNum"
                  defaultValue={currentStudent ? currentStudent.regNum : ''}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="grade">Grade:</label>
                <input
                  type="number"
                  id="grade"
                  name="grade"
                  defaultValue={currentStudent ? currentStudent.grade : ''}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="gender">Gender:</label>
                <select
                  id="gender"
                  name="gender"
                  defaultValue={currentStudent ? currentStudent.gender : ''}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="parentName">Parent's Name:</label>
                <input
                  type="text"
                  id="parentName"
                  name="parentName"
                  defaultValue={currentStudent ? currentStudent.parentName : ''}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="performanceScore">Performance Score (%):</label>
                <input
                  type="number"
                  id="performanceScore"
                  name="performanceScore"
                  defaultValue={currentStudent ? currentStudent.performanceScore : ''}
                  min="0"
                  max="100"
                  required
                />
              </div>
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  defaultChecked={currentStudent ? currentStudent.isActive : true}
                />
                <label htmlFor="isActive">Active Student</label>
              </div>
              <div className="modal-actions">
                <button type="submit" className="modal-save-button">
                  {currentStudent ? 'Save Changes' : 'Add Student'}
                </button>
                <button type="button" onClick={handleCloseModal} className="modal-cancel-button">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentManagement;