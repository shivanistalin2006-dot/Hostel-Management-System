import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/login`, { username, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('username', res.data.user);
        localStorage.setItem('role', res.data.role);
        localStorage.setItem('name', res.data.name || res.data.user);
        localStorage.setItem('student_id', res.data.student_id || null);
        navigate('/app');
      }
    } catch (err) {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)'}}>
      <div className="card" style={{width: 400, padding: '2.5rem', borderTop: '4px solid var(--accent-primary)'}}>
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <Home color="var(--accent-primary)" size={48} style={{margin: '0 auto', marginBottom: '1rem'}} />
          <h2 style={{color: 'var(--text-primary)'}}>HostelSync ERP</h2>
          <p style={{color: 'var(--text-secondary)'}}>Sign in to continue</p>
        </div>
        
        {error && <div style={{background: 'var(--accent-light)', color: 'var(--accent-primary)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem'}}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="Enter your username" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Enter your password" 
              required 
            />
          </div>
          <button type="submit" className="btn-primary" style={{marginTop: '1rem', width: '100%'}}>Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
