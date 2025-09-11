// AssignmentManager.js
import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { Plus, Edit, Trash2, Search, X, ClipboardList, Files, Clock, CheckCircle } from 'lucide-react';
import '../../App.css';
import '../assignmentManager/Assignment.css'; // keep your original UI styles

// Confirm modal (unchanged look)
const CustomConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="confirm-modal-overlay">
    <div className="confirm-modal-content">
      <p className="confirm-modal-text">{message}</p>
      <div className="confirm-modal-actions">
        <button onClick={onCancel} className="confirm-cancel-button">Cancel</button>
        <button onClick={onConfirm} className="confirm-button">Confirm</button>
      </div>
    </div>
  </div>
);

// Assignment form modal — uses backend endpoints to upload file and create/update assignment
const AssignmentFormModal = ({ isOpen, onClose, onSaved, initialAssignment, userId }) => {
  const [formState, setFormState] = useState({
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
    fileUrl: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // populate when editing
  useEffect(() => {
    if (initialAssignment) {
      setFormState({
        title: initialAssignment.title ?? '',
        description: initialAssignment.description ?? '',
        dueDate: initialAssignment.dueDate ?? '',
        subject: initialAssignment.subject ?? '',
        status: initialAssignment.status ?? 'Draft',
        maxMarks: initialAssignment.maxMarks ?? '',
        assignmentType: initialAssignment.assignmentType ?? (initialAssignment.fileUrl ? 'uploaded' : 'text'),
        automatedConfig: initialAssignment.automatedConfig ?? '',
        assignedTo: initialAssignment.assignedTo ?? 'all',
        assignedStudentIds: initialAssignment.assignedStudentIds ? (Array.isArray(initialAssignment.assignedStudentIds) ? initialAssignment.assignedStudentIds.join(', ') : String(initialAssignment.assignedStudentIds)) : '',
        fileUrl: initialAssignment.fileUrl ?? ''
      });
    } else {
      setFormState(prev => ({ ...prev, title: '', description: '', dueDate: '', subject: '', status: 'Draft', maxMarks: '', assignmentType: 'uploaded', automatedConfig: '', assignedTo: 'all', assignedStudentIds: '', fileUrl: '' }));
      setSelectedFile(null);
    }
  }, [initialAssignment, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const uploadFileToServer = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('http://localhost:8080/api/assignments/upload-file', {
      method: 'POST',
      body: fd
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => 'upload failed');
      throw new Error(`File upload failed: ${txt}`);
    }
    const data = await res.json();
    // backend returns { fileUrl: "uploads/assignments/..." }
    return data.fileUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert('You must be logged in.');
      return;
    }

    setSaving(true);
    try {
      let fileUrl = formState.fileUrl || null;

      if (selectedFile) {
        fileUrl = await uploadFileToServer(selectedFile);
      }

      const payload = {
        firebaseUid: userId,
        title: formState.title,
        description: formState.description,
        dueDate: formState.dueDate,
        subject: formState.subject,
        status: formState.status,
        maxMarks: formState.maxMarks ? parseInt(formState.maxMarks, 10) : null,
        fileUrl: fileUrl,
        automatedConfig: formState.automatedConfig || null,
        assignedTo: formState.assignedTo,
        assignedStudentIds: formState.assignedTo === 'specific'
          ? formState.assignedStudentIds.split(',').map(s => s.trim()).filter(Boolean)
          : null
      };

      let res;
      if (initialAssignment && initialAssignment.id) {
        // update
        res = await fetch(`http://localhost:8080/api/assignments/${initialAssignment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // create
        res = await fetch('http://localhost:8080/api/assignments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const errText = await res.text().catch(() => 'server error');
        throw new Error(errText);
      }

      onSaved?.(); // tell parent to refresh list
      onClose?.();
    } catch (err) {
      console.error('Save assignment error:', err);
      alert('Failed to save assignment: ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">{initialAssignment ? 'Edit Assignment' : 'Add New Assignment'}</h3>
          <button onClick={onClose} className="modal-close-button"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-field">
            <label htmlFor="title" className="form-label">Assignment Title</label>
            <input id="title" name="title" value={formState.title} onChange={handleInputChange} className="form-input" required />
          </div>

          <div className="form-field">
            <label htmlFor="subject" className="form-label">Subject</label>
            <input id="subject" name="subject" value={formState.subject} onChange={handleInputChange} className="form-input" required />
          </div>

          <div className="form-field">
            <label htmlFor="dueDate" className="form-label">Due Date</label>
            <input id="dueDate" name="dueDate" type="date" value={formState.dueDate} onChange={handleInputChange} className="form-input" required />
          </div>

          <div className="form-field">
            <label htmlFor="maxMarks" className="form-label">Max Marks</label>
            <input id="maxMarks" name="maxMarks" type="number" value={formState.maxMarks} onChange={handleInputChange} className="form-input" required />
          </div>

          <div className="form-field">
            <label htmlFor="status" className="form-label">Status</label>
            <select id="status" name="status" value={formState.status} onChange={handleInputChange} className="form-select" required>
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="assignmentType" className="form-label">Assignment Type</label>
            <select id="assignmentType" name="assignmentType" value={formState.assignmentType} onChange={handleInputChange} className="form-select" required>
              <option value="uploaded">Uploaded File</option>
              <option value="quiz">Quiz</option>
              <option value="text">Text Entry</option>
            </select>
          </div>

          {formState.assignmentType === 'uploaded' && (
            <div className="form-field">
              <label className="form-label">Upload File</label>
              <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={(e) => setSelectedFile(e.target.files[0])} className="form-input mt-2" />
              {formState.fileUrl && !selectedFile && (
                <p className="mt-1 text-sm">Current file: <a href={formState.fileUrl} target="_blank" rel="noreferrer">View</a></p>
              )}
            </div>
          )}

          {formState.assignmentType === 'quiz' && (
            <div className="form-field">
              <label htmlFor="automatedConfig" className="form-label">Automated Quiz Config (JSON)</label>
              <textarea id="automatedConfig" name="automatedConfig" value={formState.automatedConfig} onChange={handleInputChange} rows="3" className="form-textarea" placeholder='{"questions":[{"q":"What is 2+2?","a":"4"}]}' />
            </div>
          )}

          <div className="form-field">
            <label htmlFor="assignedTo" className="form-label">Assign To</label>
            <select id="assignedTo" name="assignedTo" value={formState.assignedTo} onChange={handleInputChange} className="form-select" required>
              <option value="all">All Students</option>
              <option value="specific">Specific Students</option>
            </select>
          </div>

          {formState.assignedTo === 'specific' && (
            <div className="form-field">
              <label htmlFor="assignedStudentIds" className="form-label">Assigned Student IDs (Comma-separated)</label>
              <input id="assignedStudentIds" name="assignedStudentIds" value={formState.assignedStudentIds} onChange={handleInputChange} className="form-input" placeholder="uuid1, uuid2, uuid3" />
              <p className="text-sm text-gray-500 mt-1">Note: later replace with multi-select from students list.</p>
            </div>
          )}

          <div className="form-field">
            <label htmlFor="description" className="form-label">Description (Optional)</label>
            <textarea id="description" name="description" value={formState.description} onChange={handleInputChange} rows="3" className="form-textarea" />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
            <button type="submit" className="submit-button" disabled={saving}>{saving ? 'Saving...' : (initialAssignment ? 'Update Assignment' : 'Add Assignment')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// DashboardCard (keeps original styling hooks)
function DashboardCard({ title, value, icon, bgColorClass, textColorClass }) {
  return (
    <div className={`dashboard-card ${bgColorClass} ${textColorClass}`}>
      <div className="card-icon-wrapper">{icon}</div>
      <div>
        <h3 className="card-title">{title}</h3>
        <p className="card-value">{value}</p>
      </div>
    </div>
  );
}

// Main component — UI preserved exactly
function AssignmentManager({ /* db, appId (not used here) */ }) {
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

  // fetch assignments from backend
  const fetchAssignments = async () => {
    if (!userId) {
      setAssignments([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8080/api/assignments/teacher/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch assignments');
      const data = await res.json();
      setAssignments(data);
    } catch (err) {
      console.error('Fetch assignments error:', err);
      setError(err.message || 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleAddAssignment = () => {
    setCurrentAssignment(null);
    setIsFormModalOpen(true);
  };

  const handleEditAssignment = (assignment) => {
    // ensure assignedStudentIds is a string when passing to modal
    const assignCopy = { ...assignment };
    if (Array.isArray(assignCopy.assignedStudentIds)) {
      assignCopy.assignedStudentIds = assignCopy.assignedStudentIds.join(', ');
    }
    setCurrentAssignment(assignCopy);
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
      const res = await fetch(`http://localhost:8080/api/assignments/${assignmentToDelete}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => 'delete failed');
        throw new Error(txt);
      }
      // refresh
      await fetchAssignments();
    } catch (err) {
      console.error('Failed to delete assignment:', err);
      setError('Failed to delete assignment: ' + (err.message || err));
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
    (assignment.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (assignment.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (assignment.status || '').toLowerCase().includes(searchTerm.toLowerCase())
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
      <h2 className="main-title"><ClipboardList className="main-title-icon" /> Assignment Overview</h2>

      {!showTableView ? (
        <>
          <div className="dashboard-cards-grid">
            <DashboardCard title="Total Assignments" value={totalAssignments} icon={<Files />} bgColorClass="bg-blue-50" textColorClass="text-blue-700" />
            <DashboardCard title="Published" value={publishedAssignments} icon={<CheckCircle />} bgColorClass="bg-green-50" textColorClass="text-green-700" />
            <DashboardCard title="Drafts" value={draftAssignments} icon={<ClipboardList />} bgColorClass="bg-yellow-50" textColorClass="text-yellow-700" />
            <DashboardCard title="Pending Grading" value={assignmentsToGrade} icon={<Clock />} bgColorClass="bg-red-50" textColorClass="text-red-700" />
          </div>

          <div className="section-card my-assignments-section">
            <h3 className="section-title">My Assignments</h3>
            <p className="section-description">View, manage, and track all your assignments.</p>
            <button onClick={() => setShowTableView(true)} className="manage-button">
              <ClipboardList className="mr-2" size={20} /> Manage All Assignments
            </button>
          </div>

          <div className="section-card quick-actions-section">
            <h3 className="section-title">Quick Actions</h3>
            <div className="quick-actions-grid">
              <button className="quick-action-button" onClick={handleAddAssignment}><Plus className="icon" /> Create New Assignment</button>
              <button className="quick-action-button" onClick={() => console.log('Feature: Upload Assignment File')}><Files className="icon" /> Upload Assignment</button>
              <button className="quick-action-button" onClick={() => console.log('Feature: Grade Submitted Work')}><CheckCircle className="icon" /> Grade Work</button>
              <button className="quick-action-button" onClick={() => console.log('Feature: View Assignment Submissions')}><ClipboardList className="icon" /> View Submissions</button>
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
            <button onClick={() => setShowTableView(false)} className="back-to-dashboard-button">
              <X size={20} className="mr-1" /> Back to Dashboard
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
            <div className="relative w-full sm:w-1/3">
              <input type="text" placeholder="Search assignments..." className="pl-10 pr-4 py-2 border rounded-full w-full focus:outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <button onClick={handleAddAssignment} className="px-6 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center">
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
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${assignment.status === 'Published' ? 'status-Published' : 'status-Draft'}`}>{assignment.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{assignment.maxMarks}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{assignment.assignedTo === 'all' ? 'All Students' : 'Specific Students'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{assignment.assignmentType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{assignment.createdAt ? new Date(assignment.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button onClick={() => handleEditAssignment(assignment)} className="text-blue-600 hover:text-blue-900 mr-3 p-1 rounded-full hover:bg-blue-100 transition-colors" title="Edit Assignment"><Edit size={18} /></button>
                        <button onClick={() => handleOpenConfirmModal(assignment.id)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 transition-colors" title="Delete Assignment"><Trash2 size={18} /></button>
                        {assignment.fileUrl && <a href={assignment.fileUrl} target="_blank" rel="noopener noreferrer" className="ml-2 inline-block text-sm"> <Files size={16} /> </a>}
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

      {/* Modals */}
      <AssignmentFormModal isOpen={isFormModalOpen} onClose={handleCloseFormModal} onSaved={fetchAssignments} initialAssignment={currentAssignment} userId={userId} />

      {isConfirmModalOpen && <CustomConfirmModal message="Are you sure you want to delete this assignment?" onConfirm={handleConfirmDelete} onCancel={handleCancelDelete} />}
    </div>
  );
}

export default AssignmentManager;
