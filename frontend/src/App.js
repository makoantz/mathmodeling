import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Quiz from './pages/Quiz';
import Results from './pages/Results';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Quiz />} />
        <Route path="/results" element={<Results />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;