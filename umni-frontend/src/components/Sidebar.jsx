import React, { useState , useEffect } from 'react';
import '../css/Sidebar.css';
import {chatService } from '../service/chatService';

const Sidebar = ({ onNewChat }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [sessions, setSessions] = useState([]);

    const loadSessions = async () => {
        try {
            const data = await chatService.getSessions();
            setSessions(data);
        } catch (error) {
            console.error('Failed to load sessions:', error);
        }
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setDate(today.getDate() - 30);

    const grouped = {
        'Today': sessions.filter(c => new Date(c.createdAt) >= today),
        'Yesterday': sessions.filter(c => new Date(c.createdAt) >= yesterday && new Date(c.createdAt) < today),
        'Last7Days': sessions.filter(c => new Date(c.createdAt) >= lastWeek && new Date(c.createdAt) < yesterday),
        'older': sessions.filter(c => new Date(c.createdAt) < lastWeek)
    };

    const handleNewChatClick = async () => {
        try{
            const newSession = await chatService.createSession();
            setSessions(prev => [newSession , ...prev]);
            window.location.href = `/home/${newSession.id}`;
        }catch(error){
            console.error("failed to create new chat:" , error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    useEffect(() => {
        loadSessions();
    }, []);

    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className='sidebar-header'>
                <img src='/logo.svg' alt='Logo' className='logo'/>
                {!collapsed && <span className="sidebar-brand">UmNi</span>}
                <div className="sidebar-icons">
                    <button onClick={() => setCollapsed(!collapsed)} title="Toggle">☰</button>
                </div>
            </div>
            {!collapsed && (
                <>
                    <button className='new-chat-btn' onClick={handleNewChatClick}>+ New Chat</button>
                    <div className="conversation-list">
                        {Object.entries(grouped).map(([label, items]) =>
                            items.length > 0 ? (
                                <div key={label} className="conv-group">
                                    <p className="conv-group-label">{label}</p>
                                    {items.map((conv, i) => {
                                        const isActive = window.location.pathname === `/home/${conv.id}`;
                                        return (
                                        <div
                                            key={i}
                                            className={`conv-item ${isActive ? 'active' : ''}`}
                                            onClick={() => {
                                                if (!conv.id) return;
                                                console.log('Clicked chat ID:', conv.id);
                                                window.location.href = `/home/${conv.id}`;
                                          }}
                                        >
                                            {conv.title}
                                        </div>
                                        );
                                    })}
                                </div>
                            ) : null
                        )}
                    </div>
                    <div className="sidebar-footer">
                        <div className="user-profile-btn" onClick={() => setShowProfile(!showProfile)}>
                            <div className="user-avatar">U</div>
                            <span className="user-name">User</span>
                            <span className="profile-arrow">{showProfile ? '▼' : '▲'}</span>
                        </div>
                        {showProfile && (
                            <div className="profile-dropdown">
                                <div className="profile-dropdown-item" onClick={() => { window.location.href = '/profile'; }}>
                                    Profile
                                </div>
                                <div className="profile-dropdown-item" onClick={handleLogout}>
                                    Logout
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Sidebar;
