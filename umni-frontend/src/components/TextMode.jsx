import React , {useState , useEffect , useRef} from 'react';
import '../css/TextMode.css';
import {chatService} from '../service/chatService';

const TextMode = ({chatId , onSessionUpdate}) => {
    const [input, setInput] = useState('');
    const [messages, setMessage] = useState([]);
    const [isLoading , setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    };

    useEffect(() => {
        if(chatId){
            chatService.getMessages(chatId)
            .then(data => 
                setMessage(data))
            .catch(err => 
                console.error('Failed to fetch messages:', err))
            }else {
                setMessage([]);
            }
        },[chatId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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

        try{
            const response = await chatService.sendMessage(currentChatId, userMessage);
            setMessage(prev => [...prev, {
                role: 'assistant',
                content: response.content,
                timestamp: new Date().toISOString()
            }]);
            onSessionUpdate(currentChatId, response);
        } catch (error) {
            console.error('Failed to send message:', error);

            setMessage(prev => [...prev, {
                role: 'assistant',
                content: 'Failed to send message. Please try again.',
                timestamp: new Date().toISOString()
            }]);
        }finally{
            setIsLoading(false);
        }
    };

    return (
        <div className='text-mode'>
            <div className='chat-messages'>
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.role}`}>
                            <strong>{msg.role === 'user' ? 'You' : 'UmNi'}:</strong> 
                            <p>{msg.content}</p>
                        </div>
                    ))}

                    {isLoading && <div className='message assistant'>UmNi is typing...</div> }

                    <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className='input-section'>
                <input
                    type='text'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder='Type your message...'
                    disabled={isLoading}
                />
                <button type='submit' disabled={isLoading}>Send</button>
                </form>
            </div>
    );
};

export default TextMode;