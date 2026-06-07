import React , {useState} from 'react';
import '../css/TextMode.css  ';

const TextMode = () => {
    const [input, setInput] = useState('');
    const [response, setResponse] = useState('');

    const handleSubmit = (e) => {
        if (!input.trim()) return;
        console.log('User Input:', input);
        setResponse('This is a simulated response to: ' + input);
        setInput('');
    };

    return (
        <div className='text-mode'>
            <div className='input-section'>
                <input
                    type='text'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder='Type your message...'
                />
                <button onClick={handleSubmit}>Send</button>
            </div>
            <div className='response-section'>
                <p>{response}</p>
            </div>
        </div>
    );
};

export default TextMode;