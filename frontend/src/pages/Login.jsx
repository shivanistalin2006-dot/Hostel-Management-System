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
        navigate('/');
      }
    } catch (err) {
      setError('Invalid credentials. Use admin / admin123');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <Home color="#10b981" size={48} style={{margin: '0 auto', marginBottom: '1rem'}} />
          <h2>Welcome to HostelSync</h2>
          <p style={{color: '#64748b'}}>Sign in to continue</p>
        </div>
        
        {error && <div style={{background: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem'}}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="Enter username (admin)" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Enter password (admin123)" 
              required 
            />
          </div>
          <button type="submit" className="btn-primary" style={{marginTop: '1rem'}}>Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
