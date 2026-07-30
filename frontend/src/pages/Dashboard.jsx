import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Plus, UserPlus, AlertCircle, BarChart2, Grid, User, AlertTriangle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const [stats, setStats] = useState({ total_rooms: 0, occupied_rooms: 0, vacant_rooms: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/dashboard/stats`);
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Here's what's happening across the hostel today.</p>
      </div>

      <div className="quick-actions">
        <Link to="/rooms" className="action-card">
          <Plus size={24} className="icon" />
          Add Room
        </Link>
        <Link to="/students" className="action-card">
          <UserPlus size={24} className="icon" />
          Allocate Room
        </Link>
        <Link to="/complaints" className="action-card">
          <AlertCircle size={24} className="icon" />
          Register Complaint
        </Link>
        <Link to="/complaints" className="action-card">
          <BarChart2 size={24} className="icon" />
          View Reports
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="icon"><Grid size={24} /></div>
          <div className="stat-value">{stats.total_rooms}</div>
          <div className="stat-label">Total Rooms</div>
        </div>
        <div className="stat-card">
          <div className="icon"><User size={24} /></div>
          <div className="stat-value">{stats.occupied_rooms}</div>
          <div className="stat-label">Occupied Rooms</div>
        </div>
        <div className="stat-card">
          <div className="icon"><AlertTriangle size={24} color="#f59e0b" /></div>
          <div className="stat-value">{stats.vacant_rooms}</div>
          <div className="stat-label">Vacant Rooms</div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
