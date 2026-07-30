import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Menus = () => {
  const [menu, setMenu] = useState({ breakfast: '', snack: '', lunch: '', tea: '', dinner: '' });

  useEffect(() => {
    axios.get(`${API_URL}/menus/today`).then(res => {
      if (res.data) setMenu(res.data);
    }).catch(console.error);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Assuming a PUT/POST endpoint would be here. For demo, we just alert.
    alert("Menu updated successfully for today!");
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Daily Food Menu</h1>
        <p className="page-subtitle">Update the schedule. Students will see this on their dashboard.</p>
      </div>

      <div className="card" style={{maxWidth: 600}}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Breakfast</label>
            <input value={menu.breakfast} onChange={e => setMenu({...menu, breakfast: e.target.value})} placeholder="e.g. Idli, Sambar, Chutney" required />
          </div>
          <div className="form-group">
            <label>Morning Snack</label>
            <input value={menu.snack} onChange={e => setMenu({...menu, snack: e.target.value})} placeholder="e.g. Biscuits, Milk" required />
          </div>
          <div className="form-group">
            <label>Lunch</label>
            <input value={menu.lunch} onChange={e => setMenu({...menu, lunch: e.target.value})} placeholder="e.g. Rice, Dal, Vegetable Fry" required />
          </div>
          <div className="form-group">
            <label>Evening Tea / Snack</label>
            <input value={menu.tea} onChange={e => setMenu({...menu, tea: e.target.value})} placeholder="e.g. Tea, Samosa" required />
          </div>
          <div className="form-group">
            <label>Dinner</label>
            <input value={menu.dinner} onChange={e => setMenu({...menu, dinner: e.target.value})} placeholder="e.g. Chapathi, Kurma" required />
          </div>
          <button type="submit" className="btn-primary" style={{marginTop: '1rem'}}>Publish Today's Menu</button>
        </form>
      </div>
    </>
  );
};

export default Menus;
