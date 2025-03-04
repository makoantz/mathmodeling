const Anthropic = require('@anthropic-ai/sdk');

const evaluateSolution = async (prompt, canvasImageBase64) => {
  try {
    // Check if API key exists
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Missing Anthropic API key');
    }

    // Initialize the client with explicit API key
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    console.log('Sending request with image to Anthropic API...');
    
    // Prepare message content with both text and image
    const messageContent = [
      {
        type: "text",
        text: prompt
      }
    ];
    
    // Add the image if provided
    if (canvasImageBase64) {
      // Remove the base64 prefix if present
      const base64Data = canvasImageBase64.replace(/^data:image\/\w+;base64,/, '');
      
      messageContent.push({
        type: "image",
        source: {
          type: "base64",
          media_type: "image/png",
          data: base64Data
        }
      });
      
      console.log('Image included in the request');
    } else {
      console.log('No image provided, using text-only evaluation');
    }
    
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: messageContent
        }
      ],
      system: `You are an expert math teacher evaluating student solutions to word problems. 
      Your job is to carefully review the student's visual model and determine if it correctly 
      represents the mathematical relationships in the problem. Be thorough but encouraging.
      
      The student has created rectangles to model the problem. The data shows each rectangle's 
      position, size, and any labels or equations they've added.
      
      Always return a valid JSON response with exactly this format:
      {"correct": true/false, "message": "feedback for the student", "reasoning": "your evaluation process"}
      
      Do not include any special characters in your JSON strings that would make it invalid JSON.`
    });

    // Parse the response to extract the JSON
    let content = response.content[0].text;
    console.log("Claude response:", content);
    
    try {
      // First try to parse the entire response as JSON
      const jsonData = JSON.parse(content);
      return {
        correct: jsonData.correct,
        message: jsonData.message,
        reasoning: jsonData.reasoning
      };
    } catch (jsonError) {
      // If that fails, try to extract JSON from the response using regex
      try {
        console.log("Attempting to extract JSON using regex...");
        const jsonMatch = content.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
          // Clean the extracted JSON string - remove problematic characters
          let jsonStr = jsonMatch[0]
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
            .replace(/\\(?!["\\/bfnrt])/g, "\\\\"); // Escape backslashes
            
          const jsonData = JSON.parse(jsonStr);
          return {
            correct: jsonData.correct,
            message: jsonData.message,
            reasoning: jsonData.reasoning
          };
        }
      } catch (regexError) {
        console.error("Failed to extract valid JSON:", regexError);
      }
      
      // If all parsing attempts fail, return a mock response
      console.log("JSON parsing failed, using default response");
      return {
        correct: false,
        message: "I couldn't properly analyze your solution due to a technical issue. Please try again.",
        reasoning: "Response processing error"
      };
    }
  } catch (error) {
    console.error('Anthropic API error:', error);
    
    // For development purposes, provide a mock response
    console.log('Using mock response due to API error');
    return {
      correct: Math.random() > 0.5,
      message: "This is a mock response since the Anthropic API is not available. In a production environment, we would provide detailed feedback on your solution.",
      reasoning: "Mock reasoning process"
    };
  }
};

module.exports = {
  evaluateSolution
};