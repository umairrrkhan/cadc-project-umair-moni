import React , {useEffect} from 'react';
import { useNavigate ,useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TextMode from '../components/TextMode';
import VisionMode from '../components/VisionMode';
import {chatService} from '../service/chatService';
import '../css/HomePage.css';

const Homepage = () => {
    const navigate = useNavigate();
    const {chatId} = useParams();
    const [mode , setMode] = React.useState('text');

    const handleNewChat = () => {
        chatService.createSession?.()
        .then(newChat =>{
            navigate(`/home/${newChat.id}`);
        })
        .catch(err => console.error ('failed to create the chat : ' , err));
    };

    useEffect(() => {
        if(mode === 'text' && !chatId){
            chatService.createSession?.()
            .then(newChat => {
                navigate(`/home/${newChat.id}`);
            })
            .catch(err => console.error('failed to create chat',err));
        }  
    }, [mode , chatId ,navigate]);

    return (
        <div className='home-layout'>
            <Sidebar onNewChat={handleNewChat}/>
            <div className='main-content'>
                <div className='mode-toggle'>
                    <button onClick={() => setMode('text')} className={`mode-btn ${mode === 'text' ? 'active' : ''}`}>Text Mode</button>
                    <button onClick={() => setMode('vision')} className={`mode-btn ${mode === 'vision' ? 'active' : ''}`}>Vision Mode</button>
                </div>
                {mode === 'text' ? <TextMode chatId = {chatId} onSessionUpdate = {(id,response) => 
                    console.log('sessin updated',id)
                } /> : <VisionMode />}
            </div>
        </div>
    );
};

export default Homepage;
