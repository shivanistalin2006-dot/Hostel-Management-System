import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState('');
  const [description, setDescription] = useState('');

  const role = localStorage.getItem('role');
  const studentId = localStorage.getItem('student_id');

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
      await axios.post(`${API_URL}/complaints`, { 
        room_id: roomId, 
        description,
        student_id: studentId === 'null' ? null : studentId
      });
      setRoomId('');
      setDescription('');
      fetchData();
      alert('Complaint registered');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to register complaint');
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Complaints Register</h1>
        <p className="page-subtitle">Log and track maintenance issues.</p>
      </div>

      <div className={role === 'student' ? 'dashboard-grid' : ''}>
        {role === 'student' && (
          <div className="card">
            <h3>Log a Complaint</h3>
            <form onSubmit={handleSubmit} style={{marginTop: '1rem'}}>
              <div className="form-group">
                <label>Room</label>
                <select value={roomId} onChange={e => setRoomId(e.target.value)} required>
                  <option value="">-- Select Room --</option>
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>{r.hostel_name} - Room {r.room_number}</option>
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
        )}

        <div className="card">
          <h3>Active Register</h3>
          {complaints.length === 0 ? <p>No complaints found.</p> : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem'}}>
              {complaints.map(c => (
                <div key={c.id} style={{padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', background: 'var(--bg-main)'}}>
                  <div>
                    <h4 style={{marginBottom: '0.25rem', color: 'var(--text-primary)'}}>Room {c.room_number}</h4>
                    <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem'}}>{c.description}</p>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <span className={`badge ${c.current_status === 'outstanding' ? 'pending' : 'approved'}`}>{c.current_status}</span>
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
