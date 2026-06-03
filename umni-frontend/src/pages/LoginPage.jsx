import { useState } from 'react';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setMessage('Login successful! Redirecting...');
      setTimeout(() => window.location.href = '/home', 1000);
    } catch (err) {
      setMessage('Invalid credentials');
    }
  };

  return (
    <div style={{padding:20}}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required /><br/>
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required /><br/>
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
      <a href="/create-account">Create account</a>
    </div>
  );
};

export default LoginPage;