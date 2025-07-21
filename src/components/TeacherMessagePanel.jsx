import React from 'react';
import { MessageSquare, Sparkles, User } from 'lucide-react';
import '../App.css';

function TeacherMessagePanel() {
  return (
    <div className="teacher-message-panel">
      <div className="teacher-message-panel-header">
        <MessageSquare className="icon" />
        <h3>Message from Teacher</h3>
      </div>
      <div className="teacher-avatar-wrapper">
        <User className="teacher-avatar-icon" />
      </div>
      <p className="teacher-name">Miss Emily</p>
      <p className="teacher-message-text">
        "Hello my wonderful little learners! <Sparkles className="sparkles-icon" /> I'm so proud of how hard you're all working. Remember to ask questions and have fun while learning!"
      </p>
      <button className="teacher-button">Your favorite teacher</button>
    </div>
  );
}

export default TeacherMessagePanel;