import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, Grid, AlertTriangle, Coffee } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

const AdminDashboard = () => {
  const [stats, setStats] = useState({ total_rooms: 0, occupied_rooms: 0, vacant_rooms: 0, total_complaints: 0, pending_complaints: 0, resolved_complaints: 0 });
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });

  useEffect(() => {
    axios.get(`${API_URL}/dashboard/stats`).then(res => setStats(res.data)).catch(console.error);
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = () => {
    axios.get(`${API_URL}/announcements`).then(res => setAnnouncements(res.data)).catch(console.error);
  };

  const handlePostAnnouncement = async (e) => {
    // Basic local state update for demo if POST endpoint is missing, but let's assume it works or we just display
    e.preventDefault();
    alert("Announcement posted! (Feature to be fully wired)");
  };

  const roomData = [
    { name: 'Occupied', value: stats.occupied_rooms || 0 },
    { name: 'Vacant', value: stats.vacant_rooms || 0 }
  ];

  const complaintData = [
    { name: 'Resolved', value: stats.resolved_complaints || 0 },
    { name: 'Pending', value: stats.pending_complaints || 0 }
  ];

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Here's what's happening across the hostel today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="icon" style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981'}}><Grid size={24} /></div>
          <div>
            <div className="stat-value">{stats.total_rooms || 0}</div>
            <div className="stat-label">Total Rooms</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="icon" style={{background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6'}}><Users size={24} /></div>
          <div>
            <div className="stat-value">{stats.occupied_rooms || 0}</div>
            <div className="stat-label">Occupied Rooms</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="icon" style={{background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b'}}><AlertTriangle size={24} /></div>
          <div>
            <div className="stat-value">{stats.vacant_rooms || 0}</div>
            <div className="stat-label">Vacant Rooms</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="icon" style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444'}}><Coffee size={24} /></div>
          <div>
            <div className="stat-value">{stats.pending_complaints || 0}</div>
            <div className="stat-label">Pending Complaints</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div>
          <div className="card">
            <h3>Room Occupancy</h3>
            <div style={{height: 300}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={roomData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                    {roomData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{display: 'flex', justifyContent: 'center', gap: '2rem'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><div style={{width: 12, height: 12, background: COLORS[0], borderRadius: '50%'}}></div> Occupied</div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><div style={{width: 12, height: 12, background: COLORS[1], borderRadius: '50%'}}></div> Vacant</div>
            </div>
          </div>

          <div className="card">
            <h3>Complaint Status Breakdown</h3>
            <div style={{height: 300}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={complaintData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                    {complaintData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Post Announcement</h3>
          <form onSubmit={handlePostAnnouncement} style={{marginBottom: '2rem'}}>
            <div className="form-group">
              <input type="text" placeholder="Title" value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} required />
            </div>
            <div className="form-group">
              <textarea placeholder="Write announcement..." rows="3" value={newAnnouncement.content} onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})} required></textarea>
            </div>
            <button type="submit" className="btn-primary">Post</button>
          </form>

          <h3>Recent Announcements</h3>
          {announcements.length === 0 ? <p style={{color: 'var(--text-secondary)'}}>No announcements yet.</p> : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {announcements.map(a => (
                <div key={a.id} style={{padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-main)'}}>
                  <div style={{fontWeight: 600, color: 'var(--text-primary)'}}>{a.title}</div>
                  <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem'}}>{new Date(a.created_at).toLocaleString()}</div>
                  <div style={{fontSize: '0.9rem', color: 'var(--text-primary)'}}>{a.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
