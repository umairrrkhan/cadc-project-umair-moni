import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../css/LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@')) {
      setError('Enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setTimeout(() => (window.location.href = '/home'), 1000);
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="landing-header">
        <a href="/" className="landing-logo">
          <img src="/favicon.svg" alt="UmNi Logo" style={{ width: '26px', height: '26px', borderRadius: '6px' }} />
          UmNi
        </a>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/create-account">Create account</a>
        </nav>
      </header>
      <div className="login-page" style={{ minHeight: 'calc(100vh - 64px)' }}>
      
      <div className="login-brand">
        <div className="login-brand-body" style={{ marginTop: 0 }}>
          <h2>The AI math assistant<br />that reads your handwriting.</h2>
          <p>Draw. Ask. Solve — in seconds.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="login-form-panel">
        <div className="login-form-wrap">
          <h1>Welcome back</h1>
          <p className="login-sub">Sign in to your UmNi account</p>

          <form onSubmit={handleLogin} className="login-form">
            <div className="login-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="login-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <p className="login-footer-text">
            Don't have an account?{' '}
            <Link to="/create-account">Create one for free</Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default LoginPage;
