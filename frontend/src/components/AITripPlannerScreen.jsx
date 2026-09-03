import React, { useState, useEffect, useRef } from 'react';

// Simple function to render markdown-like formatting
const renderMarkdown = (text) => {
  // Split the text by ** for bold formatting
  const parts = text.split('**');
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      // This is the content between ** and **
      return <strong key={index}>{part}</strong>;
    }
    return part;
  });
};

const AITripPlannerScreen = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI travel assistant. Where would you like to go in Pakistan?", sender: 'ai' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    // Use Promise.resolve().then() to ensure scrolling happens after rendering is complete
    Promise.resolve().then(() => {
      if (chatContainerRef.current) {
        // Scroll to bottom of the container for maximum reliability
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      } else {
        // Fallback to scrollIntoView if container ref is not available
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (inputValue.trim()) {
      // Add user message
      const userMessage = { id: Date.now(), text: inputValue, sender: 'user' };
      setMessages(prev => [...prev, userMessage]);
      
      try {
        // Clear input
        setInputValue('');
              
        // Show loading indicator
        setIsLoading(true);
        
        // Determine the correct API URL based on environment
        const apiUrl = process.env.NODE_ENV === 'production' 
          ? '/api/trip-planner' 
          : '/api/trip-planner';
        
        // Call the backend API
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            message: inputValue,
            userId: 'temp-user-id' // In a real app, this would be the authenticated user's ID
          }),
        });
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // Add AI response
        const aiMessage = { 
          id: Date.now() + 1, 
          text: data.message, 
          sender: 'ai',
          recommendedPackages: data.recommendedPackages || []
        };
        
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error('Error getting AI response:', error);
        
        // Add error message
        const errorMessage = { 
          id: Date.now() + 1, 
          text: "Sorry, I'm having trouble connecting to the AI service right now. Please try again later.", 
          sender: 'ai' 
        };
        
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        // Always reset loading state to allow new messages
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSend();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[color:var(--bg-primary)] p-4 pb-32"> {/* Increased pb to account for fixed input area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6 text-center text-[color:var(--text-primary)]">AI Trip Planner</h1>
        
        <div className="space-y-4 mb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg max-w-[80%] ${
                msg.sender === 'user'
                  ? 'ml-auto bg-[color:var(--accent-primary)] text-[color:var(--nav-text)] rounded-br-none'
                  : 'mr-auto bg-[color:var(--surface-primary)] text-[color:var(--text-primary)] rounded-bl-none border border-[color:var(--border-primary)]'
              }`}
            >
              <div>{renderMarkdown(msg.text)}</div>
              {msg.recommendedPackages && msg.recommendedPackages.length > 0 && (
                <div className="mt-2 pt-2 border-t border-[color:var(--border-primary)]">
                  <p className="font-semibold">Recommended packages:</p>
                  <ul className="mt-1 space-y-1">
                    {msg.recommendedPackages.map((pkg, idx) => (
                      <li key={idx} className="text-sm flex">
                        <span className="mr-2">•</span>
                        <span>{pkg.title}: {pkg.description} (PKR {pkg.price})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="mr-auto bg-[color:var(--surface-primary)] text-[color:var(--text-primary)] rounded-lg border border-[color:var(--border-primary)] p-3 max-w-[80%] rounded-bl-none">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-[color:var(--accent-primary)] rounded-full mr-1 animate-pulse"></div>
                <div className="w-2 h-2 bg-[color:var(--accent-primary)] rounded-full mr-1 animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-[color:var(--accent-primary)] rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full fixed bottom-16 left-0 right-0 p-4 bg-[color:var(--bg-primary)]"> {/* Fixed position above bottom nav */}
        <div className="flex mx-4 bg-[color:var(--surface-primary)] rounded-lg border border-[color:var(--border-primary)]">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about destinations, activities, etc..."
            disabled={isLoading}
            className={`flex-1 p-3 border border-[color:var(--border-primary)] rounded-l-lg focus:outline-none focus:ring-1 focus:ring-[color:var(--accent-primary)] bg-[color:var(--surface-primary)] text-[color:var(--text-primary)] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className={`bg-[color:var(--accent-primary)] hover:bg-[color:var(--accent-primary-hover)] text-[color:var(--nav-text)] px-4 py-3 rounded-r-lg font-medium transition duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AITripPlannerScreen;