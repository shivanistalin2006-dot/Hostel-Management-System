import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [rooms, setRooms] = useState([]);
  
  const [roomId, setRoomId] = useState('');
  const [description, setDescription] = useState('');

  const fetchData = async () => {
    try {
      const [compRes, roomRes] = await Promise.all([
        axios.get(`${API_URL}/complaints`),
        axios.get(`${API_URL}/rooms`)
      ]);
      setComplaints(compRes.data);
      setRooms(roomRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/complaints`, { room_id: roomId, description });
      setRoomId('');
      setDescription('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to register complaint');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/complaints/${id}/status`, { status });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Complaints</h1>
        <p className="page-subtitle">Log new maintenance issues and track outstanding complaints.</p>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Log a Complaint</h3>
          <form onSubmit={handleSubmit} style={{marginTop: '1rem'}}>
            <div className="form-group">
              <label>Room</label>
              <select value={roomId} onChange={e => setRoomId(e.target.value)} required>
                <option value="">-- Select Room --</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>Room {r.room_number}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows="4" value={description} onChange={e => setDescription(e.target.value)} required></textarea>
            </div>
            <button type="submit" className="btn-primary">Submit Complaint</button>
          </form>
        </div>

        <div className="card">
          <h3>Active Register</h3>
          {complaints.length === 0 ? <p>No complaints found.</p> : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem'}}>
              {complaints.map(c => (
                <div key={c.id} style={{padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between'}}>
                  <div>
                    <h4 style={{marginBottom: '0.25rem'}}>Room {c.room_number}</h4>
                    <p style={{color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem'}}>{c.description}</p>
                    {c.current_status === 'outstanding' && (
                      <button 
                        onClick={() => updateStatus(c.id, 'resolved')}
                        style={{background: 'none', border: '1px solid #10b981', color: '#10b981', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer'}}
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <span className={`badge ${c.current_status}`}>{c.current_status}</span>
                    {c.current_status === 'outstanding' && (
                      <div style={{marginTop: '0.5rem', fontSize: '0.8rem', color: c.needs_urgent_attention ? '#ef4444' : '#64748b', fontWeight: c.needs_urgent_attention ? 600 : 400}}>
                        {c.days_outstanding > 0 ? `${c.days_outstanding} day(s) old` : `${c.hours_outstanding} hour(s) old`}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Complaints;
