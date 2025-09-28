// File: src/components/StudentManager/AssignmentQuizView.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, CheckCircle } from 'lucide-react';

const API_BASE_URL = 'https://little-learners-2i8y.onrender.com';

function AssignmentQuizView({ assignment, studentId, onFinish }) {
  const [questions, setQuestions] = useState([]);
  const [currentAnswers, setCurrentAnswers] = useState({}); // { questionId: chosenAnswer }
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Questions and Previous Answers
  useEffect(() => {
    setIsLoading(true);
    const fetchQuizData = async () => {
      try {
        // Fetch Questions for the Assignment
        const questionRes = await axios.get(`${API_BASE_URL}/api/questions/assignment/${assignment.id}`);
        setQuestions(questionRes.data);

        // Fetch Previously Submitted Answers (if any)
        const answersRes = await axios.get(
            `${API_BASE_URL}/api/answers/student/${studentId}/assignment/${assignment.id}`
        );

        const submittedAnswers = answersRes.data.reduce((acc, answer) => {
          // Note: studentAnswerResponse may need to contain questionId, assuming it does.
          acc[answer.questionId] = {
            chosenAnswer: answer.chosenAnswer,
            isCorrect: answer.isCorrect,
            submitted: true, // Custom flag to lock the answer
          };
          return acc;
        }, {});
        
        setCurrentAnswers(submittedAnswers);
        
        // If the number of submitted answers equals the number of questions, mark as submitted
        if (Object.keys(submittedAnswers).length === questionRes.data.length && questionRes.data.length > 0) {
            setIsSubmitted(true);
        }

      } catch (err) {
        console.error("Failed to load quiz data:", err);
        alert("Failed to load quiz data.");
      } finally {
          setIsLoading(false);
      }
    };

    fetchQuizData();
  }, [assignment.id, studentId]);

  // 2. Handle Individual Answer Submission
  const handleAnswerChange = async (questionId, chosenAnswer) => {
    // Prevent changing answer if already submitted for this question
    if (currentAnswers[questionId]?.submitted || isSubmitted) return; 

    // Optimistic UI update
    setCurrentAnswers(prev => ({
        ...prev,
        [questionId]: { chosenAnswer, submitted: false, isCorrect: null }
    }));

    try {
        // Submit the answer immediately
        const res = await axios.post(`${API_BASE_URL}/api/answers`, {
            studentId,
            questionId,
            chosenAnswer
        });

        // Update state with server's result (isCorrect flag)
        setCurrentAnswers(prev => ({
            ...prev,
            [questionId]: { ...prev[questionId], isCorrect: res.data.isCorrect, submitted: true }
        }));

    } catch (err) {
        console.error("Failed to submit answer:", err);
        // Rollback optimistic update if submission fails
        setCurrentAnswers(prev => {
             const newState = { ...prev };
             delete newState[questionId];
             return newState;
        });
        alert("Failed to save answer. Try again.");
    }
  };
  
  // 3. Handle Final Submission
  const handleSubmitQuiz = () => {
      const answeredCount = Object.keys(currentAnswers).filter(
          qid => currentAnswers[qid].submitted
      ).length;

      if (answeredCount !== questions.length) {
          return alert(`You must answer all ${questions.length} questions before submitting. You have answered ${answeredCount}.`);
      }

      // 🚨 Backend requirement: You need a final endpoint to update the overall assignment status.
      // Assuming a PUT endpoint exists to finalize the assignment status.
      
      axios.put(`${API_BASE_URL}/api/assignments/${assignment.id}/finalize/student/${studentId}`)
          .then(() => {
              alert("Quiz submitted and finalized!");
              setIsSubmitted(true);
              // Wait a moment then return to list
              setTimeout(onFinish, 1500); 
          })
          .catch(err => {
              console.error("Failed to finalize quiz:", err);
              alert("Failed to finalize submission. Please try again.");
          });
  };

  if (isLoading) return <div className="assignments-wrapper">Loading Quiz...</div>;
  if (!questions.length) return <div className="assignments-wrapper">No questions found for this assignment.</div>;

  const answeredCount = Object.keys(currentAnswers).filter(
    qid => currentAnswers[qid].submitted
  ).length;

  return (
    <div className="assignments-wrapper quiz-view">
      <button onClick={onFinish} className="back-button">
        <ChevronLeft size={20} /> Back to Assignments
      </button>
      <h2 className="assignments-title">{assignment.title} Quiz</h2>
      <p className="quiz-status">
          Progress: {answeredCount} / {questions.length} answered.
      </p>

      <ul className="questions-list">
        {questions.map(q => {
          const answerState = currentAnswers[q.id];
          const isAnswered = answerState?.submitted;
          const isCorrect = answerState?.isCorrect;

          return (
            <li key={q.id} className={`question-card ${isAnswered ? (isCorrect ? 'correct' : 'wrong') : ''}`}>
              <p className="question-text">{q.questionText}</p>
              
              <div className="options-group">
                {/* q.options is a list of strings from the backend response */}
                {q.options.map(option => (
                  <label key={option} className={`option-label ${answerState?.chosenAnswer === option ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      value={option}
                      checked={answerState?.chosenAnswer === option}
                      onChange={() => handleAnswerChange(q.id, option)}
                      disabled={isAnswered || isSubmitted} // Disable once answered or quiz is submitted
                    />
                    {option}
                  </label>
                ))}
              </div>

              {isAnswered && (
                  <p className={`answer-feedback ${isCorrect ? 'correct-text' : 'wrong-text'}`}>
                      {isCorrect ? 'Correct!' : 'Incorrect.'}
                  </p>
              )}
            </li>
          );
        })}
      </ul>

      <div className="quiz-actions">
        <button
          onClick={handleSubmitQuiz}
          className="submit-quiz-button"
          disabled={isSubmitted || answeredCount !== questions.length}
        >
          <CheckCircle size={20} /> Finalize and Submit Quiz ({answeredCount}/{questions.length})
        </button>
        {isSubmitted && <p className="status-graded">Quiz Finalized!</p>}
      </div>
    </div>
  );
}

export default AssignmentQuizView;