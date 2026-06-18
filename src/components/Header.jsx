import { useNavigate } from 'react-router-dom';
import '../css/Header.css';

const Header = ({ mode, setMode }) => {
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <div className="app-header-left">
        <span className="app-header-logo-icon">◆</span>
        <span className="app-header-logo-text">UmNi</span>
      </div>

      <div className="app-header-modes">
        <button
          className={`mode-tab ${mode === 'text' ? 'active' : ''}`}
          onClick={() => setMode('text')}
        >
          💬 Text Chat
        </button>
        <button
          className={`mode-tab ${mode === 'vision' ? 'active' : ''}`}
          onClick={() => setMode('vision')}
        >
          ✏️ Vision Tab
        </button>
      </div>

      <div className="app-header-right">
        <button className="header-icon-btn" title="Go home" onClick={() => navigate('/home')}>⌂</button>
      </div>
    </header>
  );
};

export default Header;
