import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, CheckCircle, XCircle, ArrowRight, PartyPopper } from 'lucide-react';
import './AssignmentQuizView.css';

const API_BASE_URL = 'https://little-learners-2i8y.onrender.com';

const getAuthHeaders = () => {
  const token = localStorage.getItem('studentToken'); 
  if (token) {
    return { headers: { 'Authorization': `Bearer ${token}` } };
  }
  return {};
};

function AssignmentQuizView({ assignment, onFinish }) {
  const [studentId, setStudentId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswers, setCurrentAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [hasFinalized, setHasFinalized] = useState(false);

  useEffect(() => {
    if (!assignment?.id) {
      setIsLoading(false);
      return;
    }

    const loadQuizData = async () => {
      setIsLoading(true);
      try {
        const userId = localStorage.getItem("studentUserId"); 
        if (!userId) throw new Error("No logged-in user ID found");

        // ✅ 1. Get studentId from backend
        const studentRes = await axios.get(
          `${API_BASE_URL}/api/students/me/student?userId=${userId}`,
          getAuthHeaders()
        );
        const fetchedStudentId = studentRes.data.studentId;
        setStudentId(fetchedStudentId);

        // ✅ 2. Fetch questions
        const questionRes = await axios.get(
          `${API_BASE_URL}/api/questions/assignment/${assignment.id}`,
          getAuthHeaders()
        );
        setQuestions(questionRes.data);

        // ✅ 3. Check if already completed (avoid duplicates)
        const statusRes = await axios.get(
          `${API_BASE_URL}/api/student-assignments/status/${assignment.id}/${fetchedStudentId}`,
          getAuthHeaders()
        );

        if (statusRes.data?.completionStatus === "COMPLETED") {
          setIsSubmitted(true);
          setHasFinalized(true);
          setScore(statusRes.data?.grade || 0);
        }

      } catch (err) {
        console.error("Failed to load quiz data:", err.response || err);
        alert("Failed to load quiz data. Check student and assignment IDs.");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizData();
  }, [assignment?.id]);

  // ✅ Submit a single answer
  const handleAnswer = async (questionId, chosenAnswer) => {
    if (!studentId || hasFinalized) return;

    const question = questions[currentIndex];

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/answers`,
        { studentId, questionId, chosenAnswer },
        getAuthHeaders()
      );

      const isCorrect = res.data.isCorrect;

      setCurrentAnswers(prev => ({
        ...prev,
        [questionId]: { chosenAnswer, isCorrect, submitted: true }
      }));

      if (isCorrect) {
        setScore(prev => prev + 1);
        setFeedback({ correct: true, message: "✅ Correct! Well done!" });
      } else {
        setFeedback({
          correct: false,
          message: `❌ Incorrect. The correct answer was: ${question.correctAnswer}`
        });
      }
    } catch (err) {
      console.error("Failed to submit answer:", err.response || err);
      alert("Failed to save answer. Check backend logs.");
    }
  };

  // ✅ Next question
  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setFeedback(null);
    }
  };

  // ✅ Finalize entire assignment
  const handleSubmit = async () => {
    if (!studentId || hasFinalized) return;

    try {
      console.log("Finalizing assignment for studentId:", studentId, "assignmentId:", assignment.id);

      const finalizeRes = await axios.put(
        `${API_BASE_URL}/api/assignments/${assignment.id}/finalize/student/${studentId}`, 
        {}, 
        getAuthHeaders()
      );

      setIsSubmitted(true);
      setHasFinalized(true);
      setScore(finalizeRes.data?.grade || score);

      // ✅ Notify parent to refresh list so it updates from "PENDING" → "COMPLETED"
      if (onFinish) onFinish(true);

    } catch (err) {
      console.error("Failed to finalize assignment:", err.response || err);
      alert("Error finalizing assignment. Please try again.");
    }
  };

  if (isLoading) return <div className="assignments-wrapper">Loading Quiz...</div>;
  if (!questions.length) return <div className="assignments-wrapper">No questions found for this assignment.</div>;

  // ✅ Show final screen if completed
  if (isSubmitted) {
    return (
      <div className="quiz-finished">
        <PartyPopper size={50} className="text-yellow-500 mb-4" />
        <h2>🎉 Quiz Completed!</h2>
        <p>You scored <strong>{score}</strong> out of <strong>{questions.length}</strong></p>
        <p className="mt-2 italic">💪 You got this!</p>
        <button
          onClick={() => onFinish && onFinish(true)}
          className="quiz-button back-btn"
          type="button"
        >
          Back to Assignments
        </button>
      </div>
    );
  }

  // ✅ Current question
  const question = questions[currentIndex];
  const answerState = currentAnswers[question.id];

  return (
    <div className="assignments-wrapper quiz-view">
      <button
        onClick={() => onFinish && onFinish(false)}
        className="back-button"
        type="button"
      >
        <ChevronLeft size={20} /> Back to Assignments
      </button>

      <h2 className="assignments-title">{assignment.title} Quiz</h2>
      <p className="quiz-status">
        Question {currentIndex + 1} of {questions.length}
      </p>

      <div className="question-card active">
        <p className="question-text">{question.questionText}</p>

        <div className="options-group">
          {question.options.map(option => (
            <button
              key={option}
              className={`option-btn ${
                answerState?.chosenAnswer === option
                  ? answerState.isCorrect
                    ? "correct"
                    : "incorrect"
                  : ""
              }`}
              onClick={() => handleAnswer(question.id, option)}
              disabled={!!answerState}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>

        {feedback && (
          <div className={`answer-feedback ${feedback.correct ? 'correct-text' : 'wrong-text'}`}>
            {feedback.correct ? <CheckCircle size={20} /> : <XCircle size={20} />} {feedback.message}
          </div>
        )}

        {feedback && (
          <button
            onClick={currentIndex + 1 < questions.length ? handleNext : handleSubmit}
            className="next-btn"
            type="button"
          >
            {currentIndex + 1 < questions.length ? (
              <>Next <ArrowRight size={18} /></>
            ) : (
              <>Submit <CheckCircle size={18} /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default AssignmentQuizView;
