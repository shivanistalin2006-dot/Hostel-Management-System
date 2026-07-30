import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    register_no: '',
    contact: '',
    parent_contact: '',
    hostel_id: '',
    room_id: ''
  });
  
  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/students`);
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/students`, newStudent);
      if (res.data.success) {
        alert(`Student added successfully! Login Credentials:\nUsername: ${res.data.username}\nPassword: ${res.data.password}`);
        setShowAddForm(false);
        setNewStudent({ name: '', register_no: '', contact: '', parent_contact: '', hostel_id: '', room_id: '' });
        fetchData();
      }
    } catch (err) {
      alert('Failed to add student');
      console.error(err);
    }
  };

  return (
    <>
      <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">View and manage student records.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : '+ Add New Student'}
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{marginBottom: '2rem'}}>
          <h3>Add New Student</h3>
          <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem'}}>
            The student's Register Number will be used as their Username, and their Contact Number will be their Password.
          </p>
          <form onSubmit={handleAddStudent} style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
            <div className="form-group">
              <label>Full Name</label>
              <input value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Register Number (Username)</label>
              <input value={newStudent.register_no} onChange={e => setNewStudent({...newStudent, register_no: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Contact Number (Password)</label>
              <input value={newStudent.contact} onChange={e => setNewStudent({...newStudent, contact: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Parent Contact Number</label>
              <input value={newStudent.parent_contact} onChange={e => setNewStudent({...newStudent, parent_contact: e.target.value})} required />
            </div>
            {/* Keeping hostel and room text inputs simple for this iteration since we just need the feature hooked up */}
            <div className="form-group">
              <label>Hostel ID (Optional)</label>
              <input type="number" value={newStudent.hostel_id} onChange={e => setNewStudent({...newStudent, hostel_id: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Room ID (Optional)</label>
              <input type="number" value={newStudent.room_id} onChange={e => setNewStudent({...newStudent, room_id: e.target.value})} />
            </div>
            <div style={{gridColumn: '1 / -1'}}>
              <button type="submit" className="btn-primary" style={{width: '100%'}}>Save Student</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Student Directory</h3>
        {students.length === 0 ? <p>No students found.</p> : (
          <table>
            <thead>
              <tr>
                <th>Profile</th>
                <th>Reg No</th>
                <th>Name</th>
                <th>Parent Contact</th>
                <th>Hostel & Room</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-main)', overflow: 'hidden'}}>
                      {s.profile_pic_url ? (
                        <img src={`${API_URL.replace('/api', '')}${s.profile_pic_url}`} alt="Pic" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                      ) : (
                        <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontWeight: 'bold'}}>{s.name.substring(0,2).toUpperCase()}</div>
                      )}
                    </div>
                  </td>
                  <td style={{fontWeight: 600}}>{s.register_no}</td>
                  <td>{s.name}</td>
                  <td>{s.parent_contact}</td>
                  <td>
                    {s.hostel_name ? `${s.hostel_name} - Rm ${s.room_number}` : <span style={{color: 'var(--text-secondary)'}}>Unassigned</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default Students;
