import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Camera, Phone, MapPin } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [file, setFile] = useState(null);
  const studentId = localStorage.getItem('student_id');

  const fetchProfile = () => {
    if (!studentId || studentId === 'null') return;
    axios.get(`${API_URL}/students/${studentId}`).then(res => setProfile(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchProfile();
  }, [studentId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select a file');
    
    const formData = new FormData();
    formData.append('profilePic', file);
    
    try {
      await axios.post(`${API_URL}/students/${studentId}/upload-pic`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Profile picture updated successfully!');
      fetchProfile();
      window.location.reload(); // Refresh layout to show new pic
    } catch (err) {
      alert('Failed to upload picture');
    }
  };

  if (!profile) return <p>Loading profile... (Or you are not a registered student)</p>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">View your details and update your profile picture.</p>
      </div>

      <div className="card" style={{maxWidth: 600}}>
        <div style={{display: 'flex', gap: '2rem', alignItems: 'flex-start'}}>
          <div style={{textAlign: 'center'}}>
            <div style={{width: 120, height: 120, borderRadius: '50%', background: 'var(--bg-main)', border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '1rem'}}>
              {profile.profile_pic_url ? (
                <img src={`${API_URL.replace('/api', '')}${profile.profile_pic_url}`} alt="Profile" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
              ) : (
                <User size={64} color="var(--text-secondary)" />
              )}
            </div>
            <form onSubmit={handleUpload} style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} style={{fontSize: '0.8rem', padding: '0.5rem'}} />
              <button type="submit" className="btn-primary" style={{padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}><Camera size={16}/> Upload</button>
            </form>
          </div>
          
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div>
              <label style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>Full Name</label>
              <div style={{fontSize: '1.2rem', fontWeight: 600}}>{profile.name}</div>
            </div>
            <div>
              <label style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>Register Number</label>
              <div style={{fontWeight: 500}}>{profile.register_no}</div>
            </div>
            <div style={{display: 'flex', gap: '2rem'}}>
              <div>
                <label style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>Contact</label>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}><Phone size={14}/> {profile.contact || 'Not provided'}</div>
              </div>
              <div>
                <label style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>Parent Contact</label>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}><Phone size={14}/> {profile.parent_contact}</div>
              </div>
            </div>
            <div>
              <label style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem'}}>Accommodation</label>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.75rem', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
                <MapPin size={18} color="var(--accent-primary)"/> {profile.hostel_name || 'N/A'} - Room {profile.room_number || 'Unassigned'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
