import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [roomNumber, setRoomNumber] = useState('');
  const [isVacant, setIsVacant] = useState(true);

  const fetchRooms = async () => {
    try {
      const res = await axios.get(`${API_URL}/rooms`);
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/rooms`, { room_number: roomNumber, is_vacant: isVacant });
      setRoomNumber('');
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add room');
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Rooms</h1>
        <p className="page-subtitle">Manage hostel rooms and their availability.</p>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Add New Room</h3>
          <form onSubmit={handleSubmit} style={{marginTop: '1rem'}}>
            <div className="form-group">
              <label>Room Number</label>
              <input value={roomNumber} onChange={e => setRoomNumber(e.target.value)} required />
            </div>
            <div className="form-group" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <input type="checkbox" id="isVacant" checked={isVacant} onChange={e => setIsVacant(e.target.checked)} style={{width: 'auto'}} />
              <label htmlFor="isVacant" style={{marginBottom: 0}}>Mark as Vacant initially</label>
            </div>
            <button type="submit" className="btn-primary">Create Room</button>
          </form>
        </div>

        <div className="card">
          <h3>Room Directory</h3>
          {rooms.length === 0 ? <p>No rooms found.</p> : (
            <table>
              <thead>
                <tr>
                  <th>Room No.</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(r => (
                  <tr key={r.id}>
                    <td style={{fontWeight: 600}}>Room {r.room_number}</td>
                    <td>
                      <span className={`badge ${r.is_vacant ? 'resolved' : 'outstanding'}`}>
                        {r.is_vacant ? 'Vacant' : 'Occupied'}
                      </span>
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
