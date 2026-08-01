import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, MapPin, Users, Settings } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [hostelId, setHostelId] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [floor, setFloor] = useState(1);
  const [capacity, setCapacity] = useState(2);
  const [status, setStatus] = useState('Vacant');
  const role = localStorage.getItem('role');

  const fetchData = async () => {
    try {
      const [rRes, hRes] = await Promise.all([
        axios.get(`${API_URL}/rooms`),
        axios.get(`${API_URL}/hostels`)
      ]);
      setRooms(rRes.data);
      setHostels(hRes.data);
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
      await axios.post(`${API_URL}/rooms`, { hostel_id: hostelId, room_number: roomNumber, floor, capacity, status });
      setRoomNumber('');
      fetchData();
    } catch (err) {
      alert('Failed to create room');
    }
  };

  const getStatusDisplay = (room) => {
    if (room.status === 'Maintenance') return 'Maintenance';
    const vacant = room.capacity - (room.occupied_count || 0);
    if (vacant > 0) return `${vacant} place(s) vacancy`;
    if (vacant === 0) return 'Occupied (Full)';
    return 'Overbooked';
  };

  const getBadgeClass = (room) => {
    if (room.status === 'Maintenance') return 'rejected';
    const vacant = room.capacity - (room.occupied_count || 0);
    if (vacant > 0) return 'approved';
    return 'pending'; // Orange for full/overbooked
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Rooms Management</h1>
        <p className="page-subtitle">Configure room capacities and floors for each hostel.</p>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)'}}>
            <Plus size={20} /> Add New Room
          </h3>
          <form onSubmit={handleSubmit} style={{marginTop: '1rem'}}>
            <div className="form-group">
              <label>Hostel</label>
              <select value={hostelId} onChange={e => setHostelId(e.target.value)} required>
                <option value="">-- Select Hostel --</option>
                {hostels.map(h => <option key={h.id} value={h.id}>{h.name} ({h.type})</option>)}
              </select>
            </div>
            <div className="form-group" style={{display: 'flex', gap: '1rem'}}>
              <div style={{flex: 1}}>
                <label>Room Number</label>
                <input value={roomNumber} onChange={e => setRoomNumber(e.target.value)} required />
              </div>
              <div style={{flex: 1}}>
                <label>Floor</label>
                <input type="number" value={floor} onChange={e => setFloor(e.target.value)} min="1" required />
              </div>
            </div>
            <div className="form-group">
              <label>Capacity (Persons)</label>
              <select value={capacity} onChange={e => setCapacity(e.target.value)}>
                <option value={1}>1 Person</option>
                <option value={2}>2 Persons</option>
                <option value={3}>3 Persons</option>
                <option value={4}>4 Persons</option>
              </select>
            </div>
            <div className="form-group">
              <label><Settings size={14} style={{verticalAlign: 'middle', marginRight: '4px'}} /> Initial Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'}}>
              <Plus size={18} /> Create Room
            </button>
          </form>
        </div>

        <div className="card">
          <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <MapPin size={20} /> Room Directory
          </h3>
          {rooms.length === 0 ? <p>No rooms found.</p> : (
            <table>
              <thead>
                <tr>
                  <th>Hostel</th>
                  <th>Room</th>
                  <th>Floor</th>
                  <th>Capacity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(r => (
                  <tr key={r.id}>
                    <td>{r.hostel_name}</td>
                    <td style={{fontWeight: 600}}>Room {r.room_number}</td>
                    <td>{r.floor}</td>
                    <td>{r.capacity}</td>
                    <td>
                      {role === 'admin' ? (
                        <select 
                          value={r.status === 'Maintenance' ? 'Maintenance' : 'Active'} 
                          onChange={async (e) => {
                            try {
                              await axios.put(`${API_URL}/rooms/${r.id}/status`, { status: e.target.value });
                              fetchData();
                            } catch (err) {
                              alert('Failed to update status');
                            }
                          }}
                          style={{width: 'auto', padding: '0.35rem', fontSize: '0.85rem', borderRadius: '6px', fontWeight: 600, border: '1px solid var(--border-color)', color: r.status === 'Maintenance' ? 'var(--danger)' : 'var(--success)'}}
                        >
                          <option value="Active">{getStatusDisplay(r)}</option>
                          <option value="Maintenance">Maintenance</option>
                        </select>
                      ) : (
                        <span className={`badge ${getBadgeClass(r)}`}>
                          {getStatusDisplay(r)}
                        </span>
                      )}
                    </td>
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

export default Rooms;
