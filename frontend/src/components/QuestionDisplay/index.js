import React from 'react';

const QuestionDisplay = ({ question, showHint, feedback }) => {
  console.log('QuestionDisplay rendering with feedback:', feedback);
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Question {question.id} of 10</h2>
        <div className="text-sm text-gray-600">Difficulty: {question.difficulty}</div>
      </div>
      
      <div className="mb-4 p-4 bg-gray-50 rounded-md">
        <p className="text-lg">{question.question}</p>
      </div>
      
      {showHint && (
        <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-700">
          <p><strong>Hint:</strong> {question.hint}</p>
        </div>
      )}
      
      {feedback && (
        <div className={`mb-4 p-3 ${feedback.correct ? 'bg-green-50 border-l-4 border-green-500 text-green-700' : 'bg-red-50 border-l-4 border-red-500 text-red-700'}`}>
          <p className="font-semibold mb-1">
            {feedback.correct ? '✓ Correct!' : '✗ Not quite right.'}
          </p>
          <p>{feedback.message}</p>
        </div>
      )}
    </div>
  );
};

export default QuestionDisplay;