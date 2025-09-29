import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft, FileText, CheckCircle, Circle, X } from 'lucide-react';
import '../../App.css';

const API_BASE_URL = 'https://little-learners-2i8y.onrender.com';

// --- Question Form Modal Component ---
const QuestionFormModal = ({ isOpen, onClose, onSaved, assignmentId, initialQuestion }) => {
  const [formState, setFormState] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialQuestion) {
      setFormState({
        questionText: initialQuestion.questionText || '',
        options: [...(initialQuestion.options || []), ...Array(Math.max(0, 4 - (initialQuestion.options?.length || 0))).fill('')],
        correctAnswer: initialQuestion.correctAnswer || ''
      });
    } else {
      setFormState({
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: ''
      });
    }
  }, [initialQuestion, isOpen]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...formState.options];
    newOptions[index] = value;
    setFormState(prev => ({ ...prev, options: newOptions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validOptions = formState.options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      alert("Please provide at least two options.");
      return;
    }
    if (!validOptions.includes(formState.correctAnswer)) {
      alert("The correct answer must be one of the provided options.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        assignmentId,
        questionText: formState.questionText,
        options: validOptions,
        correctAnswer: formState.correctAnswer
      };

      const res = await fetch(`${API_BASE_URL}/api/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorBody = await res.text().catch(() => 'Unknown server error');
        console.error('Failed to save question. Server response:', errorBody);
        alert(`Failed to save question: ${res.status}. Error Details: ${errorBody.substring(0, 100)}...`);
        throw new Error('Failed to save question');
      }

      onSaved();
      onClose();

    } catch (err) {
      console.error('Save question error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">{initialQuestion ? 'Edit Question' : 'Add New Question'}</h3>
          <button onClick={onClose} className="modal-close-button"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">Question Text</label>
            <textarea
              name="questionText"
              value={formState.questionText}
              onChange={(e) => setFormState(prev => ({ ...prev, questionText: e.target.value }))}
              required
              className="form-input"
              rows="2"
              placeholder="e.g., What is the capital of France?"
            />
          </div>

          <h4 className="section-title text-base font-semibold mt-6 mb-3">Multiple Choice Options</h4>
          {formState.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-3 mb-3">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                className="form-input flex-grow"
              />
              <button
                type="button"
                onClick={() => setFormState(prev => ({ ...prev, correctAnswer: option }))}
                className={`p-2 rounded-full transition-all duration-200 border ${
                  formState.correctAnswer === option && option.trim() !== ''
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
                title="Mark as Correct Answer"
                disabled={option.trim() === ''}
              >
                {formState.correctAnswer === option && option.trim() !== '' ? <CheckCircle size={20} /> : <Circle size={20} />}
              </button>
            </div>
          ))}
          <p className="text-xs text-gray-500 mt-2">Click the circle next to an option to mark it as the <strong>Correct Answer</strong>.</p>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
            <button type="submit" className="submit-button" disabled={saving}>
              {saving ? 'Saving...' : 'Add Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- MAIN QuestionManager COMPONENT ---
const QuestionManager = ({ assignment, onBackToAssignments }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/questions/assignment/${assignment.id}`);
      if (!res.ok) throw new Error('Failed to fetch questions');

      const data = await res.json();
      const mappedData = data.map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : []
      }));

      setQuestions(mappedData);
    } catch (err) {
      console.error('Fetch questions error:', err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [assignment.id]);

  const handleAddQuestion = () => setIsFormModalOpen(true);

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/questions/${questionId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete question');
      fetchQuestions();
    } catch (err) {
      console.error('Delete question error:', err);
      alert('Failed to delete question. Check backend logs.');
    }
  };

  if (loading) return <div className="p-6 text-center text-lg text-blue-600">Loading questions...</div>;

  return (
    <div className="assignment-dashboard-container">
      <button onClick={onBackToAssignments} className="back-to-dashboard-button mb-6">
        <ArrowLeft size={20} className="mr-2" /> Back to Assignments
      </button>

      <header className="mb-6 border-b pb-4">
        <h1 className="main-title mb-2">
          <FileText size={32} className="main-title-icon" /> Manage Questions
        </h1>
        <p className="text-xl font-semibold text-gray-700">Assignment: {assignment.title}</p>
      </header>

      <div className="flex justify-end mb-4">
        <button onClick={handleAddQuestion} className="create-assignment-button">
          <Plus size={20} /> Add New Question
        </button>
      </div>

      <section className="section-card p-0">
        <h2 className="section-title px-6 pt-6">Question List ({questions.length})</h2>
        <div className="overflow-x-auto">
          {questions.length > 0 ? (
            <table className="student-table">
              <thead>
                <tr>
                  <th className="px-6 py-3 w-8/12">Question Text & Options</th>
                  <th className="px-6 py-3 w-2/12">Correct Answer</th>
                  <th className="px-6 py-3 w-2/12 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q, index) => (
                  <tr key={q.id}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 mb-2">
                        {index + 1}. {q.questionText}
                      </div>
                      <ul className="list-none p-0 space-y-1 text-sm text-gray-600 ml-4">
                        {q.options.map((opt, i) => (
                          <li key={i} className="flex items-center">
                            {q.correctAnswer === opt ? (
                              <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
                            ) : (
                              <Circle size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                            )}
                            {opt}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4 whitespace-normal text-sm font-medium text-green-700">
                      {q.correctAnswer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-3">
                      <button onClick={() => handleDeleteQuestion(q.id)} className="table-action-button delete" title="Delete Question">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText size={40} className="mx-auto mb-4 text-gray-400"/>
              <p className="mb-4">No questions have been added yet.</p>
              <button onClick={handleAddQuestion} className="create-assignment-button">
                <Plus size={20} /> Add the First Question
              </button>
            </div>
          )}
        </div>
      </section>

      <QuestionFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSaved={fetchQuestions}
        assignmentId={assignment.id}
        initialQuestion={null}
      />
    </div>
  );
};

export default QuestionManager;
