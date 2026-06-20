import React, { useState , useEffect } from 'react';
import { useLocation , useNavigate } from 'react-router-dom';
import '../css/Sidebar.css';
import {chatService } from '../service/chatService';

const Sidebar = ({ onNewChat }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [sessions, setSessions] = useState([]);
    const location = useLocation();
    const [dropdownOpen , setDropdownOpen] = useState(null);
    const navigate = useNavigate();

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

    const handleNewChatClick = () => {
        navigate('/home')
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleDeleteChat = async (chatId) => {
        if(!window.confirm('delete this conversation')) return ;
        try{
            await chatService.deleteSession(chatId);
            setSessions(prev => prev.filter(s => s.id !== chatId));
            setDropdownOpen(null);

            if(location.pathname === `/home/${chatId}`){
                navigate('/home');
            }
        } catch(err){
            console.error("failed to delete chat: " ,err);
            alert("count not delete the conversation.")
        }
    };

    useEffect(() => {
        loadSessions();
    }, [location.pathname]);

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
                                        const isActive = location.pathname === `/home/${conv.id}`;
                                        return (
                                        <div
                                            key={conv.id}
                                            className={`conv-item ${isActive ? 'active' : ''}`}
                                            onClick={() => {
                                                if (!conv.id) return;
                                                console.log('Clicked chat ID:', conv.id);
                                                navigate(`/home/${conv.id}`);
                                          }}
                                        >
                                            <span className="conv-title">{conv.title}</span>
                                            <button
                                            className="conv-menu-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDropdownOpen(
                                                    dropdownOpen === conv.id ? null : conv.id 
                                                );
                                            }}
                                            >
                                                :
                                            </button>

                                            {dropdownOpen === conv.id && (
                                                <div className = "conv-dropdown">
                                                    <button
                                                    className = "conv-dropdown-item delete"
                                                    onClick={(e) =>{
                                                        e.stopPropagation();
                                                        handleDeleteChat(conv.id);
                                                    }}
                                                    >
                                                        delete
                                                    </button>
                                                </div>
                                            )}
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
