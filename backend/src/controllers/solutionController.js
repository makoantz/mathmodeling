const anthropicService = require('../services/anthopicService');
const { generatePrompt } = require('../utils/promptUtils');

const verifySolution = async (req, res) => {
  try {
    const { rectangles, equations, question, answer, questionId, canvasImage } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Missing required data' });
    }
    
    // Generate a prompt for Anthropic's Claude
    const prompt = generatePrompt(rectangles, equations, question, answer);
    
    // Call Claude API to check the solution with image
    const evaluation = await anthropicService.evaluateSolution(prompt, canvasImage);
    
    console.log('Sending evaluation to frontend:', evaluation);
    
    // Return the evaluation results
    res.json(evaluation);
  } catch (error) {
    console.error('Error verifying solution:', error);
    res.status(500).json({ 
      error: 'Failed to verify solution',
      message: 'There was an error checking your answer. Please try again.'
    });
  }
};

module.exports = {
  verifySolution
};