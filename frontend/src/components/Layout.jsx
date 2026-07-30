import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, Grid, Users, AlertTriangle, LogOut, Search, User } from 'lucide-react';

const Layout = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Admin';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Home color="#10b981" /> HostelSync
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Home size={20} /> Dashboard
          </NavLink>
          <NavLink to="/rooms" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Grid size={20} /> Rooms
          </NavLink>
          <NavLink to="/students" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users size={20} /> Students
          </NavLink>
          <NavLink to="/complaints" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <AlertTriangle size={20} /> Complaints
          </NavLink>
        </nav>
        <div style={{marginTop: 'auto', padding: '1rem'}}>
          <button onClick={handleLogout} style={{width: '100%', padding: '0.75rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="topbar">
          <div className="search-bar">
            <Search size={18} color="#64748b" />
            <input type="text" placeholder="Search rooms, students, complaints..." />
          </div>
          <div className="user-profile">
            <div style={{textAlign: 'right'}}>
              <div style={{fontWeight: 600, fontSize: '0.9rem'}}>{username}</div>
              <div style={{fontSize: '0.8rem', color: '#64748b'}}>System Administrator</div>
            </div>
            <div className="avatar">SA</div>
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
