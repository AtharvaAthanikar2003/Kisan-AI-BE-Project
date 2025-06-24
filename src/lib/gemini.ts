import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Create a reusable chat model instance
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export const generateGeminiResponse = async (prompt: string): Promise<string> => {
  try {
    // Validate API key
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    // Validate prompt
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt provided');
    }

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: 'You are an expert agricultural AI assistant. Your name is Kisan AI. You help farmers with their farming-related questions, providing accurate and helpful advice about crop management, soil health, pest control, and other agricultural topics. Keep your responses focused on farming and agriculture.',
        },
        {
          role: 'model',
          parts: 'I understand my role as Kisan AI, an expert agricultural assistant. I will focus on providing accurate, practical farming advice while maintaining a helpful and professional tone.',
        },
      ],
      generationConfig: {
        maxOutputTokens: 500, // Increased token limit for more detailed responses
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      },
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    
    if (!response.text()) {
      throw new Error('Empty response received from Gemini API');
    }

    return response.text();
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Please configure your Gemini API key properly');
      }
      if (error.message.includes('SAFETY')) {
        throw new Error('The request was flagged by safety filters. Please rephrase your question.');
      }
      throw new Error(`AI Assistant Error: ${error.message}`);
    }
    
    // Generic error
    throw new Error('Failed to generate response. Please try again.');
  }
};