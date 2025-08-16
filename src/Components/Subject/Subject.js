import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import './Subject.css';

// Directly call backend in development
const API_URL = 'http://localhost:8080/api/subjects';

function Subject() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    gradeLevel: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        gradeLevel: Number(formData.gradeLevel), // Ensure it's an integer
      };

      const response = await fetch(`${API_URL}/assignToGrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      console.log('✅ Subject assigned to grade successfully!');
      alert('Subject assigned successfully!');

      // Reset form
      setFormData({ name: '', description: '', gradeLevel: '' });

    } catch (error) {
      console.error('❌ Error assigning subject:', error);
      alert('Failed to assign subject. Please try again.');
    }
  };

  return (
    <div className="subject-form-wrapper">
      <div className="subject-form-card">
        <h2 className="subject-form-title">Add and Assign a New Subject</h2>
        <form onSubmit={handleSubmit} className="subject-form">
          
          {/* Subject Name */}
          <div className="subject-form-group">
            <label className="subject-form-label">Subject Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter subject name"
              className="subject-form-input"
            />
          </div>

          {/* Description */}
          <div className="subject-form-group">
            <label className="subject-form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="Enter subject description"
              className="subject-form-input"
            />
          </div>

          {/* Grade Level */}
          <div className="subject-form-group">
            <label className="subject-form-label">Grade Level</label>
            <input
              type="number"
              name="gradeLevel"
              value={formData.gradeLevel}
              onChange={handleInputChange}
              required
              placeholder="Enter grade level (e.g., 5)"
              className="subject-form-input"
            />
          </div>

          <button type="submit" className="subject-form-button">
            <Plus className="mr-2 h-4 w-4" />
            Assign Subject to Grade
          </button>
        </form>
      </div>
    </div>
  );
}

export default Subject;
