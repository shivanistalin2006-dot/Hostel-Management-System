const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'hostel.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    db.serialize(() => {
      // Create Users table for Login
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL
        )
      `);

      // Create Students table
      db.run(`
        CREATE TABLE IF NOT EXISTS students (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          register_no TEXT UNIQUE NOT NULL,
          contact TEXT,
          room_id INTEGER
        )
      `);

      // Rooms table
      db.run(`
        CREATE TABLE IF NOT EXISTS rooms (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          room_number TEXT UNIQUE NOT NULL,
          is_vacant BOOLEAN DEFAULT 1
        )
      `);

      // Complaints table
      db.run(`
        CREATE TABLE IF NOT EXISTS complaints (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          room_id INTEGER NOT NULL,
          description TEXT NOT NULL,
          current_status TEXT DEFAULT 'outstanding',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (room_id) REFERENCES rooms(id)
        )
      `);

      // Complaint History table
      db.run(`
        CREATE TABLE IF NOT EXISTS complaint_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          complaint_id INTEGER,
          status TEXT NOT NULL,
          changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (complaint_id) REFERENCES complaints(id)
        )
      `);

      // Insert default Admin user if empty
      db.get('SELECT COUNT(*) AS count FROM users', (err, row) => {
        if (!err && row.count === 0) {
          db.run('INSERT INTO users (username, password) VALUES (?, ?)', ['admin', 'admin123']);
        }
      });

      // Insert some initial rooms if empty
      db.get('SELECT COUNT(*) AS count FROM rooms', (err, row) => {
        if (!err && row.count === 0) {
          const stmt = db.prepare('INSERT INTO rooms (room_number, is_vacant) VALUES (?, ?)');
          stmt.run('101', 1);
          stmt.run('102', 1);
          stmt.run('103', 1);
          stmt.run('201', 1);
          stmt.run('202', 1);
          stmt.finalize();
        }
      });
    });
  }
});

module.exports = db;
