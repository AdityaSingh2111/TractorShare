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
 * Generates a helpful description for farm equipment.
 * Used by: ListingGenerator.jsx
 */
export const generateListingDescription = async (details) => {
  const prompt = `
    You are a marketing expert for "TractorShare", a farm equipment rental app.
    Write a short, attractive, and trustworthy description (max 3 sentences) for this equipment:
    - Type: ${details.type}
    - Model: ${details.model}
    - Power/Capacity: ${details.specs}
    - Location: ${details.location}

    Highlight its reliability and suitability for local farming. 
    Do not use hashtags. Use a professional but friendly tone.
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    return result.response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Could not generate description. Please try again.");
  }
};

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