import React from 'react';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

const StudentAnswersView = ({ student, onBack }) => {
  return (
    <div className="assignment-dashboard-container">
      <button onClick={onBack} className="back-to-dashboard-button mb-4">
        <ArrowLeft size={20} /> Back to Results
      </button>

      <h2 className="section-title mb-4">
        {student.studentName} – {student.assignmentTitle} Answers
      </h2>

      <table className="student-table">
        <thead>
          <tr>
            <th>Question</th>
            <th>Chosen Answer</th>
            <th>Correct?</th>
          </tr>
        </thead>
        <tbody>
          {student.answers.map((ans, idx) => (
            <tr key={idx}>
              <td>{ans.questionText}</td>
              <td>{ans.chosenAnswer}</td>
              <td>
                {ans.isCorrect ? (
                  <CheckCircle size={16} className="text-green-500" />
                ) : (
                  <XCircle size={16} className="text-red-500" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentAnswersView;
