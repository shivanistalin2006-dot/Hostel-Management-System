import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Wardens = () => {
  const [wardens, setWardens] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [hostels, setHostels] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [newWarden, setNewWarden] = useState({
    name: '',
    email: '',
    contact: '',
    hostel_id: ''
  });

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/wardens`);
      setWardens(res.data);
      const hRes = await axios.get(`${API_URL}/hostels`);
      setHostels(hRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddWarden = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/wardens`, newWarden);
      if (res.data.success) {
        alert(`Warden added successfully!\nUsername: ${res.data.username}\nPassword: ${res.data.password}`);
        setShowAddForm(false);
        setNewWarden({ name: '', email: '', contact: '', hostel_id: '' });
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add warden');
      console.error(err);
    }
  };

  const handleRemoveWarden = async (id) => {
    if (window.confirm('Are you sure you want to remove this warden?')) {
      try {
        await axios.delete(`${API_URL}/wardens/${id}`);
        fetchData();
      } catch (err) {
        alert('Failed to remove warden');
      }
    }
  };

  return (
    <>
      <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <h1 className="page-title">Wardens</h1>
          <p className="page-subtitle">Manage hostel wardens.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : '+ Add Warden'}
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{marginBottom: '2rem'}}>
          <h3>Add New Warden</h3>
          <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem'}}>
            The Warden's Name will be used as their Username, and their 10-digit Contact Number will be their Password.
          </p>
          <form onSubmit={handleAddWarden} style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
            <div className="form-group">
              <label>Full Name</label>
              <input value={newWarden.name} onChange={e => setNewWarden({...newWarden, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={newWarden.email} onChange={e => setNewWarden({...newWarden, email: e.target.value})} required />
            </div>
            <div className="form-group" style={{position: 'relative'}}>
              <label>Contact Number (Password)</label>
              <input 
                type={showPassword ? "text" : "password"}
                pattern="[0-9]{10}"
                maxLength="10"
                value={newWarden.contact} 
                onChange={e => setNewWarden({...newWarden, contact: e.target.value})} 
                placeholder="10-digit number"
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '38px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="form-group">
              <label>Assign to Hostel</label>
              <select value={newWarden.hostel_id} onChange={e => setNewWarden({...newWarden, hostel_id: e.target.value})} required>
                <option value="">Select a Hostel</option>
                {hostels.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
            <div style={{gridColumn: '1 / -1'}}>
              <button type="submit" className="btn-primary" style={{width: '100%'}}>Save Warden</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Warden Directory</h3>
        {wardens.length === 0 ? <p>No wardens found.</p> : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Contact</th>
                <th>Hostel</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {wardens.map(w => (
                <tr key={w.id}>
                  <td style={{fontWeight: 600}}>{w.name}</td>
                  <td>{w.username}</td>
                  <td>{w.email}</td>
                  <td>{w.contact}</td>
                  <td>{w.hostel_name || 'Unassigned'}</td>
                  <td>
                    <button onClick={() => handleRemoveWarden(w.id)} style={{background: 'var(--danger)', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer'}}>
                      Remove
                    </button>
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

export default Wardens;
