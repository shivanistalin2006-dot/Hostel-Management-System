import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const WardenDashboard = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const hostelId = localStorage.getItem('hostel_id');
  const wardenName = localStorage.getItem('name');

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all students (Warden should ideally only see their hostel, but we filter here for simplicity)
      const stRes = await axios.get(`${API_URL}/students`);
      const hostelStudents = stRes.data.filter(s => String(s.hostel_id) === String(hostelId));
      setStudents(hostelStudents);

      // Fetch today's attendance
      const attRes = await axios.get(`${API_URL}/attendance?date=${date}`);
      const attMap = {};
      attRes.data.forEach(a => {
        attMap[a.student_id] = a.status;
      });
      setAttendance(attMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date, hostelId]);

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    try {
      const records = Object.keys(attendance).map(student_id => ({
        student_id: parseInt(student_id),
        status: attendance[student_id]
      }));
      
      const res = await axios.post(`${API_URL}/attendance`, { date, records });
      if (res.data.success) {
        alert('Attendance saved successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save attendance');
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Welcome, {wardenName}</h1>
        <p className="page-subtitle">Manage daily attendance and view hostel statistics.</p>
      </div>

      <div className="card">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
          <h3 style={{marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <Calendar size={20} color="var(--accent-primary)" /> 
            Daily Attendance
          </h3>
          <div>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              style={{width: 'auto', display: 'inline-block'}}
            />
          </div>
        </div>

        {loading ? <p>Loading students...</p> : (
          <>
            {students.length === 0 ? <p>No students assigned to your hostel yet.</p> : (
              <table style={{marginBottom: '2rem'}}>
                <thead>
                  <tr>
                    <th>Reg No</th>
                    <th>Name</th>
                    <th>Room</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td style={{fontWeight: 600}}>{s.register_no}</td>
                      <td>{s.name}</td>
                      <td>{s.room_number || 'Unassigned'}</td>
                      <td>
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                          <button 
                            onClick={() => handleStatusChange(s.id, 'Present')}
                            style={{
                              padding: '0.5rem 1rem', 
                              borderRadius: '8px', 
                              border: '1px solid var(--success)', 
                              background: attendance[s.id] === 'Present' ? 'var(--success)' : 'transparent',
                              color: attendance[s.id] === 'Present' ? '#fff' : 'var(--success)',
                              cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '0.25rem'
                            }}>
                            <CheckCircle size={16} /> Present
                          </button>
                          <button 
                            onClick={() => handleStatusChange(s.id, 'Absent')}
                            style={{
                              padding: '0.5rem 1rem', 
                              borderRadius: '8px', 
                              border: '1px solid var(--danger)', 
                              background: attendance[s.id] === 'Absent' ? 'var(--danger)' : 'transparent',
                              color: attendance[s.id] === 'Absent' ? '#fff' : 'var(--danger)',
                              cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '0.25rem'
                            }}>
                            <XCircle size={16} /> Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {students.length > 0 && (
              <button className="btn-primary" onClick={handleSaveAttendance}>Save Attendance</button>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default WardenDashboard;
