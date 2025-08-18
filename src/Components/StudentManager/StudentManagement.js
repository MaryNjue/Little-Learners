import React, { useState, useEffect } from 'react';
import '../StudentManager/StudentManager.css';
import firebaseApp from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { Search, Users, Plus, TrendingUp, TrendingDown, X } from 'lucide-react';

const auth = getAuth(firebaseApp);

function StudentManagement({ loggedInTeacherId, loggedInTeacherUsername }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 7;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);

  const API_BASE_URL = ' https://51ac16eb448b.ngrok-free.app';

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!auth.currentUser) throw new Error("User not authenticated");

      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/students/teacher/${auth.currentUser.uid}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

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
      const studentToUpdate = students.find(s => s.id === studentId);
      if (!studentToUpdate) return;

      const updatedStudentData = { 
        ...studentToUpdate, 
        isActive: !studentToUpdate.isActive,
        teacherFirebaseUid: auth.currentUser.uid
      };

      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updatedStudentData),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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
    const studentToEdit = students.find(s => s.id === studentId);
    setCurrentStudent(studentToEdit);
    setIsModalOpen(true);
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/students/${studentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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

  // ✅ Single-request flow: send everything to /api/students (no separate /api/users call)
  const handleSubmitStudentForm = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const token = await auth.currentUser.getIdToken();

      const basePayload = {
        fullName: formData.get('fullName'),
        regNum: formData.get('regNum'),
        grade: parseInt(formData.get('grade'), 10),
        gender: formData.get('gender'),
        parentName: formData.get('parentName'),
        performanceScore: parseInt(formData.get('performanceScore'), 10),
        isActive: formData.get('isActive') === 'on',
        teacherFirebaseUid: auth.currentUser.uid
      };

      // 🔁 Always include email and password for BOTH create and update
      const studentData = {
        ...basePayload,
        email: formData.get('email'),
        password: formData.get('password')
      };

      const url = currentStudent
        ? `${API_BASE_URL}/api/students/${currentStudent.id}`
        : `${API_BASE_URL}/api/students`;
      const method = currentStudent ? 'PUT' : 'POST';

      const studentResponse = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(studentData),
      });

      if (!studentResponse.ok) {
        // Try to parse server error for a clearer message
        let serverMsg = '';
        try {
          const errorData = await studentResponse.json();
          serverMsg = errorData.message || '';
        } catch (_) {}
        throw new Error(serverMsg || `HTTP error! status: ${studentResponse.status}`);
      }

      await fetchStudents();
      alert(`Student ${studentData.fullName} ${currentStudent ? 'updated' : 'added'} successfully!`);
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save student:", err);
      setError(err.message || "Failed to save student.");
    }
  };

  return (
    <div className="student-management-container">
      {/* Overview Cards */}
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

      {/* Search & Add */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input type="text" placeholder="Search student by Reg No or Name" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="search-input"/>
        </div>
        <button className="add-student-button" onClick={handleAddStudent}>
          <Plus className="add-student-icon"/> Add Student
        </button>
      </div>

      {/* Table */}
      {!loading && !error && students.length > 0 && (
        <div className="student-list-section">
          <table className="student-table">
            <thead>
              <tr>
                <th><input type="checkbox"/></th>
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
                  <td><input type="checkbox"/></td>
                  <td>{student.fullName}</td>
                  <td>{student.regNum}</td>
                  <td>{student.grade}</td>
                  <td>{student.gender}</td>
                  <td>
                    <input type="checkbox" checked={student.isActive} onChange={() => handleToggleActive(student.id)} className="active-checkbox"/>
                  </td>
                  <td>{student.parentName}</td>
                  <td>{student.performanceScore}%</td>
                  <td>
                    <button className="table-action-button edit" onClick={() => handleEditStudent(student.id)}>Edit</button>
                    <button className="table-action-button delete" onClick={() => handleDeleteStudent(student.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{currentStudent ? 'Edit Student' : 'Add New Student'}</h2>
              <button className="modal-close-button" onClick={handleCloseModal}><X/></button>
            </div>
            <form onSubmit={handleSubmitStudentForm} className="modal-form">
              {/* Always show email & password for both create and edit */}
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={currentStudent?.email || ''}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  name="password"
                  placeholder={currentStudent ? 'Enter new password' : ''}
                  required
                />
              </div>

              <div className="form-group"><label>Full Name:</label><input type="text" name="fullName" defaultValue={currentStudent?.fullName||''} required/></div>
              <div className="form-group"><label>Registration Number:</label><input type="text" name="regNum" defaultValue={currentStudent?.regNum||''} required/></div>
              <div className="form-group"><label>Grade:</label><input type="number" name="grade" defaultValue={currentStudent?.grade||''} required/></div>
              <div className="form-group"><label>Gender:</label>
                <select name="gender" defaultValue={currentStudent?.gender||''} required>
                  <option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group"><label>Parent's Name:</label><input type="text" name="parentName" defaultValue={currentStudent?.parentName||''} required/></div>
              <div className="form-group"><label>Performance Score (%):</label><input type="number" name="performanceScore" defaultValue={currentStudent?.performanceScore||''} min="0" max="100" required/></div>
              <div className="form-group checkbox-group">
                <input type="checkbox" name="isActive" defaultChecked={currentStudent?.isActive ?? true}/>
                <label>Active Student</label>
              </div>
              <div className="modal-actions">
                <button type="submit" className="modal-save-button">{currentStudent ? 'Save Changes' : 'Add Student'}</button>
                <button type="button" className="modal-cancel-button" onClick={handleCloseModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentManagement;
