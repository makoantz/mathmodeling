/**
 * Generate a prompt for Anthropic's Claude to evaluate a math modeling solution
 */
const generatePrompt = (rectangles, equations, question, correctAnswer) => {
  // Create a detailed text description of the model
  const modelDescription = createModelDescription(rectangles, equations);
  
  // Format rectangles for additional context
  const formattedRectangles = rectangles.map((r, i) => {
    return `Rectangle ${i+1}: ${r.label ? `Label: "${r.label}", ` : ''}Width: ${r.width/30} units, Height: ${r.height/30} units, Position: (${r.x/30}, ${r.y/30})`
  }).join('\n');
  
  // Format equations for additional context
  const formattedEquations = equations.map((eq, i) => {
    return `Equation ${i+1}: "${eq.text}" at row ${eq.gridY}`
  }).join('\n');
  
  // Build the full prompt
  return `
Please evaluate this student's math model for the following word problem:

PROBLEM:
${question}

CORRECT ANSWER:
${correctAnswer}

MODEL DESCRIPTION:
${modelDescription}

DETAILED MODEL DATA:
${rectangles.length > 0 ? 'Rectangles:\n' + formattedRectangles : 'No rectangles were created.'}

${equations.length > 0 ? 'Equations:\n' + formattedEquations : 'No equations were added.'}

Based on the model description and data, evaluate if the student correctly represented the mathematical relationships in the problem and if their approach would lead to the correct answer.
`;
};

/**
 * Create a plain language description of the model to help the LLM understand the drawing
 */
const createModelDescription = (rectangles, equations) => {
  let description = "";
  
  // Describe each rectangle with its position, size and label
  if (rectangles.length > 0) {
    description += "The student has drawn the following rectangles:\n";
    
    rectangles.forEach((rect, i) => {
      const width = Math.round(rect.width/30);
      const height = Math.round(rect.height/30);
      const x = Math.round(rect.x/30);
      const y = Math.round(rect.y/30);
      
      description += `- A ${width}×${height} rectangle at position (${x}, ${y})`;
      if (rect.label) {
        description += ` labeled "${rect.label}"`;
      }
      description += ".\n";
    });
  } else {
    description += "The student didn't create any rectangles.\n";
  }
  
  // Describe any equations that were added
  if (equations.length > 0) {
    description += "\nThe student added these equations:\n";
    
    equations.forEach((eq, i) => {
      description += `- "${eq.text}" at row ${eq.gridY}\n`;
    });
  }
  
  // Add spatial relationships between rectangles if there's more than one
  if (rectangles.length > 1) {
    description += "\nSpatial relationships between rectangles:\n";
    
    // Identify adjacent rectangles
    for (let i = 0; i < rectangles.length; i++) {
      for (let j = i + 1; j < rectangles.length; j++) {
        const r1 = rectangles[i];
        const r2 = rectangles[j];
        
        // Convert to grid coordinates
        const r1x = Math.round(r1.x/30);
        const r1y = Math.round(r1.y/30);
        const r1w = Math.round(r1.width/30);
        const r1h = Math.round(r1.height/30);
        
        const r2x = Math.round(r2.x/30);
        const r2y = Math.round(r2.y/30);
        const r2w = Math.round(r2.width/30);
        const r2h = Math.round(r2.height/30);
        
        // Compare sizes
        const r1Size = r1w * r1h;
        const r2Size = r2w * r2h;
        
        let sizeComparison = "";
        if (r1Size > r2Size) {
          const ratio = Math.round((r1Size / r2Size) * 10) / 10;
          sizeComparison = `Rectangle ${i+1} is ${ratio} times larger than Rectangle ${j+1}. `;
        } else if (r2Size > r1Size) {
          const ratio = Math.round((r2Size / r1Size) * 10) / 10;
          sizeComparison = `Rectangle ${j+1} is ${ratio} times larger than Rectangle ${i+1}. `;
        } else {
          sizeComparison = `Rectangle ${i+1} and Rectangle ${j+1} are equal in area. `;
        }
        
        // Describe positioning
        let positionRelation = "";
        if (r1x + r1w <= r2x) {
          positionRelation = `Rectangle ${i+1} is to the left of Rectangle ${j+1}. `;
        } else if (r2x + r2w <= r1x) {
          positionRelation = `Rectangle ${i+1} is to the right of Rectangle ${j+1}. `;
        } else if (r1y + r1h <= r2y) {
          positionRelation = `Rectangle ${i+1} is above Rectangle ${j+1}. `;
        } else if (r2y + r2h <= r1y) {
          positionRelation = `Rectangle ${i+1} is below Rectangle ${j+1}. `;
        } else {
          positionRelation = `Rectangle ${i+1} and Rectangle ${j+1} overlap. `;
        }
        
        description += `- ${sizeComparison}${positionRelation}\n`;
      }
    }
  }
  
  // Try to infer the modeling strategy
  description += "\nBased on the model, the student appears to be using ";
  
  if (rectangles.length === 0) {
    description += "no modeling strategy as they haven't created any rectangles.";
  } else if (rectangles.length === 1) {
    description += "a single rectangle to represent a quantity in the problem.";
  } else if (rectangles.some(r => r.width === rectangles[0].width && r.height === rectangles[0].height)) {
    description += "equal-sized rectangles, possibly for a comparison or division problem.";
  } else if (rectangles.length === 2) {
    const r1Size = Math.round(rectangles[0].width/30) * Math.round(rectangles[0].height/30);
    const r2Size = Math.round(rectangles[1].width/30) * Math.round(rectangles[1].height/30);
    if (Math.abs(r1Size - r2Size) < 5) {
      description += "two similarly-sized rectangles, possibly for comparison.";
    } else {
      description += "rectangles of different sizes, possibly representing different quantities in a relationship.";
    }
  } else {
    description += "multiple rectangles of different sizes to model relationships between quantities.";
  }
  
  return description;
};

module.exports = {
  generatePrompt
};