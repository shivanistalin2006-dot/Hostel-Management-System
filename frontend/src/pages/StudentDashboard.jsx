import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Coffee, Megaphone } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentDashboard = () => {
  const [menu, setMenu] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/menus/today`).then(res => setMenu(res.data)).catch(console.error);
    axios.get(`${API_URL}/announcements`).then(res => setAnnouncements(res.data)).catch(console.error);
  }, []);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Welcome back!</h1>
        <p className="page-subtitle">Here is your daily schedule and updates.</p>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)'}}><Coffee size={24} /> Today's Food Menu</h3>
          {menu ? (
            <div style={{marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              <div style={{padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px', borderLeft: '4px solid var(--accent-primary)'}}>
                <div style={{fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Breakfast</div>
                <div style={{fontSize: '1.1rem', marginTop: '0.25rem'}}>{menu.breakfast || 'Not set'}</div>
              </div>
              <div style={{padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px', borderLeft: '4px solid #f59e0b'}}>
                <div style={{fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Snack</div>
                <div style={{fontSize: '1.1rem', marginTop: '0.25rem'}}>{menu.snack || 'Not set'}</div>
              </div>
              <div style={{padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px', borderLeft: '4px solid #3b82f6'}}>
                <div style={{fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Lunch</div>
                <div style={{fontSize: '1.1rem', marginTop: '0.25rem'}}>{menu.lunch || 'Not set'}</div>
              </div>
              <div style={{padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px', borderLeft: '4px solid #8b5cf6'}}>
                <div style={{fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Tea Time</div>
                <div style={{fontSize: '1.1rem', marginTop: '0.25rem'}}>{menu.tea || 'Not set'}</div>
              </div>
              <div style={{padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px', borderLeft: '4px solid #10b981'}}>
                <div style={{fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Dinner</div>
                <div style={{fontSize: '1.1rem', marginTop: '0.25rem'}}>{menu.dinner || 'Not set'}</div>
              </div>
            </div>
          ) : <p>Loading menu...</p>}
        </div>

        <div className="card">
          <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)'}}><Megaphone size={24} /> Announcements</h3>
          <div style={{marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {announcements.length === 0 ? <p style={{color: 'var(--text-secondary)'}}>No announcements.</p> : announcements.map(a => (
              <div key={a.id} style={{padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-main)'}}>
                <div style={{fontWeight: 600, color: 'var(--text-primary)'}}>{a.title}</div>
                <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem'}}>{new Date(a.created_at).toLocaleString()}</div>
                <div style={{fontSize: '0.9rem', color: 'var(--text-primary)'}}>{a.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
