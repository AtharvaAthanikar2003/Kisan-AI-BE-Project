import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader, AlertCircle, Sparkles } from 'lucide-react';
import { generateGeminiResponse } from '../lib/gemini';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your Kisan AI assistant. How can I help you with your farming needs today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Clear any previous errors
    setError(null);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Get AI response using Gemini
      const response = await generateGeminiResponse(input);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to get response:', error);
      setError(error instanceof Error ? error.message : 'I apologize, but I encountered an error. Please try asking your question again.');
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  const commonQuestions = [
    "How to prevent common crop diseases in organic farming?",
    "What's the optimal irrigation schedule for water conservation?",
    "Best natural pest control methods for vegetable gardens?",
    "How to improve soil fertility without chemical fertilizers?"
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <Bot className="h-8 w-8 text-green-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm flex flex-col h-[600px]">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg mb-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.sender === 'bot' && (
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.sender === 'user'
                    ? 'bg-green-600 text-white dark:bg-green-700'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <span className={`text-xs mt-1 block ${
                  message.sender === 'user' 
                    ? 'text-green-100 dark:text-green-200 opacity-75' 
                    : 'text-gray-500 dark:text-gray-400 opacity-75'
                }`}>
                  {formatTime(message.timestamp)}
                </span>
              </div>

              {message.sender === 'user' && (
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-600 dark:bg-green-700 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 flex items-center">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about crop health, weather, or farming practices..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-green-700 dark:hover:bg-green-600 transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Common Questions</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {commonQuestions.map((question) => (
            <button
              key={question}
              onClick={() => handleQuickQuestion(question)}
              className="px-4 py-2 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50 text-sm transition-colors"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;