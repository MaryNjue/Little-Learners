// AssignmentManager.js
import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { Plus, Edit, Trash2, Search, X, ClipboardList, Files, Clock, CheckCircle } from 'lucide-react';
import '../../App.css';
import '../assignmentManager/Assignment.css'; // keep your original UI styles

const API_BASE_URL = 'https://little-learners-2i8y.onrender.com';

const formatFileUrl = (url) => {
  if (!url) return '';
  // Use raw URL for non-image files like PDFs to avoid 401 error
  return url.replace('/image/upload/', '/raw/upload/');
};

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
    const res = await fetch(`${API_BASE_URL}/api/assignments/upload-file`, {
      method: 'POST',
      body: fd
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => 'upload failed');
      throw new Error(`File upload failed: ${txt}`);
    }
    const data = await res.json();
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
        res = await fetch(`${API_BASE_URL}/api/assignments/${initialAssignment.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_BASE_URL}/api/assignments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const errText = await res.text().catch(() => 'server error');
        throw new Error(errText);
      }

      onSaved?.();
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
          {/* Form fields... */}
          {formState.assignmentType === 'uploaded' && (
            <div className="form-field">
              <label className="form-label">Upload File</label>
              <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={(e) => setSelectedFile(e.target.files[0])} className="form-input mt-2" />
              {formState.fileUrl && !selectedFile && (
                <p className="mt-1 text-sm">Current file: <a href={formatFileUrl(formState.fileUrl)} target="_blank" rel="noreferrer">View</a></p>
              )}
            </div>
          )}
          {/* Other form fields... */}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
            <button type="submit" className="submit-button" disabled={saving}>{saving ? 'Saving...' : (initialAssignment ? 'Update Assignment' : 'Add Assignment')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

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

function AssignmentManager() {
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

  const fetchAssignments = async () => {
    if (!userId) {
      setAssignments([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/assignments/teacher/${userId}`);
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
  }, [userId]);

  const handleAddAssignment = () => {
    setCurrentAssignment(null);
    setIsFormModalOpen(true);
  };

  const handleEditAssignment = (assignment) => {
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
      const res = await fetch(`${API_BASE_URL}/api/assignments/${assignmentToDelete}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => 'delete failed');
        throw new Error(txt);
      }
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

  const filteredAssignments = assignments.filter(assignment =>
    (assignment.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (assignment.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (assignment.status || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="assignment-dashboard-container">
      {/* Dashboard UI */}
      {showTableView ? (
        <div className="detailed-assignment-table">
          {/* Table view */}
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            {filteredAssignments.length > 0 ? (
              <table className="min-w-full table-auto border-collapse">
                {/* Table Head */}
                <tbody className="divide-y divide-gray-200">
                  {filteredAssignments.map(assignment => (
                    <tr key={assignment.id} className="hover:bg-gray-50 transition-colors">
                      {/* Table cells */}
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button onClick={() => handleEditAssignment(assignment)} className="text-blue-600 hover:text-blue-900 mr-3"><Edit size={18} /></button>
                        <button onClick={() => handleOpenConfirmModal(assignment.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                        {assignment.fileUrl && <a href={formatFileUrl(assignment.fileUrl)} target="_blank" rel="noopener noreferrer" className="ml-2"><Files size={16} /></a>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No assignments found.</p>
            )}
          </div>
        </div>
      ) : (
        <div>
          {/* Dashboard cards and actions */}
        </div>
      )}

      <AssignmentFormModal isOpen={isFormModalOpen} onClose={handleCloseFormModal} onSaved={fetchAssignments} initialAssignment={currentAssignment} userId={userId} />
      {isConfirmModalOpen && <CustomConfirmModal message="Are you sure?" onConfirm={handleConfirmDelete} onCancel={handleCancelDelete} />}
    </div>
  );
}

export default AssignmentManager;
