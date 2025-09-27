import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { Plus, Edit, Trash2, Search, X, Files, Download, ClipboardList, FileText } from 'lucide-react';
import '../../App.css';
import '../assignmentManager/Assignment.css';
import QuestionManager from './QuestionManager'; // <-- NEW: Import the QuestionManager component

const API_BASE_URL = 'https://little-learners-2i8y.onrender.com';

const formatFileUrl = (url) => {
  if (!url) return '';
  return url.replace('/image/upload/', '/raw/upload/');
};

// --- CustomConfirmModal ---
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

// --- AssignmentFormModal (Kept for completeness) ---
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
          <div className="form-field">
            <label className="form-label">Title</label>
            <input type="text" name="title" value={formState.title} onChange={handleInputChange} required className="form-input" />
          </div>
          <div className="form-field">
            <label className="form-label">Description</label>
            <textarea name="description" value={formState.description} onChange={handleInputChange} className="form-input" rows="3" />
          </div>
          <div className="form-field">
            <label className="form-label">Subject</label>
            <input type="text" name="subject" value={formState.subject} onChange={handleInputChange} required className="form-input" />
          </div>
          <div className="form-field">
            <label className="form-label">Due Date</label>
            <input type="date" name="dueDate" value={formState.dueDate ? formState.dueDate.substring(0, 10) : ''} onChange={handleInputChange} className="form-input" />
          </div>
          <div className="form-field">
            <label className="form-label">Max Marks</label>
            <input type="number" name="maxMarks" value={formState.maxMarks} onChange={handleInputChange} className="form-input" />
          </div>
          <div className="form-field">
            <label className="form-label">Status</label>
            <select name="status" value={formState.status} onChange={handleInputChange} className="form-input">
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          
          {formState.assignmentType === 'uploaded' && (
            <div className="form-field">
              <label className="form-label">Upload File</label>
              <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={(e) => setSelectedFile(e.target.files[0])} className="form-input mt-2" />
              {formState.fileUrl && !selectedFile && (
                <p className="mt-1 text-sm">Current file: <a href={formatFileUrl(formState.fileUrl)} target="_blank" rel="noreferrer">View</a></p>
              )}
            </div>
          )}
          
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
            <button type="submit" className="submit-button" disabled={saving}>{saving ? 'Saving...' : (initialAssignment ? 'Update Assignment' : 'Add Assignment')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- AssignmentManager Component (Final Corrected Layout) ---

function AssignmentManager() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  // NEW STATE: Holds the assignment object when managing questions
  const [activeAssignmentForQuestions, setActiveAssignmentForQuestions] = useState(null); 

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
    if (userId) {
      fetchAssignments();
    }
  }, [userId]);
  
  // NEW HANDLER: Switches view to QuestionManager
  const handleManageQuestions = (assignment) => {
    setActiveAssignmentForQuestions(assignment);
  };
  
  const handleBackToAssignments = () => {
    setActiveAssignmentForQuestions(null);
  };

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
  ).sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));


  // NEW: CONDITIONAL RENDERING LOGIC
  if (activeAssignmentForQuestions) {
    return (
      <QuestionManager 
        assignment={activeAssignmentForQuestions} 
        onBackToAssignments={handleBackToAssignments}
      />
    );
  }
  // END CONDITIONAL RENDERING
  
  if (loading) {
    return <div className="p-6 text-center text-lg text-blue-600">Loading assignments...</div>;
  }

  if (error) {
    return <div className="p-6 text-xl text-red-600 border border-red-200 bg-red-50 rounded-lg">Error: {error}</div>;
  }

  return (
    <div className="assignment-dashboard-container">
      
      <header className="mb-6 border-b pb-4">
        {/* Main Title */}
        <h1 className="main-title mb-4">
          <ClipboardList size={32} className="main-title-icon" /> Assignment Manager
        </h1>
        
        {/* Search and Button Row using custom CSS class */}
        <div className="search-action-row"> 
            
            {/* Search Bar Container */}
            <div className="search-input-container"> 
                {/* Search Icon inside the field - Uses new CSS class */}
                <Search size={20} className="search-icon-inside" />
                <input
                    type="text"
                    placeholder="Search assignments by title or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    // Uses new CSS class for input styling
                    className="search-input-field" 
                />
                {searchTerm && (
                    <X size={20} onClick={() => setSearchTerm('')} className="clear-search-icon" />
                )}
            </div>

            {/* Create Button - Sits on the right */}
            <button
                onClick={handleAddAssignment}
                className="create-assignment-button flex-shrink-0" 
            >
                <Plus size={20} /> Create New Assignment
            </button>
        </div>
      </header>

      {/* Assignment List (Table View) */}
      <section className="section-card">
        <div className="p-0 border-b-0">
          <h2 className="section-title">All Assignments ({filteredAssignments.length})</h2>
          <p className="section-description">Manage all assignments, including editing, deleting, and viewing associated files.</p>
        </div>
        
        <div className="overflow-x-auto">
          {filteredAssignments.length > 0 ? (
            <table className="student-table">
              <thead>
                  <tr className="text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                      <th className="px-6 py-3">Title / Subject</th>
                      <th className="px-6 py-3">Due Date</th>
                      <th className="px-6 py-3">Marks</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-center">Actions</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAssignments.map(assignment => (
                  <tr key={assignment.id}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{assignment.title}</div>
                      <div className="text-sm text-gray-500">{assignment.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-US', { dateStyle: 'medium' }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{assignment.maxMarks || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        {/* Using the custom status classes */}
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full status-${assignment.status}`}>
                            {assignment.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-3">
                      {/* NEW: Manage Questions Button */}
                      <button 
                        onClick={() => handleManageQuestions(assignment)} // Pass the full assignment object
                        className="table-action-button questions" 
                        title="Manage Questions"
                      >
                        <FileText size={18} />
                      </button>
                      {/* Using the custom table action button classes */}
                      <button onClick={() => handleEditAssignment(assignment)} className="table-action-button edit" title="Edit Assignment"><Edit size={18} /></button>
                      <button onClick={() => handleOpenConfirmModal(assignment.id)} className="table-action-button delete" title="Delete Assignment"><Trash2 size={18} /></button>
                      {assignment.fileUrl && (
                        <a href={formatFileUrl(assignment.fileUrl)} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800" title="Download File">
                          <Download size={18} />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Files size={40} className="mx-auto mb-4 text-gray-400"/>
              <p className="mb-4">No assignments found.</p>
              <button onClick={handleAddAssignment} className="create-assignment-button">
                Create a New Assignment
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Modals */}
      <AssignmentFormModal 
        isOpen={isFormModalOpen} 
        onClose={handleCloseFormModal} 
        onSaved={fetchAssignments} 
        initialAssignment={currentAssignment} 
        userId={userId} 
      />
      {isConfirmModalOpen && <CustomConfirmModal message="Are you sure you want to delete this assignment?" onConfirm={handleConfirmDelete} onCancel={handleCancelDelete} />}
    </div>
  );
}

export default AssignmentManager;