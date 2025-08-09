import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { Plus, Edit, Trash2, Search, X, ClipboardList, Files, Clock, CheckCircle } from 'lucide-react';
import '../../App.css';
import '../assignmentManager/Assignment.css';

// AssignmentManager component now accepts db and appId as props
function AssignmentManager({ db, appId }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTableView, setShowTableView] = useState(false);

  // Form state, controlled components
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    dueDate: '',
    subject: '',
    status: 'Draft',
    maxMarks: '',
    assignmentType: 'uploaded',
    fileUrl: '',
    automatedConfig: '',
    assignedTo: 'all',
    assignedStudentIds: '', // Stored as a comma-separated string for now
  });

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  // --- Firestore Data Functions ---

  useEffect(() => {
    if (!db || !appId || !userId) {
      console.warn("Firestore, App ID, or User ID not available. Cannot fetch assignments.");
      setLoading(false);
      return;
    }

    const assignmentsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/assignments`);

    // Use onSnapshot for real-time updates
    const unsubscribe = onSnapshot(assignmentsCollectionRef, (snapshot) => {
      const fetchedAssignments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAssignments(fetchedAssignments);
      setLoading(false);
      console.log("Assignments fetched in real-time:", fetchedAssignments);
    }, (err) => {
      console.error("Error fetching assignments in real-time:", err);
      setError("Failed to load assignments: " + err.message);
      setLoading(false);
    });

    // Cleanup function to unsubscribe from the listener
    return () => unsubscribe();
  }, [db, appId, userId]);

  // --- Handlers for UI Actions ---

  const handleAddAssignment = () => {
    setCurrentAssignment(null);
    setFormState({
      title: '', description: '', dueDate: '', subject: '', status: 'Draft',
      maxMarks: '', assignmentType: 'uploaded', fileUrl: '',
      automatedConfig: '', assignedTo: 'all', assignedStudentIds: ''
    });
    setIsModalOpen(true);
  };

  const handleEditAssignment = (assignment) => {
    setCurrentAssignment(assignment);
    setFormState({
      title: assignment.title || '',
      description: assignment.description || '',
      dueDate: assignment.dueDate || '',
      subject: assignment.subject || '',
      status: assignment.status || 'Draft',
      maxMarks: assignment.maxMarks || '',
      assignmentType: assignment.assignmentType || 'uploaded',
      fileUrl: assignment.fileUrl || '',
      automatedConfig: assignment.automatedConfig || '',
      assignedTo: assignment.assignedTo || 'all',
      // Convert the assignedStudentIds array back to a comma-separated string for the form
      assignedStudentIds: Array.isArray(assignment.assignedStudentIds) ? assignment.assignedStudentIds.join(', ') : '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteAssignment = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        const assignmentDocRef = doc(db, `artifacts/${appId}/users/${userId}/assignments`, id);
        await deleteDoc(assignmentDocRef);
        alert('Assignment deleted successfully!');
        console.log(`Assignment with ID ${id} deleted.`);
      } catch (err) {
        console.error("Failed to delete assignment:", err);
        setError("Failed to delete assignment: " + err.message);
        alert('Failed to delete assignment: ' + err.message);
      }
    }
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();

    if (!db || !appId || !userId) {
      alert("Application not ready. Please try again.");
      return;
    }

    const assignmentData = {
      ...formState,
      teacherId: userId,
      createdAt: new Date().toISOString(),
      // Convert the assignedStudentIds string back to an array for Firestore
      assignedStudentIds: formState.assignedTo === 'specific' ? formState.assignedStudentIds.split(',').map(id => id.trim()).filter(id => id) : null,
      maxMarks: formState.maxMarks ? parseInt(formState.maxMarks, 10) : null,
      automatedConfig: formState.automatedConfig || null,
      fileUrl: formState.fileUrl || null,
    };
    
    // Remove the temporary string field before saving to Firestore
    delete assignmentData.assignedStudentIdsString;

    console.log("Saving assignment data to Firestore:", assignmentData);

    try {
      if (currentAssignment) {
        // Update existing assignment
        const assignmentDocRef = doc(db, `artifacts/${appId}/users/${userId}/assignments`, currentAssignment.id);
        await updateDoc(assignmentDocRef, assignmentData);
      } else {
        // Create new assignment
        const assignmentsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/assignments`);
        await addDoc(assignmentsCollectionRef, assignmentData);
      }

      alert(`Assignment ${currentAssignment ? 'updated' : 'added'} successfully!`);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save assignment:", err);
      setError("Failed to save assignment: " + err.message);
      alert('Failed to save assignment: ' + err.message);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentAssignment(null);
  };

  // Simplified Dashboard calculation
  const totalAssignments = assignments.length;
  const publishedAssignments = assignments.filter(a => a.status === 'Published').length;
  const draftAssignments = assignments.filter(a => a.status === 'Draft').length;
  // These will be 0 for now as the data isn't in this collection
  const assignmentsToGrade = 0;
  const pendingSubmissions = 0;

  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="assignment-dashboard-container">
      <h2 className="main-title">
        <ClipboardList className="main-title-icon" /> Assignment Overview
      </h2>

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
              {assignments.slice(0, 3).map(assign => (
                <li key={assign.id}>"{assign.title}" was {assign.status === 'Published' ? 'published' : 'drafted'}.</li>
              ))}
              {assignments.length === 0 && <li>No recent activity. Create an assignment to see updates!</li>}
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
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created At</th>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {assignment.assignedTo === 'all' ? 'All Students' : 'Specific Students'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{assignment.assignmentType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                         {assignment.createdAt ? new Date(assignment.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
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

      {/* Add/Edit Assignment Modal */}
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
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
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
                  value={formState.subject}
                  onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
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
                  value={formState.dueDate}
                  onChange={(e) => setFormState({ ...formState, dueDate: e.target.value })}
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
                  value={formState.maxMarks}
                  onChange={(e) => setFormState({ ...formState, maxMarks: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formState.status}
                  onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>

              {/* New fields for Assignment */}
              <div>
                <label htmlFor="assignmentType" className="block text-sm font-medium text-gray-700">Assignment Type</label>
                <select
                  id="assignmentType"
                  name="assignmentType"
                  value={formState.assignmentType}
                  onChange={(e) => setFormState({ ...formState, assignmentType: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="uploaded">Uploaded File</option>
                  <option value="quiz">Quiz</option>
                  <option value="text">Text Entry</option>
                </select>
              </div>

              {formState.assignmentType === 'uploaded' && (
                <div>
                  <label htmlFor="fileUrl" className="block text-sm font-medium text-gray-700">File URL (Optional)</label>
                  <input
                    type="url"
                    id="fileUrl"
                    name="fileUrl"
                    value={formState.fileUrl}
                    onChange={(e) => setFormState({ ...formState, fileUrl: e.target.value })}
                    placeholder="e.g., https://example.com/assignment.pdf"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {formState.assignmentType === 'quiz' && (
                <div>
                  <label htmlFor="automatedConfig" className="block text-sm font-medium text-gray-700">Automated Quiz Config (JSON)</label>
                  <textarea
                    id="automatedConfig"
                    name="automatedConfig"
                    value={formState.automatedConfig}
                    onChange={(e) => setFormState({ ...formState, automatedConfig: e.target.value })}
                    rows="3"
                    placeholder='{"questions": [{"q": "What is 2+2?", "a": "4"}]}'
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>
              )}

              <div>
                <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">Assign To</label>
                <select
                  id="assignedTo"
                  name="assignedTo"
                  value={formState.assignedTo}
                  onChange={(e) => setFormState({ ...formState, assignedTo: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="all">All Students</option>
                  <option value="specific">Specific Students</option>
                </select>
              </div>

              {formState.assignedTo === 'specific' && (
                <div>
                  <label htmlFor="assignedStudentIds" className="block text-sm font-medium text-gray-700">
                    Assigned Student IDs (Comma-separated UUIDs for now)
                  </label>
                  <input
                    type="text"
                    id="assignedStudentIds"
                    name="assignedStudentIds"
                    value={formState.assignedStudentIds}
                    onChange={(e) => setFormState({ ...formState, assignedStudentIds: e.target.value })}
                    placeholder="e.g., uuid1, uuid2, uuid3"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                      Note: In a full implementation, this would be a multi-select dropdown populated from your student list.
                  </p>
                </div>
              )}

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
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

// Reusable Dashboard Card Component
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
