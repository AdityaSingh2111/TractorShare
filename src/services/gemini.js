import { GoogleGenerativeAI } from "@google/generative-ai";

// The API key is automatically provided by the environment.
// You do not need to hardcode it here.
const apiKey = ""; 
const genAI = new GoogleGenerativeAI(apiKey);

// We use the specific flash preview model for speed and cost-efficiency
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash-preview-09-2025" 
});

/**
 * Chat with the AI Farm Assistant.
 * Used by: GeminiAssistant.jsx
 */
export const chatWithFarmAssistant = async (userQuery, history = []) => {
  const systemPrompt = `
    You are "Kisan Sahayak", a helpful AI assistant on the TractorShare app.
    Your goal is to help farmers:
    1. Decide which equipment to rent (Tractors, Harvesters, Drones).
    2. Understand farming seasons and crop cycles.
    3. Calculate rough rental costs (assume avg tractor is ₹800-1200/hr, drone ₹2000/hr).
    
    Keep answers concise (under 50 words if possible) and easy to read. 
    Be polite and encourage them to rent from verified owners on the platform.
  `;

  try {
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
            role: "model",
            parts: [{ text: "Namaste! I am Kisan Sahayak. I can help you choose the right machinery for your farm. What are you planning to grow?" }]
        },
        ...history
      ],
    });

    const result = await chat.sendMessage(userQuery);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I am having trouble connecting to the farm network. Please try again later.";
  }
};