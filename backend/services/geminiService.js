const axios = require('axios');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config(); // Load environment variables from .env

// Function to interact with Gemini API
const getGeminiResponse = async (message, userId) => {
  try {
    // Get user's financial data
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Create a context with user's financial data
    const financialContext = `
      User's Financial Information:
      - Business Name: ${user.businessName || 'Not specified'}
      - Non-Current Assets: ${user.nonCurrentAssets || 'Not specified'} ${user.currency || ''}
      - Non-Current Assets Description: ${user.nonCurrentAssetsDesc || 'Not specified'}
      - Liabilities: ${user.liabilities || 'Not specified'} ${user.currency || ''}
      - Liabilities Description: ${user.liabilitiesDesc || 'Not specified'}
      - Equity: ${user.equity || 'Not specified'} ${user.currency || ''}
      - Equity Description: ${user.equityDesc || 'Not specified'}
      - Currency: ${user.currency || 'Not specified'}
    `;

    // Prepare the prompt with financial context
    const prompt = `
    You are a financial assistant for ${user.firstName || 'the user'}. 
    Here is the current financial context:
    ${financialContext}

    User's question: ${message}

    Please provide a simple, professional response that takes into account the user's financial context.
    Focus on providing accurate details but only provide the necessary things that are asked. Give the whole explanation only when it's asked to explain. and dont mention the username when replying. make it simple and short as possible.
    `;

    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set in environment variables');
      return {
        candidates: [{
          content: {
            parts: [{
              text: "I'm sorry, but I'm currently unable to access the AI service. This is likely due to a configuration issue with the API key. Please contact the system administrator."
            }]
          }
        }]
      };
    }

    // Request to Gemini API
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (apiError) {
      console.error('Gemini API error details:', apiError.response ? apiError.response.data : apiError.message);
      
      // Return a fallback response
      return {
        candidates: [{
          content: {
            parts: [{
              text: "I'm sorry, but I'm having trouble connecting to the AI service right now. This could be due to an API key issue or service availability. Please try again later or contact support."
            }]
          }
        }]
      };
    }
  } catch (error) {
    console.error('Error in getGeminiResponse:', error);
    throw new Error(`Failed to get AI response: ${error.message}`);
  }
};

module.exports = getGeminiResponse;
