import React from 'react';

const QuizNavigation = ({ 
  currentQuestionIndex, 
  totalQuestions, 
  handlePrevious, 
  handleNext, 
  handleCheckAnswer, 
  handleReset, 
  handleShowHint, 
  showHint,
  isChecking 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={handleShowHint} 
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
        >
          {showHint ? "Hide Hint" : "Show Hint"}
        </button>
        
        <button 
          onClick={handleReset} 
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md"
        >
          Reset Model
        </button>
        
        <button 
          onClick={handleCheckAnswer} 
          disabled={isChecking}
          className={`px-4 py-2 ${isChecking ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'} text-white rounded-md`}
        >
          {isChecking ? "Checking..." : "Check Answer"}
        </button>
      </div>
      
      <div className="flex justify-between mt-4">
        <button 
          onClick={handlePrevious} 
          disabled={currentQuestionIndex === 0}
          className={`px-6 py-2 ${currentQuestionIndex === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'} rounded-md`}
        >
          Previous
        </button>
        
        <button 
          onClick={handleNext} 
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
        >
          {currentQuestionIndex === totalQuestions - 1 ? "Finish Quiz" : "Next Question"}
        </button>
      </div>
    </div>
  );
};

export default QuizNavigation;