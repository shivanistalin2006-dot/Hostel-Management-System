import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Coffee, Megaphone } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StudentDashboard = () => {
  const [menu, setMenu] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const studentId = localStorage.getItem('student_id');

  useEffect(() => {
    axios.get(`${API_URL}/menus/today`).then(res => setMenu(res.data)).catch(console.error);
    axios.get(`${API_URL}/announcements`).then(res => setAnnouncements(res.data)).catch(console.error);
    if (studentId) {
      axios.get(`${API_URL}/attendance?student_id=${studentId}`).then(res => setAttendance(res.data)).catch(console.error);
    }
  }, [studentId]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Welcome back!</h1>
        <p className="page-subtitle">Here is your daily schedule and updates.</p>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)'}}>
            <Coffee size={24} /> 
            Today's Food Menu {menu?.day_of_week ? `(${menu.day_of_week})` : ''}
          </h3>
          {menu ? (
            <div style={{marginTop: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem'}}>
              <div style={{padding: '1rem', background: 'var(--bg-main)', borderRadius: '12px', borderTop: '4px solid var(--accent-primary)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
                <div style={{fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Breakfast</div>
                <div style={{fontSize: '1rem', fontWeight: 600, marginTop: '0.5rem', color: 'var(--text-primary)'}}>{menu.breakfast || '-'}</div>
              </div>
              <div style={{padding: '1rem', background: 'var(--bg-main)', borderRadius: '12px', borderTop: '4px solid #f59e0b', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
                <div style={{fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Snack</div>
                <div style={{fontSize: '1rem', fontWeight: 600, marginTop: '0.5rem', color: 'var(--text-primary)'}}>{menu.snack || '-'}</div>
              </div>
              <div style={{padding: '1rem', background: 'var(--bg-main)', borderRadius: '12px', borderTop: '4px solid #3b82f6', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
                <div style={{fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Lunch</div>
                <div style={{fontSize: '1rem', fontWeight: 600, marginTop: '0.5rem', color: 'var(--text-primary)'}}>{menu.lunch || '-'}</div>
              </div>
              <div style={{padding: '1rem', background: 'var(--bg-main)', borderRadius: '12px', borderTop: '4px solid #8b5cf6', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
                <div style={{fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Tea Time</div>
                <div style={{fontSize: '1rem', fontWeight: 600, marginTop: '0.5rem', color: 'var(--text-primary)'}}>{menu.tea || '-'}</div>
              </div>
              <div style={{padding: '1rem', background: 'var(--bg-main)', borderRadius: '12px', borderTop: '4px solid #10b981', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
                <div style={{fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Dinner</div>
                <div style={{fontSize: '1rem', fontWeight: 600, marginTop: '0.5rem', color: 'var(--text-primary)'}}>{menu.dinner || '-'}</div>
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

        <div className="card">
          <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)'}}>My Attendance</h3>
          <div style={{marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
            {attendance.length === 0 ? <p style={{color: 'var(--text-secondary)'}}>No attendance records yet.</p> : attendance.slice(0, 5).map(a => (
              <div key={a.id} style={{display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-main)'}}>
                <div style={{fontWeight: 600, color: 'var(--text-primary)'}}>{a.date}</div>
                <div style={{
                  color: a.status === 'Present' ? 'var(--success)' : 'var(--danger)',
                  fontWeight: 600
                }}>
                  {a.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
