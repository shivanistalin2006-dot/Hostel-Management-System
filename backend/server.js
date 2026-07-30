const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// --- Multer Configuration for Profile Pics ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  }
});
const upload = multer({ storage: storage });

// --- Auth Endpoints ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (user) {
      if (user.role === 'student') {
        // Fetch student details for the token
        db.get('SELECT id as student_id, name FROM students WHERE user_id = ?', [user.id], (err, student) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ 
            success: true, 
            token: 'dummy-token-student', 
            user: user.username, 
            role: user.role,
            student_id: student ? student.student_id : null,
            name: student ? student.name : user.username
          });
        });
      } else {
        res.json({ success: true, token: 'dummy-token-admin', user: user.username, role: user.role, name: 'Admin' });
      }
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
  `, (err, roomStats) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.get(`
      SELECT 
        COUNT(*) as total_complaints,
        SUM(CASE WHEN current_status = 'outstanding' THEN 1 ELSE 0 END) as pending_complaints,
        SUM(CASE WHEN current_status = 'resolved' THEN 1 ELSE 0 END) as resolved_complaints
      FROM complaints
    `, (err, complaintStats) => {
      res.json({ ...roomStats, ...complaintStats });
    });
  });
});

// --- Students Endpoints ---
app.get('/api/students', (req, res) => {
  db.all(`
    SELECT s.*, r.room_number, h.name as hostel_name 
    FROM students s 
    LEFT JOIN rooms r ON s.room_id = r.id
    LEFT JOIN hostels h ON s.hostel_id = h.id
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/students/:id', (req, res) => {
  db.get(`
    SELECT s.*, r.room_number, h.name as hostel_name 
    FROM students s 
    LEFT JOIN rooms r ON s.room_id = r.id
    LEFT JOIN hostels h ON s.hostel_id = h.id
    WHERE s.id = ?
  `, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

app.post('/api/students/:id/upload-pic', upload.single('profilePic'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const picUrl = `/uploads/${req.file.filename}`;
  
  db.run('UPDATE students SET profile_pic_url = ? WHERE id = ?', [picUrl, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, profile_pic_url: picUrl });
  });
});

// --- Leaves & OD ---
app.get('/api/leaves', (req, res) => {
  // Admin view: see all leaves
  db.all('SELECT l.*, s.name as student_name FROM leaves l JOIN students s ON l.student_id = s.id ORDER BY l.start_date DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/students/:id/leaves', (req, res) => {
  // Student view: see own leaves
  db.all('SELECT * FROM leaves WHERE student_id = ? ORDER BY start_date DESC', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/leaves', (req, res) => {
  const { student_id, type, start_date, end_date, reason } = req.body;
  db.run('INSERT INTO leaves (student_id, type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)',
    [student_id, type, start_date, end_date, reason], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, status: 'pending' });
    });
});

// --- Rooms & Hostels ---
app.get('/api/hostels', (req, res) => {
  db.all('SELECT * FROM hostels', [], (err, rows) => res.json(rows));
});

app.get('/api/rooms', (req, res) => {
  db.all('SELECT r.*, h.name as hostel_name FROM rooms r JOIN hostels h ON r.hostel_id = h.id', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// --- Menus ---
app.get('/api/menus/today', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  db.get('SELECT * FROM menus WHERE date = ?', [today], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || { date: today, breakfast: '', snack: '', lunch: '', tea: '', dinner: '' });
  });
});

// --- Announcements ---
app.get('/api/announcements', (req, res) => {
  db.all('SELECT * FROM announcements ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Keep existing complaints endpoints (abbreviated for length but functional)
app.get('/api/complaints', (req, res) => {
  db.all('SELECT c.*, r.room_number FROM complaints c JOIN rooms r ON c.room_id = r.id ORDER BY created_at DESC', [], (err, rows) => {
    res.json(rows);
  });
});
app.post('/api/complaints', (req, res) => {
  const { room_id, description, student_id } = req.body;
  db.run('INSERT INTO complaints (room_id, description, student_id) VALUES (?, ?, ?)', [room_id, description, student_id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, status: 'outstanding' });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
