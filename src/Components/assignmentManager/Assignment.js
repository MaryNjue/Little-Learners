// src/Components/assignmentManager/AssignmentManager.js
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, ClipboardList, Files, Clock, CheckCircle } from 'lucide-react'; // Added more icons
import '../../App.css'; // For general styles
import '../assignmentManager/Assignment.css'; // Specific styles for AssignmentManager

function AssignmentManager({ loggedInTeacherId, loggedInTeacherUsername }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null); // For editing
  const [searchTerm, setSearchTerm] = useState('');
  const [showTableView, setShowTableView] = useState(false); // New state to toggle between dashboard and table view

  // UseEffect for simulating data fetch
  useEffect(() => {
    console.log("AssignmentManager: Starting data fetch simulation...");
    setLoading(true);
    setError(null);

    setTimeout(() => {
      try {
        const dummyAssignments = [
          {
            id: 'a1',
            title: 'Algebra Basics Worksheet',
            subject: 'Mathematics',
            dueDate: '2025-08-15',
            status: 'Published',
            maxMarks: 10,
            description: 'Review of basic algebraic expressions and equations.',
            assignedTo: 'All Students',
            createdAt: '2025-07-20',
            submitted: 8, // Dummy submission count
            graded: 5,   // Dummy graded count
          },
          {
            id: 'a2',
            title: 'Essay: My Summer Vacation',
            subject: 'English',
            dueDate: '2025-08-20',
            status: 'Draft',
            maxMarks: 20,
            description: 'Write a short essay about your summer vacation experiences.',
            assignedTo: 'Grade 3 A',
            createdAt: '2025-07-22',
            submitted: 0,
            graded: 0,
          },
          {
            id: 'a3',
            title: 'Science Experiment: Plant Growth',
            subject: 'Science',
            dueDate: '2025-08-25',
            status: 'Published',
            maxMarks: 15,
            description: 'Observe and record the growth of a plant over two weeks.',
            assignedTo: 'All Students',
            createdAt: '2025-07-25',
            submitted: 12,
            graded: 10,
          },
          {
            id: 'a4',
            title: 'History Project: Ancient Civilizations',
            subject: 'History',
            dueDate: '2025-09-01',
            status: 'Published',
            maxMarks: 25,
            description: 'Research and present on an ancient civilization of your choice.',
            assignedTo: 'Grade 4',
            createdAt: '2025-07-28',
            submitted: 5,
            graded: 2,
          },
        ];
        setAssignments(dummyAssignments);
        console.log("AssignmentManager: Data fetched successfully.");
      } catch (err) {
        console.error("AssignmentManager: Error during data simulation:", err);
        setError("Failed to load assignments: " + err.message);
      } finally {
        setLoading(false);
        console.log("AssignmentManager: Loading simulation finished.");
      }
    }, 1000); // Shorter simulation time for quicker testing
  }, []);

  // Calculate dashboard overview data
  const totalAssignments = assignments.length;
  const publishedAssignments = assignments.filter(a => a.status === 'Published').length;
  const draftAssignments = assignments.filter(a => a.status === 'Draft').length;
  const pendingSubmissions = assignments.reduce((sum, a) => {
    // This is simplified. In a real app, you'd fetch actual submission counts
    // and total students assigned to determine pending.
    // For now, let's assume total students are 25 for demo purposes.
    const totalAssignedStudents = 25; // Example
    return sum + (totalAssignedStudents - (a.submitted || 0));
  }, 0);
  const assignmentsToGrade = assignments.reduce((sum, a) => sum + ((a.submitted || 0) - (a.graded || 0)), 0);


  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddAssignment = () => {
    setCurrentAssignment(null);
    setIsModalOpen(true);
  };

  const handleEditAssignment = (assignment) => {
    setCurrentAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleDeleteAssignment = (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      setAssignments(assignments.filter(assignment => assignment.id !== id));
      console.log(`Assignment with ID ${id} deleted.`);
      alert('Assignment deleted successfully!');
    }
  };

  const handleSaveAssignment = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newAssignment = {
      id: currentAssignment ? currentAssignment.id : Date.now().toString(),
      title: formData.get('title'),
      subject: formData.get('subject'),
      dueDate: formData.get('dueDate'),
      maxMarks: parseInt(formData.get('maxMarks')),
      status: formData.get('status'),
      description: formData.get('description'),
      assignedTo: formData.get('assignedTo') || 'All Students',
      createdAt: currentAssignment ? currentAssignment.createdAt : new Date().toISOString().split('T')[0],
      submitted: currentAssignment ? currentAssignment.submitted : 0, // Preserve/initialize
      graded: currentAssignment ? currentAssignment.graded : 0,     // Preserve/initialize
    };

    if (currentAssignment) {
      setAssignments(assignments.map(assign =>
        assign.id === newAssignment.id ? newAssignment : assign
      ));
      console.log('Assignment updated:', newAssignment);
      alert('Assignment updated successfully!');
    } else {
      setAssignments([...assignments, newAssignment]);
      console.log('New assignment added:', newAssignment);
      alert('Assignment added successfully!');
    }
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentAssignment(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg font-semibold text-gray-700">Loading assignment data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-red-600">
        <p>Error loading assignments: {error}</p>
      </div>
    );
  }

  // Render the dashboard view or the table view based on showTableView state
  return (
    <div className="assignment-dashboard-container">
      <h2 className="main-title">
        <ClipboardList className="main-title-icon" /> Assignment Overview
      </h2>

      {/* Conditional rendering for either Dashboard or Table */}
      {!showTableView ? (
        <>
          {/* Overview Cards */}
          <div className="dashboard-cards-grid">
            <DashboardCard
              title="Total Assignments"
              value={totalAssignments}
              icon={<Files />}
              bgColorClass="bg-blue-50"
              textColorClass="text-blue-700"
            />
            <DashboardCard
              title="Published"
              value={publishedAssignments}
              icon={<CheckCircle />}
              bgColorClass="bg-green-50"
              textColorClass="text-green-700"
            />
            <DashboardCard
              title="Drafts"
              value={draftAssignments}
              icon={<ClipboardList />}
              bgColorClass="bg-yellow-50"
              textColorClass="text-yellow-700"
            />
            <DashboardCard
              title="Pending Grading"
              value={assignmentsToGrade}
              icon={<Clock />}
              bgColorClass="bg-red-50"
              textColorClass="text-red-700"
            />
          </div>

          {/* My Assignments / Manage Section */}
          <div className="section-card my-assignments-section">
            <h3 className="section-title">My Assignments</h3>
            <p className="section-description">View, manage, and track all your assignments.</p>
            <button
              onClick={() => setShowTableView(true)}
              className="manage-button"
            >
              <ClipboardList className="mr-2" size={20} /> Manage All Assignments
            </button>
          </div>

          {/* Quick Actions */}
          <div className="section-card quick-actions-section">
            <h3 className="section-title">Quick Actions</h3>
            <div className="quick-actions-grid">
              <button className="quick-action-button" onClick={handleAddAssignment}>
                <Plus className="icon" /> Create New Assignment
              </button>
              <button className="quick-action-button" onClick={() => alert('Feature: Upload Assignment File (e.g., PDF, Doc)')}>
                <Files className="icon" /> Upload Assignment
              </button>
              <button className="quick-action-button" onClick={() => alert('Feature: Grade Submitted Work')}>
                <CheckCircle className="icon" /> Grade Work
              </button>
              <button className="quick-action-button" onClick={() => alert('Feature: View Assignment Submissions')}>
                <ClipboardList className="icon" /> View Submissions
              </button>
            </div>
          </div>

          {/* Recent Activity (Placeholder) */}
          <div className="section-card recent-activity-section">
            <h3 className="section-title">Recent Assignment Activity</h3>
            <ul className="activity-list">
              <li>"Algebra Basics Worksheet" was published.</li>
              <li>"Science Experiment" received 5 new submissions.</li>
              <li>"Essay: My Summer Vacation" is still in draft mode.</li>
              <li>3 assignments were graded today.</li>
            </ul>
          </div>
        </>
      ) : (
        // Render the detailed assignment table when showTableView is true
        <div className="detailed-assignment-table">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-2xl font-bold text-gray-800">All Assignments</h3>
             <button
               onClick={() => setShowTableView(false)}
               className="back-to-dashboard-button"
             >
               <X size={20} className="mr-1" /> Back to Dashboard
             </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
            <div className="relative w-full sm:w-1/3">
              <input
                type="text"
                placeholder="Search assignments..."
                className="pl-10 pr-4 py-2 border rounded-full w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <button
              onClick={handleAddAssignment}
              className="px-6 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="mr-2" size={20} /> Add New Assignment
            </button>
          </div>

          <div className="overflow-x-auto bg-white rounded-lg shadow">
            {filteredAssignments.length > 0 ? (
              <table className="min-w-full table-auto border-collapse">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Max Marks</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAssignments.map(assignment => (
                    <tr key={assignment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{assignment.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{assignment.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{assignment.dueDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          assignment.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {assignment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{assignment.maxMarks}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => handleEditAssignment(assignment)}
                          className="text-blue-600 hover:text-blue-900 mr-3 p-1 rounded-full hover:bg-blue-100 transition-colors"
                          title="Edit Assignment"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition-colors"
                          title="Delete Assignment"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-6 text-center text-gray-600">No assignments found. Click "Add New Assignment" to create one!</p>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Assignment Modal (remains the same) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {currentAssignment ? 'Edit Assignment' : 'Add New Assignment'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveAssignment} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Assignment Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  defaultValue={currentAssignment?.title || ''}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  defaultValue={currentAssignment?.subject || ''}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  defaultValue={currentAssignment?.dueDate || ''}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="maxMarks" className="block text-sm font-medium text-gray-700">Max Marks</label>
                <input
                  type="number"
                  id="maxMarks"
                  name="maxMarks"
                  defaultValue={currentAssignment?.maxMarks || ''}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  id="status"
                  name="status"
                  defaultValue={currentAssignment?.status || 'Draft'}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={currentAssignment?.description || ''}
                  rows="3"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition-colors"
                >
                  {currentAssignment ? 'Update Assignment' : 'Add Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Dashboard Card Component for Assignment Overview
function DashboardCard({ title, value, icon, bgColorClass, textColorClass }) {
  return (
    <div className={`dashboard-card ${bgColorClass} ${textColorClass}`}>
      <div className="card-icon-wrapper">
        {icon}
      </div>
      <div>
        <h3 className="card-title">{title}</h3>
        <p className="card-value">{value}</p>
      </div>
    </div>
  );
}

export default AssignmentManager;