import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
    // In a real app we need a POST /api/rooms. We just alert for this demo since the focus is UI layout
    alert('Room created (demo)');
    setRoomNumber('');
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Rooms Management</h1>
        <p className="page-subtitle">Configure room capacities and floors for each hostel.</p>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Add New Room</h3>
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
              <label>Initial Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="Vacant">Vacant</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" style={{width: '100%'}}>Create Room</button>
          </form>
        </div>

        <div className="card">
          <h3>Room Directory</h3>
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
                          value={r.status} 
                          onChange={async (e) => {
                            try {
                              await axios.put(`${API_URL}/rooms/${r.id}/status`, { status: e.target.value });
                              fetchData();
                            } catch (err) {
                              alert('Failed to update status');
                            }
                          }}
                          style={{width: 'auto', padding: '0.25rem', fontSize: '0.85rem', borderRadius: '4px'}}
                        >
                          <option value="Vacant">Vacant</option>
                          <option value="Occupied">Occupied</option>
                          <option value="Maintenance">Maintenance</option>
                        </select>
                      ) : (
                        <span className={`badge ${r.status === 'Vacant' ? 'approved' : r.status === 'Maintenance' ? 'rejected' : 'pending'}`}>
                          {r.status}
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
