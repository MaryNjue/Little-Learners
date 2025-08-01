import React, { useState } from 'react';
// Corrected CSS import path to match 'StudentManager' folder if that's your local setup
import '../StudentManager/StudentManager.css'; // Assuming StudentManagement.js is inside src/Components/StudentManager/

import { Search, Users, Plus, TrendingUp, TrendingDown, X } from 'lucide-react'; // Added X icon for closing modal

function StudentManagement() {
  // Dummy student data with 'isActive' boolean instead of 'age'
  const [students, setStudents] = useState([
    { id: 's1', avatar: 'https://placehold.co/40x40/FFC107/FFFFFF?text=TS', fullName: 'Tommy Smith', regNum: 'A123BC', grade: 7, gender: 'Male', isActive: true, parentName: 'Oliver Thompson', performanceScore: 95 },
    { id: 's2', avatar: 'https://placehold.co/40x40/FFC107/FFFFFF?text=LS', fullName: 'Lucy Brown', regNum: 'B456DE', grade: 12, gender: 'Female', isActive: true, parentName: 'Emily Thompson', performanceScore: 88 },
    { id: 's3', avatar: 'https://placehold.co/40x40/FFC107/FFFFFF?text=JW', fullName: 'Jake White', regNum: 'C789FG', grade: 3, gender: 'Male', isActive: false, parentName: 'James Smith', performanceScore: 72 },
    { id: 's4', avatar: 'https://placehold.co/40x40/FFC107/FFFFFF?text=EG', fullName: 'Ella Green', regNum: 'D012HI', grade: 10, gender: 'Female', isActive: true, parentName: 'Charlotte Smith', performanceScore: 60 },
    { id: 's5', avatar: 'https://placehold.co/40x40/FFC107/FFFFFF?text=MJ', fullName: 'Max Jones', regNum: 'E345JK', grade: 5, gender: 'Male', isActive: true, parentName: 'Henry Johnson', performanceScore: 98 }, // Most performing
    { id: 's6', avatar: 'https://placehold.co/40x40/FFC107/FFFFFF?text=ZL', fullName: 'Zoe Taylor', regNum: 'F678LM', grade: 9, gender: 'Female', isActive: false, parentName: 'Amelia Johnson', performanceScore: 81 },
    { id: 's7', avatar: 'https://placehold.co/40x40/FFC107/FFFFFF?text=LC', fullName: 'Leo Clark', regNum: 'G901NO', grade: 1, gender: 'Male', isActive: true, parentName: 'George Brown', performanceScore: 55 }, // Least performing
    { id: 's8', avatar: 'https://placehold.co/40x40/FFC107/FFFFFF?text=MA', fullName: 'Mia Adams', regNum: 'H234PQ', grade: 8, gender: 'Female', isActive: true, parentName: 'Isabella Brown', performanceScore: 79 },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 7; // Matching screenshot's visible rows

  // New states for modal management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null); // Student being edited, or null for new student

  // Filter students based on searchTerm
  const filteredStudents = students.filter(student =>
    student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.regNum.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic based on filteredStudents
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Dynamic data for overview cards
  const totalStudentsCount = students.length;
  // Ensure students array is not empty before calling reduce
  const mostPerformingStudent = students.length > 0 ? students.reduce((prev, current) => (prev.performanceScore > current.performanceScore ? prev : current), students[0]) : null;
  const leastPerformingStudent = students.length > 0 ? students.reduce((prev, current) => (prev.performanceScore < current.performanceScore ? prev : current), students[0]) : null;

  // Console logs to help debug performance updates
  console.log("Current students state:", students);
  console.log("Most Performing Student (on render):", mostPerformingStudent ? mostPerformingStudent.fullName : 'N/A', mostPerformingStudent ? mostPerformingStudent.performanceScore : 'N/A');
  console.log("Least Performing Student (on render):", leastPerformingStudent ? leastPerformingStudent.fullName : 'N/A', leastPerformingStudent ? leastPerformingStudent.performanceScore : 'N/A');


  // Handler for toggling student active status
  const handleToggleActive = (studentId) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === studentId ? { ...student, isActive: !student.isActive } : student
      )
    );
  };

  // Functions for CRUD operations (placeholders for now)
  const handleAddStudent = () => {
    setCurrentStudent(null); // Clear any previous student data for a new entry
    setIsModalOpen(true); // Open the modal
  };

  const handleEditStudent = (studentId) => {
    const studentToEdit = students.find(student => student.id === studentId);
    setCurrentStudent(studentToEdit); // Set the student data for editing
    setIsModalOpen(true); // Open the modal
  };

  const handleDeleteStudent = (studentId) => {
    const studentToDelete = students.find(student => student.id === studentId);
    if (window.confirm(`Are you sure you want to delete student ${studentToDelete ? studentToDelete.fullName : studentId}?`)) {
      setStudents(prevStudents => {
        const updatedStudents = prevStudents.filter(student => student.id !== studentId);
        // If the deleted student was the last one on the current page, go back one page
        if (currentStudents.length === 1 && currentPage > 1 && updatedStudents.length > 0) {
          setCurrentPage(currentPage - 1);
        } else if (updatedStudents.length === 0 && currentPage > 1) { // If no students left, go to page 1
          setCurrentPage(1);
        }
        return updatedStudents;
      });
      alert(`Student ${studentToDelete ? studentToDelete.fullName : studentId} deleted successfully!`);
    }
  };

  // Renamed from handleViewStudent to clarify its new purpose
  const handleViewOrEditStudent = (studentId) => {
    handleEditStudent(studentId); // Now calls edit function
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentStudent(null); // Clear current student when modal closes
  };

  const handleSubmitStudentForm = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const studentData = {
      fullName: formData.get('fullName'),
      regNum: formData.get('regNum'),
      grade: parseInt(formData.get('grade')),
      gender: formData.get('gender'),
      parentName: formData.get('parentName'),
      performanceScore: parseInt(formData.get('performanceScore')),
      isActive: formData.get('isActive') === 'on' ? true : false, // Checkbox value is 'on' if checked
    };

    if (currentStudent) {
      // Editing existing student
      setStudents(prevStudents =>
        prevStudents.map(student =>
          student.id === currentStudent.id ? { ...student, ...studentData } : student
        )
      );
      alert(`Student ${studentData.fullName} updated successfully!`);
    } else {
      // Adding new student
      // A more robust ID generation would be using a UUID library (e.g., uuidv4())
      // For now, a simple incrementing ID based on current length
      const newId = `s${students.length + 1}-${Date.now()}`; // Added timestamp for better uniqueness
      setStudents(prevStudents => [...prevStudents, { id: newId, ...studentData }]);
      alert(`New student ${studentData.fullName} added successfully!`);
    }
    handleCloseModal();
  };


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

      {/* Student List Table */}
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
                  {/* Changed button to trigger edit modal */}
                  <button onClick={() => handleViewOrEditStudent(student.id)} className="table-action-button view">Edit</button>
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
