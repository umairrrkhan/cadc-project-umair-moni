import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TextMode from '../components/TextMode';
import VisionMode from '../components/VisionMode';
import '../css/HomePage.css';

const Homepage = () => {
    const navigate = useNavigate();
    const [mode , setMode] = React.useState('text');
    const[conversation , setConversation] = React.useState([
        {id:1 , title:'Chat 1' , group:'yesterday'},
        {id:2 , title:'Chat 2' , group:'lastWeek'},
        {id:3 , title:'Chat 3' , group:'lastMonth'},
    ]);

    const handleNewChat = () => {
        navigate('/home');
    };

    return (
        <div className='home-layout'>
            <Sidebar conversation={conversation} onNewChat={handleNewChat}/>
            <div className='main-content'>
                <div className='mode-toggle'>
                    <button onClick={() => setMode('text')} className={`mode-btn ${mode === 'text' ? 'active' : ''}`}>Text Mode</button>
                    <button onClick={() => setMode('vision')} className={`mode-btn ${mode === 'vision' ? 'active' : ''}`}>Vision Mode</button>
                </div>
                {mode === 'text' ? <TextMode /> : <VisionMode />}
            </div>
        </div>
    );
};

export default Homepage;