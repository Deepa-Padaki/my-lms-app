import { useState, useRef, useEffect } from 'react';
import './FriendliAI.css';

const FRIENDLI_API_KEY = import.meta.env.VITE_FRIENDLI_API_KEY || '';
const FRIENDLI_API_URL = 'https://inference.friendli.ai/v1/chat/completions';

export default function FriendliAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Debug: Log API key status on mount
  useEffect(() => {
    console.log('FriendliAI Component Mounted');
    console.log('API Key loaded:', FRIENDLI_API_KEY ? 'Yes (length: ' + FRIENDLI_API_KEY.length + ')' : 'No');
    console.log('API Key first 10 chars:', FRIENDLI_API_KEY ? FRIENDLI_API_KEY.substring(0, 10) + '...' : 'N/A');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (!FRIENDLI_API_KEY) {
      setError('Please add your Friendli.ai API key to .env file');
      return;
    }

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      console.log('Sending request to Friendli.ai...');
      console.log('API Key present:', FRIENDLI_API_KEY ? 'Yes' : 'No');
      
      const response = await fetch(FRIENDLI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${FRIENDLI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'meta-llama-3.1-8b-instruct',
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant for a Learning Management System. Help students with their questions about courses, programming, and learning.' },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: input }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      const aiMessage = { 
        role: 'assistant', 
        content: data.choices[0].message.content 
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Friendli.ai API Error:', err);
      setError(`Error: ${err.message}`);
      const errorMessage = { 
        role: 'assistant', 
        content: `Error: ${err.message}. Please check your API key or try again later.` 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <>
      {/* Fixed Button */}
      <button 
        className="friendli-button"
        onClick={() => setIsOpen(true)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
        Friendli.ai
      </button>

      {/* Chat Overlay */}
      {isOpen && (
        <div className="friendli-overlay">
          <div className="friendli-chat-container">
            {/* Header */}
            <div className="friendli-header">
              <div className="friendli-brand">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                <span>Friendli.ai</span>
              </div>
              <div className="friendli-header-actions">
                <button className="friendli-action-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                </button>
                <button className="friendli-action-btn" onClick={() => setIsOpen(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="friendli-messages">
              {error && (
                <div className="friendli-error">
                  {error}
                </div>
              )}
              {messages.length === 0 ? (
                <div className="friendli-welcome">
                  <h1>What can I help with?</h1>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div key={index} className={`friendli-message ${msg.role}`}>
                    <div className="friendli-message-content">
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="friendli-message assistant">
                  <div className="friendli-message-content friendli-loading">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="friendli-input-container">
              <form onSubmit={handleSubmit} className="friendli-input-form">
                <button type="button" className="friendli-attach-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </button>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything"
                  rows="1"
                  className="friendli-textarea"
                />
                <button type="button" className="friendli-mic-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                </button>
                <button 
                  type="submit" 
                  className={`friendli-send-btn ${input.trim() ? 'active' : ''}`}
                  disabled={!input.trim() || isLoading}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
