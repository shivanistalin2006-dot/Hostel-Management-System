import React, { useContext, useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, Grid, Users, AlertTriangle, LogOut, Search, User, Sun, Moon, Calendar, Coffee } from 'lucide-react';
import { ThemeContext } from '../App';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Layout = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  const role = localStorage.getItem('role') || 'student';
  const username = localStorage.getItem('name') || localStorage.getItem('username');
  const studentId = localStorage.getItem('student_id');
  
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    if (role === 'student' && studentId && studentId !== 'null') {
      axios.get(`${API_URL}/students/${studentId}`).then(res => {
        if (res.data.profile_pic_url) {
          setProfilePic(`${API_URL.replace('/api', '')}${res.data.profile_pic_url}`);
        }
      }).catch(console.error);
    }
  }, [role, studentId]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Home color="var(--accent-primary)" /> HostelSync
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/app" end className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Home size={20} /> Dashboard
          </NavLink>
          
          {(role === 'admin' || role === 'warden') && (
            <>
              <NavLink to="/app/rooms" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                <Grid size={20} /> Rooms
              </NavLink>
              <NavLink to="/app/students" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                <Users size={20} /> Students
              </NavLink>
              <NavLink to="/app/menus" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
                <Coffee size={20} /> Food Menus
              </NavLink>
            </>
          )}

          <NavLink to="/app/complaints" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <AlertTriangle size={20} /> Complaints
          </NavLink>
          <NavLink to="/app/leaves" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Calendar size={20} /> Leaves / OD
          </NavLink>

          {role === 'student' && (
            <NavLink to="/app/profile" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
              <User size={20} /> My Profile
            </NavLink>
          )}
        </nav>
        <div style={{marginTop: 'auto', padding: '1rem'}}>
          <button onClick={handleLogout} style={{width: '100%', padding: '0.75rem', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600}}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="topbar">
          <div className="search-bar" style={{background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', width: '300px'}}>
            <Search size={18} color="var(--text-secondary)" />
            <input type="text" placeholder="Search..." style={{border: 'none', background: 'transparent', outline: 'none', paddingLeft: '0.5rem', width: '100%', color: 'var(--text-primary)'}} />
          </div>
          
          <div className="user-profile">
            <button onClick={toggleTheme} className="theme-toggle">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <div style={{textAlign: 'right', marginLeft: '1rem'}}>
              <div style={{fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)'}}>{username}</div>
              <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase'}}>{role}</div>
            </div>
            <div className="avatar">
              {profilePic ? <img src={profilePic} alt="Profile" /> : username.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="page-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
