const anthropicService = require('../services/anthopicService');
const { generatePrompt } = require('../utils/promptUtils');

const verifySolution = async (req, res) => {
  try {
    const { rectangles, equations, question, answer, questionId } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Missing required data' });
    }
    
    // Generate a prompt for Anthropic's Claude with text-based description
    const prompt = generatePrompt(rectangles, equations, question, answer);
    
    // Call Claude API to check the solution using text only
    const evaluation = await anthropicService.evaluateSolution(prompt);
    
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