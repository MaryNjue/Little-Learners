import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import { Plus, Edit, Trash2, Search, X, ClipboardList, Files, Clock, CheckCircle } from 'lucide-react';
import '../../App.css';
import '../assignmentManager/Assignment.css'; // Make sure this is correctly imported

// Reusable CustomConfirmModal component for deleting items
const CustomConfirmModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-content">
        <p className="confirm-modal-text">{message}</p>
        <div className="confirm-modal-actions">
          <button
            onClick={onCancel}
            className="confirm-cancel-button"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="confirm-button"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// Assignment Form Modal Component
const AssignmentFormModal = ({ isOpen, onClose, onSave, initialAssignment, db, appId, userId }) => {
  const [formState, setFormState] = useState(initialAssignment || {
    
    title: '',
    description: '',
    dueDate: '',
    subject: '',
    status: 'Draft',
    maxMarks: '',
    assignmentType: 'uploaded',
    automatedConfig: '',
    assignedTo: 'all',
    assignedStudentIds: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const storage = getStorage();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!db || !appId || !userId) {
      console.error("Application not ready. Please try again.");
      return;
    }

    const assignmentData = {
      ...formState,
      teacherId: userId,
      createdAt: initialAssignment ? initialAssignment.createdAt : new Date().toISOString(),
      assignedStudentIds: formState.assignedTo === 'specific' ? formState.assignedStudentIds.split(',').map(id => id.trim()).filter(id => id) : null,
      maxMarks: formState.maxMarks ? parseInt(formState.maxMarks, 10) : null,
      automatedConfig: formState.automatedConfig || null,
      fileUrl: formState.fileUrl || null,
    };
   
if (selectedFile) {
  const storageRef = ref(storage, `assignments/${userId}/${selectedFile.name}`);
  const snapshot = await uploadBytes(storageRef, selectedFile);
  assignmentData.fileUrl = await getDownloadURL(snapshot.ref);
}


    try {
      if (initialAssignment) {
        // Update existing assignment
        const assignmentDocRef = doc(db, `artifacts/${appId}/users/${userId}/assignments`, initialAssignment.id);
        await updateDoc(assignmentDocRef, assignmentData);
        console.log(`Assignment with ID ${initialAssignment.id} updated successfully.`);
      } else {
        // Create new assignment
        const assignmentsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/assignments`);
        await addDoc(assignmentsCollectionRef, assignmentData);
        console.log('New assignment added successfully!');
      }
      onSave(); // Close the modal and potentially refresh data
    } catch (err) {
      console.error("Failed to save assignment:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">
            {initialAssignment ? 'Edit Assignment' : 'Add New Assignment'}
          </h3>
          <button onClick={onClose} className="modal-close-button">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-field">
            <label htmlFor="title" className="form-label">Assignment Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formState.title}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="subject" className="form-label">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formState.subject}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="dueDate" className="form-label">Due Date</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formState.dueDate}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="maxMarks" className="form-label">Max Marks</label>
            <input
              type="number"
              id="maxMarks"
              name="maxMarks"
              value={formState.maxMarks}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="status" className="form-label">Status</label>
            <select
              id="status"
              name="status"
              value={formState.status}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="assignmentType" className="form-label">Assignment Type</label>
            <select
              id="assignmentType"
              name="assignmentType"
              value={formState.assignmentType}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="uploaded">Uploaded File</option>
              <option value="quiz">Quiz</option>
              <option value="text">Text Entry</option>
            </select>
          </div>

          {formState.assignmentType === 'uploaded' && (
            <div className="form-field">
              
              <input
               type="file"
               id="fileUpload"
               accept=".pdf,.doc,.docx"
               onChange={(e) => setSelectedFile(e.target.files[0])}
               className="form-input mt-2"
/>
            </div>
          )}

          {formState.assignmentType === 'quiz' && (
            <div className="form-field">
              <label htmlFor="automatedConfig" className="form-label">Automated Quiz Config (JSON)</label>
              <textarea
                id="automatedConfig"
                name="automatedConfig"
                value={formState.automatedConfig}
                onChange={handleInputChange}
                rows="3"
                placeholder='{"questions": [{"q": "What is 2+2?", "a": "4"}]}'
                className="form-textarea"
              ></textarea>
            </div>
          )}

          <div className="form-field">
            <label htmlFor="assignedTo" className="form-label">Assign To</label>
            <select
              id="assignedTo"
              name="assignedTo"
              value={formState.assignedTo}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="all">All Students</option>
              <option value="specific">Specific Students</option>
            </select>
          </div>

          {formState.assignedTo === 'specific' && (
            <div className="form-field">
              <label htmlFor="assignedStudentIds" className="form-label">
                Assigned Student IDs (Comma-separated UUIDs for now)
              </label>
              <input
                type="text"
                id="assignedStudentIds"
                name="assignedStudentIds"
                value={formState.assignedStudentIds}
                onChange={handleInputChange}
                placeholder="e.g., uuid1, uuid2, uuid3"
                className="form-input"
              />
              <p className="text-sm text-gray-500 mt-1">
                  Note: In a full implementation, this would be a multi-select dropdown populated from your student list.
              </p>
            </div>
          )}

          <div className="form-field">
            <label htmlFor="description" className="form-label">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              value={formState.description}
              onChange={handleInputChange}
              rows="3"
              className="form-textarea"
            ></textarea>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
            >
              {initialAssignment ? 'Update Assignment' : 'Add Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main AssignmentManager component
function AssignmentManager({ db, appId }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTableView, setShowTableView] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!db || !appId || !userId) {
      console.warn("Firestore, App ID, or User ID not available. Cannot fetch assignments.");
      setLoading(false);
      return;
    }

    const assignmentsCollectionRef = collection(db, `artifacts/${appId}/users/${userId}/assignments`);
    const unsubscribe = onSnapshot(assignmentsCollectionRef, (snapshot) => {
      const fetchedAssignments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAssignments(fetchedAssignments);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching assignments in real-time:", err);
      setError("Failed to load assignments: " + err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, appId, userId]);

  const handleAddAssignment = () => {
    setCurrentAssignment(null);
    setIsFormModalOpen(true);
  };

  const handleEditAssignment = (assignment) => {
    setCurrentAssignment(assignment);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setCurrentAssignment(null);
  };

  const handleOpenConfirmModal = (assignmentId) => {
    setAssignmentToDelete(assignmentId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsConfirmModalOpen(false);
    if (!assignmentToDelete) return;

    try {
      const assignmentDocRef = doc(db, `artifacts/${appId}/users/${userId}/assignments`, assignmentToDelete);
      await deleteDoc(assignmentDocRef);
      console.log('Assignment deleted successfully!');
    } catch (err) {
      console.error("Failed to delete assignment:", err);
      setError("Failed to delete assignment: " + err.message);
    } finally {
      setAssignmentToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
    setAssignmentToDelete(null);
  };

  const totalAssignments = assignments.length;
  const publishedAssignments = assignments.filter(a => a.status === 'Published').length;
  const draftAssignments = assignments.filter(a => a.status === 'Draft').length;
  const assignmentsToGrade = 0;

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

          <div className="section-card quick-actions-section">
            <h3 className="section-title">Quick Actions</h3>
            <div className="quick-actions-grid">
              <button className="quick-action-button" onClick={handleAddAssignment}>
                <Plus className="icon" /> Create New Assignment
              </button>
              <button className="quick-action-button" onClick={() => console.log('Feature: Upload Assignment File (e.g., PDF, Doc)')}>
                <Files className="icon" /> Upload Assignment
              </button>
              <button className="quick-action-button" onClick={() => console.log('Feature: Grade Submitted Work')}>
                <CheckCircle className="icon" /> Grade Work
              </button>
              <button className="quick-action-button" onClick={() => console.log('Feature: View Assignment Submissions')}>
                <ClipboardList className="icon" /> View Submissions
              </button>
            </div>
          </div>

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
                          assignment.status === 'Published' ? 'status-Published' : 'status-Draft'
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
                          onClick={() => handleOpenConfirmModal(assignment.id)}
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

      {/* The pop-up modal is rendered here, conditionally based on state */}
      <AssignmentFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSave={handleCloseFormModal}
        initialAssignment={currentAssignment}
        db={db}
        appId={appId}
        userId={userId}
      />

      {isConfirmModalOpen && (
        <CustomConfirmModal
          message="Are you sure you want to delete this assignment?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
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
