import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RectangleModeler from '../components/RectangleModeler';
import QuestionDisplay from '../components/QuestionDisplay';
import QuizNavigation from '../components/QuizNavigation';
import questions from '../data/questions-data';
import { verifySolution } from '../services/api';

const Quiz = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const navigate = useNavigate();
  
  const currentQuestion = questions[currentQuestionIndex];
  
  const handleNext = () => {
    // Save current canvas state to user answers
    const canvasData = {
      rectangles: window.rectanglesData || [],
      equations: window.equationsData || [],
    };
    
    // Update answers
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = canvasData;
    setUserAnswers(newAnswers);
    
    // Reset feedback and hint
    setFeedback(null);
    setShowHint(false);
    
    // Move to next question or complete quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Navigate to results page when quiz is complete
      navigate('/results', { state: { userAnswers } });
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      // Save current canvas state
      const canvasData = {
        rectangles: window.rectanglesData || [],
        equations: window.equationsData || [],
      };
      
      // Update answers
      const newAnswers = [...userAnswers];
      newAnswers[currentQuestionIndex] = canvasData;
      setUserAnswers(newAnswers);
      
      // Go to previous question
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setFeedback(null);
      setShowHint(false);
    }
  };
  
  const handleCheckAnswer = async () => {
    setIsChecking(true);
    
    // Get current model state
    const modelData = {
      rectangles: window.rectanglesData || [],
      equations: window.equationsData || [],
      question: currentQuestion.question,
      answer: currentQuestion.correctAnswer,
      questionId: currentQuestion.id
    };
    
    try {
      // Capture canvas as image
      const canvas = document.querySelector('canvas');
      if (canvas) {
        // Add the canvas image as base64 string
        modelData.canvasImage = canvas.toDataURL('image/png');
        console.log('Canvas image captured');
      }
      
      const result = await verifySolution(modelData);
      console.log('Quiz received feedback:', result);
      
      // Make sure we're setting the feedback with the correct structure
      setFeedback({
        correct: result.correct,
        message: result.message || 'No feedback message provided.',
      });
    } catch (error) {
      console.error('Error checking answer:', error);
      setFeedback({
        correct: false,
        message: "There was an error checking your answer. Please try again."
      });
    } finally {
      setIsChecking(false);
    }
  };
  
  const handleReset = () => {
    // Trigger the clear canvas function in the Rectangle Modeler component
    if (window.clearCanvasFunction) {
      window.clearCanvasFunction();
    }
    setFeedback(null);
  };
  
  const handleShowHint = () => {
    setShowHint(!showHint);
  };
  
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Math Modeling Quiz</h1>
      
      <div className="space-y-6">
        <QuestionDisplay 
          question={currentQuestion}
          showHint={showHint}
          feedback={feedback}
        />
        
        <div className="bg-white rounded-lg shadow-md p-2">
          <RectangleModeler />
        </div>
        
        <QuizNavigation 
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          handlePrevious={handlePrevious}
          handleNext={handleNext}
          handleCheckAnswer={handleCheckAnswer}
          handleReset={handleReset}
          handleShowHint={handleShowHint}
          showHint={showHint}
          isChecking={isChecking}
        />
      </div>
    </div>
  );
};

export default Quiz;