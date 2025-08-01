import React from 'react';
import '../Components/StudentManager/StudentManager.css'; // Import its own dedicated CSS file

function StudentManagement() {
  // Dummy student data for now
  const students = [
    { id: 's1', name: 'Alice Smith', age: 4, class: 'Kinder A', parent: 'Mr. & Mrs. Smith' },
    { id: 's2', name: 'Bob Johnson', age: 5, class: 'Kinder B', parent: 'Ms. Johnson' },
    { id: 's3', name: 'Charlie Brown', age: 4, class: 'Kinder A', parent: 'Mrs. Brown' },
  ];

  return (
    <div className="student-management-container">
      <h1 className="teacher-dashboard-title mb-8">Student Management</h1>

      {/* Add New Student Section */}
      <div className="quick-actions-section mb-10"> {/* Reusing quick-actions-section for styling */}
        <h2 className="quick-actions-title">Add New Student</h2>
        <form className="student-form">
          <div className="form-group">
            <label htmlFor="studentName">Student Name:</label>
            <input type="text" id="studentName" name="studentName" required />
          </div>
          <div className="form-group">
            <label htmlFor="studentAge">Age:</label>
            <input type="number" id="studentAge" name="studentAge" required />
          </div>
          <div className="form-group">
            <label htmlFor="studentClass">Class:</label>
            <input type="text" id="studentClass" name="studentClass" required />
          </div>
          <div className="form-group">
            <label htmlFor="parentName">Parent Name:</label>
            <input type="text" id="parentName" name="parentName" required />
          </div>
          <div className="form-group">
            <label htmlFor="parentContact">Parent Contact (Email/Phone):</label>
            <input type="text" id="parentContact" name="parentContact" required />
          </div>
          <button type="submit" className="quick-action-button">Create Student Account</button>
        </form>
      </div>

      {/* Student List Section */}
      <div className="quick-actions-section"> {/* Reusing quick-actions-section for styling */}
        <h2 className="quick-actions-title">My Students</h2>
        {students.length === 0 ? (
          <p className="text-gray-600">No students added yet.</p>
        ) : (
          <table className="student-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Class</th>
                <th>Parent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td>{student.name}</td>
                  <td>{student.age}</td>
                  <td>{student.class}</td>
                  <td>{student.parent}</td>
                  <td>
                    <button className="table-action-button edit">Edit</button>
                    <button className="table-action-button delete">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default StudentManagement;
