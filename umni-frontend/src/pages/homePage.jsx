import React from 'react';
import Sidebar from '../components/Sidebar';
import TextMode from '../components/TextMode';
import VisionMode from '../components/VisionMode';
import '..css/homePage.css  ';

const homepage = () => {

    const [mode , setMode] = React.useState('text');
    const[conversation , setConversation] = React.useState([
        {id:1 , title:'Chat 1' , group:'yesterday'},
        {id:2 , title:'Chat 2' , group:'lastWeek'},
        {id:3 , title:'Chat 3' , group:'lastMonth'},
    ]);

    const handleNewChat = () => {
        console.log('New Chat');
    };

    return (
        <div className='home-layout'>
            <Sidebar conversation={conversation} onNewChat={handleNewChat}/>
            <div className='main-content'>
                <div className='mode-toggle'>
                    <button onClick={() => setMode('text')} className={mode === 'text' ? 'active' : ''}>Text Mode</button>
                    <button onClick={() => setMode('vision')} className={mode === 'vision' ? 'active' : ''}>Vision Mode</button>
                </div>
                {mode === 'text' ? <TextMode /> : <VisionMode />}
            </div>
        </div>
    )
    const logout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };
    return (
        <div style={{padding:20}}>
            <h2>Welcome to UmNi Home Page</h2>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

export default homepage;