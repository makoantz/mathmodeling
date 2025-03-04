/**
 * Generate a prompt for Anthropic's Claude to evaluate a math modeling solution
 */
const generatePrompt = (rectangles, equations, question, correctAnswer) => {
  // Format rectangles for the prompt
  const formattedRectangles = rectangles.map((r, i) => {
    return `Rectangle ${i+1}: ${r.label ? `Label: "${r.label}", ` : ''}Width: ${r.width/30} units, Height: ${r.height/30} units, Position: (${r.x/30}, ${r.y/30})`
  }).join('\n');
  
  // Format equations for the prompt
  const formattedEquations = equations.map((eq, i) => {
    return `Equation ${i+1}: "${eq.text}"`
  }).join('\n');
  
  // Build the full prompt
  return `
Please evaluate this student's math model for the following word problem:

PROBLEM:
${question}

CORRECT ANSWER:
${correctAnswer}

STUDENT'S MODEL DATA:
${rectangles.length > 0 ? 'Rectangles:\n' + formattedRectangles : 'No rectangles were created.'}

${equations.length > 0 ? 'Equations:\n' + formattedEquations : 'No equations were added.'}

Evaluate if the student's model correctly represents the mathematical relationships in the problem and would lead to the correct answer.
`;
};

module.exports = {
  generatePrompt
};