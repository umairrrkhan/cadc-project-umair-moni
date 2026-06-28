import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/TextMode.css';
import { chatService } from '../service/chatService';

const TextMode = ({ chatId, onSessionUpdate }) => {
  const [input, setInput] = useState('');
  const [messages, setMessage] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const pollRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startPolling = (sessionId) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const data = await chatService.getMessages(sessionId);
        const msgs = Array.isArray(data) ? data : [];
        const last = msgs[msgs.length - 1];
        if (last && last.role === 'assistant') {
          setMessage(msgs);
          clearInterval(pollRef.current);
          pollRef.current = null;
          setIsLoading(false);
          if (chatId !== sessionId) {
            navigate(`/home/${sessionId}`, { replace: true });
          }
        }
      } catch (_) {}
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

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
      let retries = 2;
      while (retries > 0) {
        try {
          const newChat = await chatService.createSession();
          currentChatId = newChat.id;
          break;
        } catch (err) {
          retries--;
          console.error('createSession failed', { status: err.response?.status, data: err.response?.data, msg: err.message, retries });
          if (retries <= 0) {
            setMessage(prev => [...prev, {
              role: 'assistant',
              content: 'Failed to create chat session. Please try again.',
              timestamp: new Date().toISOString()
            }]);
            return;
          }
          await new Promise(r => setTimeout(r, 1000));
        }
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
      if (onSessionUpdate) onSessionUpdate(currentChatId, response);
      if (chatId !== currentChatId) {
        navigate(`/home/${currentChatId}`, { replace: true });
      }
      setIsLoading(false);
    } catch (error) {
      console.error('sendMessage failed, polling:', error);
      startPolling(currentChatId);
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
              <div className="message-formatted-body">
                {renderFormattedMessage(msg.content)}
              </div>
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

const parseInlineMarkdown = (text) => {
  if (!text) return '';
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    const subParts = part.split(/(\*.*?\*|`.*?`)/g);
    return subParts.map((subPart, subIndex) => {
      if (subPart.startsWith('*') && subPart.endsWith('*')) {
        return <em key={`${index}-${subIndex}`}>{subPart.slice(1, -1)}</em>;
      }
      if (subPart.startsWith('`') && subPart.endsWith('`')) {
        return <code key={`${index}-${subIndex}`} className="inline-code">{subPart.slice(1, -1)}</code>;
      }
      return subPart;
    });
  });
};

const formatTextWithMarkdown = (text, keyPrefix) => {
  const lines = text.split('\n');
  return (
    <div key={keyPrefix} className="text-paragraphs">
      {lines.map((line, lineIndex) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('### ')) {
          return <h3 key={lineIndex}>{parseInlineMarkdown(trimmed.slice(4))}</h3>;
        }
        if (trimmed.startsWith('## ')) {
          return <h2 key={lineIndex}>{parseInlineMarkdown(trimmed.slice(3))}</h2>;
        }
        if (trimmed.startsWith('# ')) {
          return <h1 key={lineIndex}>{parseInlineMarkdown(trimmed.slice(2))}</h1>;
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return <li key={lineIndex} className="list-item">{parseInlineMarkdown(trimmed.slice(2))}</li>;
        }
        if (trimmed.length === 0) {
          return <div key={lineIndex} className="line-break" />;
        }
        return <p key={lineIndex}>{parseInlineMarkdown(line)}</p>;
      })}
    </div>
  );
};

const renderFormattedMessage = (content) => {
  if (!content) return null;

  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith('```')) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      const language = match ? match[1] : '';
      const code = match ? match[2] : part.slice(3, -3).trim();
      return (
        <pre key={index} className="code-block">
          {language && <div className="code-lang">{language}</div>}
          <code>{code}</code>
        </pre>
      );
    }

    const subParts = part.split(/(\$\$[\s\S]*?\$\$)/g);
    return subParts.map((subPart, subIndex) => {
      if (subPart.startsWith('$$') && subPart.endsWith('$$')) {
        const math = subPart.slice(2, -2).trim();
        return (
          <div key={`${index}-${subIndex}`} className="math-block">
            {math}
          </div>
        );
      }

      const inlineParts = subPart.split(/(\$[^\$]*?\$|\\\(.*?\\\))/g);
      return inlineParts.map((inlinePart, inlineIndex) => {
        if ((inlinePart.startsWith('$') && inlinePart.endsWith('$')) || 
            (inlinePart.startsWith('\\(') && inlinePart.endsWith('\\)'))) {
          const math = inlinePart.startsWith('$') ? inlinePart.slice(1, -1).trim() : inlinePart.slice(2, -2).trim();
          return (
            <span key={`${index}-${subIndex}-${inlineIndex}`} className="math-inline">
              {math}
            </span>
          );
        }

        return formatTextWithMarkdown(inlinePart, `${index}-${subIndex}-${inlineIndex}`);
      });
    });
  });
};

export default TextMode;
