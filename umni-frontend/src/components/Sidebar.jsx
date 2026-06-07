import React , {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import '../css/Sidebar.css  ';  

const Sidebar = () => ({ conversation  = [] , onNewChat}) => {
    const[collapsed , setCollapsed] = useState(false);
    const navigate = useNavigate(); 

    const grouped={
        yesterday: conversation.filter(c => c.group=='yesterday'),
        lastWeek: conversation.filter(c => c.group=='lastWeek'),
        lastMonth: conversation.filter(c => c.group=='lastMonth'),  
    };

    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className='sidebar-header'>
                <img src='/logo.svg' alt='Logo' className='logo'/>
                {!collapsed&& <span className = "sidebar-brand">UmNi</span>}
                <div className = "sidebar-icons">
                    <button onClick={() => setCollapsed(!collapsed)} title="Toggle">☰</button>
                </div>
            </div>
            {!collapsed && (
                <>
                <button className='new-chat-btn' onClick={onNewChat}>+ New Chat</button>
                <div className="conversation-list">
            {Object.entries(grouped).map(([label, items]) =>
              items.length > 0 ? (
                <div key={label} className="conv-group">
                  <p className="conv-group-label">{label}</p>
                  {items.map((conv, i) => (
                    <div
                      key={i}
                      className="conv-item"
                      onClick={() => navigate(`/chat/${conv.id}`)}
                    >
                      {conv.title}
                    </div>
                  ))}
                </div>
              ) : null
            )}
          </div>

          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">M</div>
              <span className="user-email">mag*****07@gmail.com</span>
            </div>
          </div>
                </>)}

        </div>
    );
};

export default Sidebar;