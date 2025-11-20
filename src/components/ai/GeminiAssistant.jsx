import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `
You are "Kisan Sahayak", a helpful AI assistant on the TractorShare app.
Your goal is to help farmers:
1. Decide which equipment to rent based on crops (Wheat, Rice, Sugarcane, etc.).
2. Understand farming seasons.
3. Estimate rental costs (Tractors: ₹800-1200/hr, Drones: ₹1500-2500/acre).
Keep answers concise, friendly, and use emojis.
`;

// --- PASTE YOUR NEW AI STUDIO KEY HERE ---
const FALLBACK_API_KEY = "AIzaSyCKA1ex10R_o0lm2dQBA778mcObBBIjlNs"; 

export default function GeminiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Namaste! I am Kisan Sahayak 🤖. Ask me about tractors, harvesters, or rental prices!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || FALLBACK_API_KEY; 
      
      if (!apiKey || apiKey.includes("YOUR_NEW")) {
        throw new Error("Invalid API Key");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      
      // --- FIX IS HERE: CHANGED 1.5 TO 2.5 ---
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const history = [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "model", parts: [{ text: "Understood. I am ready to help farmers." }] },
        ...messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
        }))
      ];

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(userText);
      const responseText = result.response.text();

      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: `Error: ${error.message}. Try updating the app.` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 right-4 z-[60] p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${
          isOpen ? 'scale-0 opacity-0' : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white scale-100 opacity-100'
        }`}
      >
        <div className="relative">
             <Bot size={28} />
             <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        </div>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-4 z-[60] w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 origin-bottom-right">
          <div className="bg-gradient-to-r from-emerald-700 to-teal-700 p-4 flex justify-between items-center text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Kisan Sahayak</h3>
                <p className="text-[10px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="h-80 overflow-y-auto p-4 bg-gray-50 space-y-4 scrollbar-hide">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-emerald-600 text-white rounded-tr-none' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-none shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2 pb-safe">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about tractors..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="bg-emerald-600 text-white p-2.5 rounded-full hover:bg-emerald-700 disabled:opacity-50 shadow-sm"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}