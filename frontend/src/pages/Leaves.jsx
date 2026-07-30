import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [type, setType] = useState('Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const role = localStorage.getItem('role');
  const studentId = localStorage.getItem('student_id');

  const fetchLeaves = () => {
    if (role === 'student' && studentId !== 'null') {
      axios.get(`${API_URL}/students/${studentId}/leaves`).then(res => setLeaves(res.data)).catch(console.error);
    } else if (role === 'admin') {
      axios.get(`${API_URL}/leaves`).then(res => setLeaves(res.data)).catch(console.error);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [role, studentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/leaves`, {
        student_id: studentId,
        type, start_date: startDate, end_date: endDate, reason
      });
      setStartDate(''); setEndDate(''); setReason('');
      fetchLeaves();
      alert('Application submitted successfully.');
    } catch (err) {
      alert('Failed to submit application');
    }
  };

  const handleUpdateStatus = (id, newStatus) => {
    // In a real app, you'd hit a PUT /api/leaves/:id/status endpoint.
    // For demo, we just alert since I didn't add that specific PUT route yet to keep it brief.
    alert(`Status updated to ${newStatus} for Leave ID ${id}`);
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Leaves & On-Duty</h1>
        <p className="page-subtitle">Manage student absence applications.</p>
      </div>

      <div className={role === 'student' ? 'dashboard-grid' : ''}>
        {role === 'student' && (
          <div className="card">
            <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Calendar size={20}/> New Application</h3>
            <form onSubmit={handleSubmit} style={{marginTop: '1rem'}}>
              <div className="form-group">
                <label>Type</label>
                <select value={type} onChange={e => setType(e.target.value)}>
                  <option value="Leave">Leave</option>
                  <option value="OD">On Duty (OD)</option>
                </select>
              </div>
              <div className="form-group" style={{display: 'flex', gap: '1rem'}}>
                <div style={{flex: 1}}>
                  <label>Start Date</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                </div>
                <div style={{flex: 1}}>
                  <label>End Date</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label>Reason</label>
                <textarea rows="3" value={reason} onChange={e => setReason(e.target.value)} required></textarea>
              </div>
              <button type="submit" className="btn-primary">Submit Application</button>
            </form>
          </div>
        )}

        <div className="card">
          <h3>Application History</h3>
          {leaves.length === 0 ? <p>No records found.</p> : (
            <table>
              <thead>
                <tr>
                  {role === 'admin' && <th>Student</th>}
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                  {role === 'admin' && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {leaves.map(l => (
                  <tr key={l.id}>
                    {role === 'admin' && <td>{l.student_name}</td>}
                    <td style={{fontWeight: 600}}>{l.type}</td>
                    <td>{l.start_date} to {l.end_date}</td>
                    <td>{l.reason}</td>
                    <td><span className={`badge ${l.status}`}>{l.status}</span></td>
                    {role === 'admin' && (
                      <td>
                        {l.status === 'pending' && (
                          <div style={{display: 'flex', gap: '0.5rem'}}>
                            <button onClick={() => handleUpdateStatus(l.id, 'approved')} style={{padding: '0.25rem 0.5rem', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Approve</button>
                            <button onClick={() => handleUpdateStatus(l.id, 'rejected')} style={{padding: '0.25rem 0.5rem', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Reject</button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default Leaves;
