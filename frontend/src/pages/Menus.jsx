import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Menus = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [activeDay, setActiveDay] = useState('Monday');
  const [weeklyMenu, setWeeklyMenu] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const res = await axios.get(`${API_URL}/menus/week`);
      const menuMap = {};
      res.data.forEach(item => {
        menuMap[item.day_of_week] = item;
      });
      setWeeklyMenu(menuMap);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (field, value) => {
    setWeeklyMenu(prev => ({
      ...prev,
      [activeDay]: {
        ...prev[activeDay],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dayData = weeklyMenu[activeDay];
    try {
      await axios.put(`${API_URL}/menus/${activeDay}`, dayData);
      alert(`Menu for ${activeDay} updated successfully! Students have been notified.`);
    } catch (err) {
      alert("Failed to update menu.");
    }
  };

  if (loading) return <div>Loading...</div>;

  const currentMenu = weeklyMenu[activeDay] || { breakfast: '', snack: '', lunch: '', tea: '', dinner: '' };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}><Calendar size={24} color="var(--accent-primary)"/> Weekly Food Menu</h1>
        <p className="page-subtitle">Configure the fixed weekly schedule. Changes automatically notify students.</p>
      </div>

      <div style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
        {/* Days Sidebar */}
        <div className="card" style={{flex: '1 1 250px', alignSelf: 'flex-start'}}>
          <h3 style={{marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem'}}>Days of the Week</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            {days.map(day => (
              <button 
                key={day}
                onClick={() => setActiveDay(day)}
                style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  background: activeDay === day ? 'var(--accent-light)' : 'transparent',
                  color: activeDay === day ? 'var(--accent-primary)' : 'var(--text-primary)',
                  border: activeDay === day ? '1px solid var(--accent-primary)' : '1px solid transparent',
                  borderRadius: '6px',
                  fontWeight: activeDay === day ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Editor Form */}
        <div className="card" style={{flex: '2 1 400px'}}>
          <h2 style={{marginBottom: '1.5rem', color: 'var(--accent-primary)'}}>Editing Menu for {activeDay}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Breakfast</label>
              <input value={currentMenu.breakfast || ''} onChange={e => handleInputChange('breakfast', e.target.value)} placeholder="e.g. Idli & Sambar" required />
            </div>
            <div className="form-group">
              <label>Morning Snack</label>
              <input value={currentMenu.snack || ''} onChange={e => handleInputChange('snack', e.target.value)} placeholder="e.g. Biscuits & Milk" required />
            </div>
            <div className="form-group">
              <label>Lunch</label>
              <input value={currentMenu.lunch || ''} onChange={e => handleInputChange('lunch', e.target.value)} placeholder="e.g. Rice & Dal" required />
            </div>
            <div className="form-group">
              <label>Evening Tea / Snack</label>
              <input value={currentMenu.tea || ''} onChange={e => handleInputChange('tea', e.target.value)} placeholder="e.g. Tea & Samosa" required />
            </div>
            <div className="form-group">
              <label>Dinner</label>
              <input value={currentMenu.dinner || ''} onChange={e => handleInputChange('dinner', e.target.value)} placeholder="e.g. Chapathi & Kurma" required />
            </div>
            <button type="submit" className="btn-primary" style={{marginTop: '1rem', width: '100%'}}>Save {activeDay}'s Menu</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Menus;
