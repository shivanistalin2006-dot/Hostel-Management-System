const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

// API Endpoints

// 1. Get all rooms
app.get('/api/rooms', (req, res) => {
  db.all('SELECT * FROM rooms', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 2. Add or update a room (Task 1: validation and saving)
app.post('/api/rooms', (req, res) => {
  const { room_number, occupant_name, is_vacant } = req.body;
  
  // Validation
  if (!room_number) {
    return res.status(400).json({ error: 'Room number is required' });
  }

  const stmt = db.prepare('INSERT INTO rooms (room_number, occupant_name, is_vacant) VALUES (?, ?, ?)');
  stmt.run([room_number, occupant_name, is_vacant ? 1 : 0], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
         // If room exists, we can update it instead of failing, or just return an error
         return res.status(400).json({ error: 'Room already exists' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, room_number, occupant_name, is_vacant: is_vacant ? 1 : 0 });
  });
});

// 3. Create a complaint
app.post('/api/complaints', (req, res) => {
  const { room_id, description } = req.body;
  
  // Validation
  if (!room_id) {
    return res.status(400).json({ error: 'Room ID is required' });
  }
  if (!description || description.trim() === '') {
    return res.status(400).json({ error: 'Complaint description is required' });
  }

  const stmt = db.prepare('INSERT INTO complaints (room_id, description) VALUES (?, ?)');
  stmt.run([room_id, description], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    const complaintId = this.lastID;
    
    // Add to history
    const historyStmt = db.prepare('INSERT INTO complaint_history (complaint_id, status) VALUES (?, ?)');
    historyStmt.run([complaintId, 'outstanding'], (hErr) => {
      if (hErr) console.error('Error logging history:', hErr.message);
      
      // Calculate derived figure: 0 days outstanding initially
      res.json({ 
        id: complaintId, 
        room_id, 
        description, 
        current_status: 'outstanding',
        days_outstanding: 0 // Derived figure
      });
    });
  });
});

// 4. Get all complaints with derived figures (Task 4: Listing, Ordering, Filter, Search)
app.get('/api/complaints', (req, res) => {
  const { search = '', status = 'all' } = req.query;
  
  let query = `
    SELECT c.*, r.room_number, 
           (julianday('now') - julianday(c.created_at)) AS days_outstanding_raw
    FROM complaints c
    JOIN rooms r ON c.room_id = r.id
    WHERE 1=1
  `;
  const params = [];
  
  if (search) {
    query += ` AND (c.description LIKE ? OR r.room_number LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }
  if (status !== 'all') {
    query += ` AND c.current_status = ?`;
    params.push(status);
  }
  
  // Ordering: Outstanding first, then by oldest (highest days outstanding)
  query += ` ORDER BY c.current_status DESC, days_outstanding_raw DESC`;

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Calculate derived figures on server
    const results = rows.map(row => ({
      ...row,
      days_outstanding: Math.floor(row.days_outstanding_raw),
      hours_outstanding: Math.floor(row.days_outstanding_raw * 24),
      needs_urgent_attention: row.current_status === 'outstanding' && row.days_outstanding_raw * 24 > 48
    }));
    
    res.json(results);
  });
});

// 5. Update complaint status
app.put('/api/complaints/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!['outstanding', 'resolved'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  db.run('UPDATE complaints SET current_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    // Add to history
    db.run('INSERT INTO complaint_history (complaint_id, status) VALUES (?, ?)', [id, status], (hErr) => {
      if (hErr) console.error('Error logging history:', hErr.message);
      res.json({ message: 'Status updated' });
    });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
