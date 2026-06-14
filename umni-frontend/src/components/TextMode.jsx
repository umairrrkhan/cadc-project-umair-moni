import React , {useState} from 'react';
import '../css/TextMode.css';
import '../service/chatService';

const TextMode = () => {
    const [input, setInput] = useState('');
    const [message, setMessage] = useState([]);
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
    }, [message]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim() || !chatId) return;
        const userMessage = input;
        setInput('');
        setIsLoading(true);

        setMessages(prev => [...prev, {
            role: 'user',
            content: userMessage,
            timestamp: new Date().toISOString()
        }]);

        try{
            const response = await chatService.sendMessage(chatId, userMessage);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.content,
                timestamp: new Date().toISOString()
            }]);
            onSessionUpdate(chatId, response);
        } catch (error) {
            console.error('Failed to send message:', error);

            setMessages(prev => [...prev, {
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
                    {message.map((msg, index) => (
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
                    disabled={!chatId || isLoading}
                />
                <button type='submit' disabled={!chatId || isLoading}>Send</button>
                </form>
            </div>
    );
};

export default TextMode;