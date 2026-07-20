import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../css/LoginPage.css";

const CreateAccountPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address (eg = user@gmail.com)');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8080/api/auth/signup", { email, password },
        { headers: { "Content-Type": "application/json" } }
      );
      localStorage.setItem("token", response.data.token);
      setMessage("Account created successfully!");
      setError("");
      setTimeout(() => window.location.href = "/home", 2000);
    } catch (error) {
      console.error("Full signup error:", error);
      const errMsg = error.response?.data?.error || error.message || "Error creating account. Please try again.";
      setError(errMsg);
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="landing-header">
        <a href="/" className="landing-logo"><span>◆</span> UmNi</a>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/login">Sign in</a>
        </nav>
      </header>
      <div className="login-page" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="login-brand">
          <div className="login-brand-body" style={{ marginTop: 0 }}>
            <h2>The AI math assistant<br />that reads your handwriting.</h2>
            <p>Draw. Ask. Solve — in seconds.</p>
          </div>
        </div>

        <div className="login-form-panel">
          <div className="login-form-wrap">
            <h1>Create account</h1>
            <p className="login-sub">Start solving with AI</p>

            <form onSubmit={handleSubmit} className="login-form">
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
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="login-error">{error}</p>}
              {message && <p className="login-error" style={{ color: '#16a34a' }}>{message}</p>}

              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? 'Creating account…' : 'Create account →'}
              </button>
            </form>

            <p className="login-footer-text">
              Already have an account?{' '}
              <Link to="/login">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateAccountPage;
