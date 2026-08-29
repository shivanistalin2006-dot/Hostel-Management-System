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
  db.get('SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ?', [username, username, password], (err, user) => {
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
      } else if (user.role === 'warden') {
        db.get('SELECT id as warden_id, name, hostel_id FROM wardens WHERE user_id = ?', [user.id], (err, warden) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({
            success: true,
            token: 'dummy-token-warden',
            user: user.username,
            role: user.role,
            warden_id: warden ? warden.warden_id : null,
            hostel_id: warden ? warden.hostel_id : null,
            name: warden ? warden.name : user.username
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

app.post('/api/login/google', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (user) {
      if (user.role === 'student') {
        db.get('SELECT id as student_id, name FROM students WHERE user_id = ?', [user.id], (err, student) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ 
            success: true, 
            token: 'dummy-token-student-google', 
            user: user.username, 
            role: user.role,
            student_id: student ? student.student_id : null,
            name: student ? student.name : user.username
          });
        });
      } else if (user.role === 'warden') {
        db.get('SELECT id as warden_id, name, hostel_id FROM wardens WHERE user_id = ?', [user.id], (err, warden) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({
            success: true,
            token: 'dummy-token-warden-google',
            user: user.username,
            role: user.role,
            warden_id: warden ? warden.warden_id : null,
            hostel_id: warden ? warden.hostel_id : null,
            name: warden ? warden.name : user.username
          });
        });
      } else {
        res.json({ success: true, token: 'dummy-token-admin-google', user: user.username, role: user.role, name: 'Admin' });
      }
    } else {
      res.status(401).json({ error: 'Google Account not found in the system. Please contact Admin.' });
    }
  });
});

// --- Dashboard Endpoints ---
app.get('/api/dashboard/stats', (req, res) => {
  db.get(`
    SELECT 
      COUNT(*) as total_rooms,
      SUM(CASE WHEN status = 'Occupied' THEN 1 ELSE 0 END) as occupied_rooms,
      SUM(CASE WHEN status = 'Vacant' THEN 1 ELSE 0 END) as vacant_rooms,
      SUM(CASE WHEN status = 'Maintenance' THEN 1 ELSE 0 END) as maintenance_rooms
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

app.post('/api/students', (req, res) => {
  const { name, register_no, contact, parent_contact, hostel_id, room_id } = req.body;
  if (!/^\d{10}$/.test(contact)) return res.status(400).json({ error: 'Contact number must be exactly 10 digits' });

  // Create user account first
  const username = name.trim(); // Using name as user ID
  const password = contact;     // Using contact number as password
  
  db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, 'student'], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    const user_id = this.lastID;
    
    db.run(
      'INSERT INTO students (user_id, name, register_no, contact, parent_contact, hostel_id, room_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, name, register_no, contact, parent_contact, hostel_id || null, room_id || null],
      function(err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ success: true, id: this.lastID, username, password });
      }
    );
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

app.put('/api/students/:id/room', (req, res) => {
  const { room_id, hostel_id } = req.body;
  db.run('UPDATE students SET room_id = ?, hostel_id = ? WHERE id = ?', [room_id, hostel_id, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    // Update room status to Occupied
    db.run('UPDATE rooms SET status = "Occupied" WHERE id = ?', [room_id]);
    res.json({ success: true });
  });
});

app.delete('/api/students/:id', (req, res) => {
  db.run('DELETE FROM students WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
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

// --- Wardens ---
app.get('/api/wardens', (req, res) => {
  db.all(`
    SELECT w.*, u.email, u.username, h.name as hostel_name 
    FROM wardens w 
    JOIN users u ON w.user_id = u.id
    LEFT JOIN hostels h ON w.hostel_id = h.id
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/wardens', (req, res) => {
  const { name, email, contact, hostel_id } = req.body;
  if (!/^\d{10}$/.test(contact)) return res.status(400).json({ error: 'Contact number must be exactly 10 digits' });
  
  const username = name.trim();
  const password = contact;

  db.run('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', [username, email, password, 'warden'], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    const user_id = this.lastID;
    
    db.run(
      'INSERT INTO wardens (user_id, name, contact, hostel_id) VALUES (?, ?, ?, ?)',
      [user_id, name, contact, hostel_id || null],
      function(err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ success: true, id: this.lastID, username, password });
      }
    );
  });
});

app.delete('/api/wardens/:id', (req, res) => {
  db.get('SELECT user_id FROM wardens WHERE id = ?', [req.params.id], (err, row) => {
    if (!row) return res.status(404).json({ error: 'Warden not found' });
    db.run('DELETE FROM wardens WHERE id = ?', [req.params.id], err2 => {
      if (err2) return res.status(500).json({ error: err2.message });
      db.run('DELETE FROM users WHERE id = ?', [row.user_id], err3 => {
        if (err3) return res.status(500).json({ error: err3.message });
        res.json({ success: true });
      });
    });
  });
});

app.get('/api/rooms', (req, res) => {
  db.all(`
    SELECT r.*, h.name as hostel_name, 
           (SELECT COUNT(*) FROM students s WHERE s.room_id = r.id) as occupied_count
    FROM rooms r 
    JOIN hostels h ON r.hostel_id = h.id
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/rooms', (req, res) => {
  const { hostel_id, room_number, floor, capacity, status } = req.body;
  db.run(
    'INSERT INTO rooms (hostel_id, room_number, floor, capacity, status) VALUES (?, ?, ?, ?, ?)',
    [hostel_id, room_number, floor, capacity, status || 'Vacant'],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, id: this.lastID });
    }
  );
});

app.put('/api/rooms/:id/status', (req, res) => {
  const { status } = req.body;
  db.run('UPDATE rooms SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// --- Attendance ---
app.get('/api/attendance', (req, res) => {
  const { date, student_id } = req.query;
  if (student_id) {
    db.all('SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC', [student_id], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  } else {
    const d = date || new Date().toISOString().split('T')[0];
    db.all('SELECT a.*, s.name as student_name FROM attendance a JOIN students s ON a.student_id = s.id WHERE a.date = ?', [d], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  }
});

app.post('/api/attendance', (req, res) => {
  const { date, records } = req.body; // records: [{student_id, status}]
  const stmt = db.prepare('INSERT OR REPLACE INTO attendance (date, student_id, status) VALUES (?, ?, ?)');
  records.forEach(r => {
    stmt.run([date, r.student_id, r.status]);
  });
  stmt.finalize();
  res.json({ success: true });
});

// --- Menus ---
app.get('/api/menus/today', (req, res) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = days[new Date().getDay()];
  db.get('SELECT * FROM menus WHERE day_of_week = ?', [today], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row || { day_of_week: today, breakfast: '', snack: '', lunch: '', tea: '', dinner: '' });
  });
});

app.get('/api/menus/week', (req, res) => {
  db.all('SELECT * FROM menus', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put('/api/menus/:day', (req, res) => {
  const { breakfast, snack, lunch, tea, dinner } = req.body;
  const day = req.params.day;
  db.run(
    'UPDATE menus SET breakfast = ?, snack = ?, lunch = ?, tea = ?, dinner = ? WHERE day_of_week = ?',
    [breakfast, snack, lunch, tea, dinner, day],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      // Notify students via announcement
      db.run("INSERT INTO announcements (title, content) VALUES (?, ?)", 
        ['Menu Updated', `The weekly menu for ${day} has been modified.`]);
      res.json({ success: true });
    }
  );
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
