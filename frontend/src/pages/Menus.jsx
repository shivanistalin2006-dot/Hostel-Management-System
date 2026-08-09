import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Menus = () => {
  const [menus, setMenus] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [currentMenu, setCurrentMenu] = useState({ breakfast: '', snack: '', lunch: '', tea: '', dinner: '' });
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const fetchMenus = () => {
    axios.get(`${API_URL}/menus`).then(res => {
      setMenus(res.data);
      const todayMenu = res.data.find(m => m.day_of_week === selectedDay);
      if (todayMenu) setCurrentMenu(todayMenu);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  useEffect(() => {
    const dayMenu = menus.find(m => m.day_of_week === selectedDay);
    if (dayMenu) setCurrentMenu(dayMenu);
  }, [selectedDay, menus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/menus/${selectedDay}`, currentMenu);
      alert(`Menu for ${selectedDay} updated successfully! Students will be notified.`);
      fetchMenus();
    } catch (err) {
      alert("Failed to update menu.");
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Weekly Food Menu</h1>
        <p className="page-subtitle">Configure the standard weekly schedule. Updates automatically notify students.</p>
      </div>

      <div style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
        {/* Day Selector */}
        <div className="card" style={{flex: 1, minWidth: '250px'}}>
          <h3 style={{marginBottom: '1rem'}}>Select Day</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
            {days.map(day => (
              <button 
                key={day}
                onClick={() => setSelectedDay(day)}
                style={{
                  padding: '1rem', 
                  textAlign: 'left',
                  background: selectedDay === day ? 'var(--accent-primary)' : 'var(--bg-main)',
                  color: selectedDay === day ? 'white' : 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: selectedDay === day ? 600 : 400
                }}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Edit Form */}
        <div className="card" style={{flex: 2, minWidth: '300px'}}>
          <h3 style={{marginBottom: '1.5rem'}}>Edit {selectedDay} Menu</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Breakfast</label>
              <input value={currentMenu.breakfast} onChange={e => setCurrentMenu({...currentMenu, breakfast: e.target.value})} placeholder="e.g. Idli, Sambar, Chutney" required />
            </div>
            <div className="form-group">
              <label>Morning Snack</label>
              <input value={currentMenu.snack} onChange={e => setCurrentMenu({...currentMenu, snack: e.target.value})} placeholder="e.g. Biscuits, Milk" required />
            </div>
            <div className="form-group">
              <label>Lunch</label>
              <input value={currentMenu.lunch} onChange={e => setCurrentMenu({...currentMenu, lunch: e.target.value})} placeholder="e.g. Rice, Dal, Vegetable Fry" required />
            </div>
            <div className="form-group">
              <label>Evening Tea / Snack</label>
              <input value={currentMenu.tea} onChange={e => setCurrentMenu({...currentMenu, tea: e.target.value})} placeholder="e.g. Tea, Samosa" required />
            </div>
            <div className="form-group">
              <label>Dinner</label>
              <input value={currentMenu.dinner} onChange={e => setCurrentMenu({...currentMenu, dinner: e.target.value})} placeholder="e.g. Chapathi, Kurma" required />
            </div>
            <button type="submit" className="btn-primary" style={{marginTop: '1rem', width: '100%'}}>Save {selectedDay} Menu</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Menus;
