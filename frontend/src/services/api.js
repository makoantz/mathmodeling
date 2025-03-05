const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

export const verifySolution = async (modelData) => {
  try {
    // Create request body with model data but without image
    const requestBody = {
      rectangles: modelData.rectangles || [],
      equations: modelData.equations || [],
      question: modelData.question,
      answer: modelData.answer,
      questionId: modelData.questionId
    };
    
    console.log('Sending model data to API:', requestBody);
    
    const response = await fetch(`${API_BASE_URL}/verify-solution`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Response from API:', result);
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};