import React, { useState, useEffect, useRef } from 'react';
import '../css/TextMode.css';
import { chatService } from '../service/chatService';

const TextMode = ({ chatId, onSessionUpdate }) => {
  const [input, setInput] = useState('');
  const [messages, setMessage] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    console.log("text mode recheive the chatId : ", chatId);
    if (chatId) {
      chatService.getMessages(chatId)
        .then(data => {
          const msgs = Array.isArray(data) ? data : [];
          console.log('message loaded', msgs.length);
          setMessage(msgs);
    })
        .catch(err =>{ 
          console.error('Failed to fetch messages:', chatId ,err);
        });
    } else {
      console.log("no chatid provided clearing messages")
      setMessage([]);
    }
  }, [chatId]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    let currentChatId = chatId;
    if (!currentChatId) {
      try {
        const newChat = await chatService.createSession();
        currentChatId = newChat.id;
        window.history.replaceState(null, '', `/home/${currentChatId}`);
        if (onSessionUpdate) onSessionUpdate(currentChatId, null);
      } catch (err) {
        console.error('Failed to create session:', err);
        return;
      }
    }

    const userMessage = input;
    setInput('');
    setIsLoading(true);

    setMessage(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }]);

    try {
      const response = await chatService.sendMessage(currentChatId, userMessage);
      setMessage(prev => [...prev, {
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toISOString()
      }]);
      onSessionUpdate(currentChatId, response);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessage(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date().toISOString()
      }]);
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

  const isEmpty = messages.length === 0;

  return (
    <div className="text-mode">
      {/* Messages area */}
      <div className="chat-messages">
        {isEmpty && !isLoading && (
          <div className="chat-empty">
            <div className="chat-empty-icon">◆</div>
            <h3>Ask UmNi a math question</h3>
            <p>Type any math problem below and get a step-by-step solution.</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`chat-bubble ${msg.role}`}>
            <div className="bubble-avatar">
              {msg.role === 'user' ? 'U' : '◆'}
            </div>
            <div className="bubble-content">
              <div className="bubble-label">
                {msg.role === 'user' ? 'You' : 'UmNi'}
              </div>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="chat-bubble assistant">
            <div className="bubble-avatar">◆</div>
            <div className="bubble-content">
              <div className="bubble-label">UmNi</div>
              <div className="typing-dots">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-bar">
        <form onSubmit={handleSubmit} className="chat-input-form">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a math question… (Enter to send, Shift+Enter for newline)"
            disabled={isLoading}
            rows={1}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={isLoading || !input.trim()}
          >
            ↑
          </button>
        </form>
        <p className="chat-hint">UmNi can solve algebra, geometry, calculus, and more.</p>
      </div>
    </div>
  );
};

export default TextMode;
