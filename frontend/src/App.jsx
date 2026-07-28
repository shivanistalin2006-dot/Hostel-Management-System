import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, DoorClosed, AlertTriangle, CheckCircle } from 'lucide-react';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [rooms, setRooms] = useState([]);
  const [complaints, setComplaints] = useState([]);
  
  // Form state
  const [roomNumber, setRoomNumber] = useState('');
  const [occupantName, setOccupantName] = useState('');
  const [isVacant, setIsVacant] = useState(false);
  const [complaintDesc, setComplaintDesc] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  
  // Filter/Search state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, complaintsRes] = await Promise.all([
        axios.get(`${API_URL}/rooms`),
        axios.get(`${API_URL}/complaints`, { params: { search, status: statusFilter } })
      ]);
      setRooms(roomsRes.data);
      setComplaints(complaintsRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data from the server. Is the backend running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter]);

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/rooms`, {
        room_number: roomNumber,
        occupant_name: occupantName,
        is_vacant: isVacant
      });
      setSuccess('Room successfully added!');
      setRoomNumber('');
      setOccupantName('');
      setIsVacant(false);
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add room');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoomId) {
      setError('Please select a room');
      return;
    }
    try {
      await axios.post(`${API_URL}/complaints`, {
        room_id: selectedRoomId,
        description: complaintDesc
      });
      setSuccess('Complaint registered successfully!');
      setComplaintDesc('');
      setSelectedRoomId('');
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register complaint');
      setTimeout(() => setError(null), 5000);
    }
  };

  const updateComplaintStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/complaints/${id}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  return (
    <div>
      <h1>Hostel Management Dashboard</h1>
      
      {error && <div className="status-message status-error">{error}</div>}
      {success && <div className="status-message status-success">{success}</div>}

      <div className="dashboard-grid">
        <div className="glass-panel">
          <h2><DoorClosed className="inline mr-2"/> Add Room</h2>
          <form onSubmit={handleRoomSubmit}>
            <div className="form-group">
              <label>Room Number</label>
              <input value={roomNumber} onChange={e => setRoomNumber(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Occupant Name (Optional)</label>
              <input value={occupantName} onChange={e => setOccupantName(e.target.value)} />
            </div>
            <div className="form-group" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <input type="checkbox" id="isVacant" checked={isVacant} onChange={e => setIsVacant(e.target.checked)} style={{width: 'auto'}} />
              <label htmlFor="isVacant" style={{marginBottom: 0}}>Mark as Vacant</label>
            </div>
            <button type="submit">Register Room</button>
          </form>

          <h2 style={{marginTop: '2rem'}}><ClipboardList className="inline mr-2"/> Log Complaint</h2>
          <form onSubmit={handleComplaintSubmit}>
            <div className="form-group">
              <label>Room</label>
              <select value={selectedRoomId} onChange={e => setSelectedRoomId(e.target.value)} required>
                <option value="">-- Select Room --</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>Room {r.room_number} {r.is_vacant ? '(Vacant)' : ''}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Complaint Description</label>
              <textarea value={complaintDesc} onChange={e => setComplaintDesc(e.target.value)} rows="3" required></textarea>
            </div>
            <button type="submit">Submit Complaint</button>
          </form>
        </div>

        <div className="glass-panel">
          <h2>Complaint Register</h2>
          
          <div className="filters">
            <input 
              type="text" 
              placeholder="Search rooms or descriptions..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="outstanding">Outstanding</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {loading ? (
            <p>Loading records...</p>
          ) : complaints.length === 0 ? (
            <p className="text-secondary text-center py-4">No complaints found matching criteria.</p>
          ) : (
            <>
              <p className="text-secondary mb-3 text-sm">Showing {complaints.length} record(s)</p>
              <div className="item-list">
                {complaints.map(c => (
                  <div key={c.id} className="list-item">
                    <div className="item-content">
                      <h4>Room {c.room_number}</h4>
                      <p>{c.description}</p>
                      {c.current_status === 'outstanding' && (
                        <button 
                          onClick={() => updateComplaintStatus(c.id, 'resolved')}
                          style={{marginTop: '0.5rem', padding: '0.25rem 0.75rem', fontSize: '0.8rem', width: 'auto'}}
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                    <div className="item-meta">
                      <span className={`badge ${c.current_status === 'outstanding' ? 'warning' : 'success'}`}>
                        {c.current_status}
                      </span>
                      {c.current_status === 'outstanding' && (
                        <span className={`time-outstanding ${c.needs_urgent_attention ? 'urgent' : ''}`}>
                          {c.needs_urgent_attention && <AlertTriangle size={14} style={{display: 'inline', marginRight: '4px'}} />}
                          {c.days_outstanding > 0 
                            ? `${c.days_outstanding} day(s) old` 
                            : `${c.hours_outstanding} hour(s) old`}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
