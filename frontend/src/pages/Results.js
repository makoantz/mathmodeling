import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import questions from '../data/questions-data';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userAnswers = location.state?.userAnswers || [];
  
  const startOver = () => {
    navigate('/');
  };
  
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Quiz Results</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">You've completed all {questions.length} questions!</h2>
        
        <p className="mb-6">
          Your models have been saved and can be reviewed by your teacher.
        </p>
        
        <div className="flex justify-center">
          <button 
            onClick={startOver} 
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;