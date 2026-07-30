import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  
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

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Students</h1>
        <p className="page-subtitle">View and manage student records.</p>
      </div>

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
                        <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)'}}>{s.name.substring(0,2).toUpperCase()}</div>
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
