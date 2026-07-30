const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

// --- Auth Endpoints ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) {
      res.json({ success: true, token: 'dummy-token-123', user: row.username });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// --- Dashboard Endpoints ---
app.get('/api/dashboard/stats', (req, res) => {
  db.get(`
    SELECT 
      COUNT(*) as total_rooms,
      SUM(CASE WHEN is_vacant = 0 THEN 1 ELSE 0 END) as occupied_rooms,
      SUM(CASE WHEN is_vacant = 1 THEN 1 ELSE 0 END) as vacant_rooms
    FROM rooms
  `, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// --- Students Endpoints ---
app.get('/api/students', (req, res) => {
  db.all('SELECT s.*, r.room_number FROM students s LEFT JOIN rooms r ON s.room_id = r.id', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/students', (req, res) => {
  const { name, register_no, contact, room_id } = req.body;
  
  if (!name || !register_no) return res.status(400).json({ error: 'Name and Register No are required' });

  db.run('INSERT INTO students (name, register_no, contact, room_id) VALUES (?, ?, ?, ?)', 
    [name, register_no, contact, room_id || null], 
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) return res.status(400).json({ error: 'Student already exists' });
        return res.status(500).json({ error: err.message });
      }
      // If assigned to a room, mark room as occupied
      if (room_id) {
        db.run('UPDATE rooms SET is_vacant = 0 WHERE id = ?', [room_id]);
      }
      res.json({ id: this.lastID, name, register_no });
  });
});

// --- Rooms Endpoints ---
app.get('/api/rooms', (req, res) => {
  db.all('SELECT * FROM rooms', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/rooms', (req, res) => {
  const { room_number, is_vacant } = req.body;
  if (!room_number) return res.status(400).json({ error: 'Room number is required' });

  db.run('INSERT INTO rooms (room_number, is_vacant) VALUES (?, ?)', [room_number, is_vacant ? 1 : 0], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, room_number });
  });
});

// --- Complaints Endpoints ---
app.post('/api/complaints', (req, res) => {
  const { room_id, description } = req.body;
  if (!room_id) return res.status(400).json({ error: 'Room ID is required' });
  if (!description) return res.status(400).json({ error: 'Complaint description is required' });

  db.run('INSERT INTO complaints (room_id, description) VALUES (?, ?)', [room_id, description], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    const complaintId = this.lastID;
    
    db.run('INSERT INTO complaint_history (complaint_id, status) VALUES (?, ?)', [complaintId, 'outstanding']);
    res.json({ id: complaintId, room_id, description, current_status: 'outstanding', days_outstanding: 0 });
  });
});

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
  
  query += ` ORDER BY c.current_status DESC, days_outstanding_raw DESC`;

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const results = rows.map(row => ({
      ...row,
      days_outstanding: Math.floor(row.days_outstanding_raw),
      hours_outstanding: Math.floor(row.days_outstanding_raw * 24),
      needs_urgent_attention: row.current_status === 'outstanding' && row.days_outstanding_raw * 24 > 48
    }));
    res.json(results);
  });
});

app.put('/api/complaints/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  db.run('UPDATE complaints SET current_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    db.run('INSERT INTO complaint_history (complaint_id, status) VALUES (?, ?)', [id, status]);
    res.json({ message: 'Status updated' });
  });
});

// --- Complaint History Endpoints ---
app.get('/api/complaint_history', (req, res) => {
  db.all(`
    SELECT h.*, c.description, r.room_number 
    FROM complaint_history h
    JOIN complaints c ON h.complaint_id = c.id
    JOIN rooms r ON c.room_id = r.id
    ORDER BY h.changed_at DESC
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
