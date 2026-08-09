import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Home, Eye, EyeOff } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Login = () => {
  const [activeTab, setActiveTab] = useState('student'); // 'student', 'warden', 'admin'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  // For Demo Google Login
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/login`, { username, password });
      handleLoginSuccess(res.data);
    } catch (err) {
      setError('Invalid username or password. Please try again.');
    }
  };

  const handleGoogleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/login/google`, { email: googleEmail });
      handleLoginSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Google Login failed.');
      setShowGoogleModal(false);
    }
  };

  const handleLoginSuccess = (data) => {
    if (data.success) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.user);
      localStorage.setItem('role', data.role);
      localStorage.setItem('name', data.name || data.user);
      localStorage.setItem('student_id', data.student_id || null);
      localStorage.setItem('warden_id', data.warden_id || null);
      localStorage.setItem('hostel_id', data.hostel_id || null);
      navigate('/app');
    }
  };

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)'}}>
      <div className="card" style={{width: 450, padding: '2.5rem', borderTop: '4px solid var(--accent-primary)', position: 'relative', overflow: 'hidden'}}>
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
          <Home color="var(--accent-primary)" size={48} style={{margin: '0 auto', marginBottom: '1rem'}} />
          <h2 style={{color: 'var(--text-primary)'}}>HostelSync ERP</h2>
          <p style={{color: 'var(--text-secondary)'}}>Sign in to continue</p>
        </div>
        
        {/* Tabs */}
        <div style={{display: 'flex', borderBottom: '2px solid var(--border-color)', marginBottom: '2rem'}}>
          {['student', 'warden', 'admin'].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setError(''); }}
              style={{
                flex: 1, 
                padding: '0.75rem', 
                background: 'none', 
                border: 'none', 
                borderBottom: activeTab === tab ? '2px solid var(--accent-primary)' : '2px solid transparent',
                color: activeTab === tab ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {error && <div style={{background: 'var(--accent-light)', color: 'var(--accent-primary)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem'}}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username or Email</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder={`Enter your ${activeTab} username`} 
              required 
            />
          </div>
          <div className="form-group" style={{position: 'relative'}}>
            <label>Password</label>
            <input 
              type={showPassword ? "text" : "password"}
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Enter your password" 
              required 
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '38px',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button type="submit" className="btn-primary" style={{marginTop: '1rem', width: '100%'}}>Login</button>
        </form>

        <div style={{display: 'flex', alignItems: 'center', margin: '1.5rem 0'}}>
          <div style={{flex: 1, height: '1px', background: 'var(--border-color)'}}></div>
          <span style={{padding: '0 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600}}>OR</span>
          <div style={{flex: 1, height: '1px', background: 'var(--border-color)'}}></div>
        </div>

        <button 
          onClick={() => setShowGoogleModal(true)}
          style={{
            width: '100%', 
            padding: '0.75rem', 
            background: 'white', 
            border: '1px solid var(--border-color)', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.75rem', 
            fontWeight: 600, 
            color: '#333',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" style={{width: 20, height: 20}} />
          Sign in with Google
        </button>

        {/* Simulated Google Login Modal */}
        {showGoogleModal && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(255,255,255,0.98)', 
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            zIndex: 10
          }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" style={{width: 48, height: 48, marginBottom: '1rem'}} />
            <h3 style={{marginBottom: '0.5rem', color: '#202124', fontSize: '1.5rem', fontWeight: 400}}>Sign in</h3>
            <p style={{color: '#202124', marginBottom: '2rem', fontSize: '1rem'}}>Use your Google Account</p>
            
            <form onSubmit={handleGoogleLogin} style={{width: '80%'}}>
              <div className="form-group">
                <input 
                  type="email" 
                  value={googleEmail} 
                  onChange={e => setGoogleEmail(e.target.value)} 
                  placeholder="Email or phone" 
                  style={{padding: '1rem', border: '1px solid #dadce0', borderRadius: '4px', fontSize: '1rem', width: '100%', outline: 'none'}}
                  required 
                />
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem'}}>
                <button type="button" onClick={() => setShowGoogleModal(false)} style={{background: 'none', border: 'none', color: '#1a73e8', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem'}}>Cancel</button>
                <button type="submit" style={{background: '#1a73e8', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem'}}>Next</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
