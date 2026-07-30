import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [name, setName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [contact, setContact] = useState('');
  const [roomId, setRoomId] = useState('');

  const fetchData = async () => {
    const [stRes, rmRes] = await Promise.all([
      axios.get(`${API_URL}/students`),
      axios.get(`${API_URL}/rooms`)
    ]);
    setStudents(stRes.data);
    setRooms(rmRes.data.filter(r => r.is_vacant)); // Only show vacant rooms for assignment
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/students`, {
        name,
        register_no: regNo,
        contact,
        room_id: roomId || null
      });
      setName(''); setRegNo(''); setContact(''); setRoomId('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error adding student');
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Students</h1>
        <p className="page-subtitle">Manage student details and room allocation.</p>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Add New Student</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Register No.</label>
              <input value={regNo} onChange={e => setRegNo(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Contact (Optional)</label>
              <input value={contact} onChange={e => setContact(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Assign Room (Optional)</label>
              <select value={roomId} onChange={e => setRoomId(e.target.value)}>
                <option value="">-- Leave Unassigned --</option>
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>Room {r.room_number}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary">Save Student</button>
          </form>
        </div>

        <div className="card">
          <h3>Student Directory</h3>
          {students.length === 0 ? <p>No students found.</p> : (
            <table>
              <thead>
                <tr>
                  <th>Reg No</th>
                  <th>Name</th>
                  <th>Room</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td>{s.register_no}</td>
                    <td>{s.name}</td>
                    <td>{s.room_number ? `Room ${s.room_number}` : <span style={{color: '#94a3b8'}}>Unassigned</span>}</td>
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

export default Students;
