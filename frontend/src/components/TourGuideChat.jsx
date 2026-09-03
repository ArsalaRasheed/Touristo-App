import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const TourGuideChat = ({ tourGuideId, tourGuideName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const { user } = useAuth(); // Get user object from AuthContext
  const userIdFromContext = user?.id; // Extract user ID from the context
  const authToken = localStorage.getItem('touristo_token');

  // Function to scroll to the bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch existing messages when component mounts or when messages change
  useEffect(() => {
    const fetchMessages = async () => {
      if (!userIdFromContext || !tourGuideId) return;
      
      try {
        setLoading(true);
        // In a real app, we'd have the tour guide's user ID, but for now we'll simulate
        // For this implementation, we'll assume tour guide IDs correspond to user IDs
        const response = await fetch(`http://localhost:3000/api/messages/conversation/${userIdFromContext}/${tourGuideId}`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setMessages(data.data || []);
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [tourGuideId, userIdFromContext]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userIdFromContext || !tourGuideId) return;

    try {
      // Prepare the new message object
      const messageData = {
        sender_id: parseInt(userIdFromContext),
        receiver_id: parseInt(tourGuideId),
        content: newMessage.trim()
      };

      // Send the message to the backend
      const response = await fetch('http://localhost:3000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const sentMessage = result.data;

      // Add the new message to the local state
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  if (!userIdFromContext) {
    return (
      <div className="bg-[color:var(--surface-primary)] p-4 rounded-xl border border-[color:var(--border-primary)] text-center">
        <p className="text-[color:var(--text-secondary)]">Please log in to chat with tour guides.</p>
      </div>
    );
  }

  return (
    <div className="bg-[color:var(--surface-primary)] rounded-xl border border-[color:var(--border-primary)] flex flex-col h-96">
      <div className="p-4 border-b border-[color:var(--border-primary)]">
        <h3 className="font-bold text-[color:var(--text-primary)]">Chat with {tourGuideName}</h3>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-3 max-h-64">
        {loading ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[color:var(--accent-primary)]"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-4 text-[color:var(--text-secondary)]">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={msg.id || index} 
              className={`flex ${msg.sender_id == userIdFromContext ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  msg.sender_id == userIdFromContext 
                    ? 'bg-[color:var(--accent-primary)] text-[color:var(--nav-text)]' 
                    : 'bg-[color:var(--surface-secondary)] text-[color:var(--text-primary)]'
                }`}
              >
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.sender_id == userIdFromContext ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="p-4 border-t border-[color:var(--border-primary)] flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow p-2 rounded-l-lg border border-[color:var(--border-primary)] bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--accent-primary)]"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-[color:var(--accent-primary)] text-[color:var(--nav-text)] px-4 py-2 rounded-r-lg hover:bg-[color:var(--accent-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default TourGuideChat;