const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const dbPath = path.resolve(dataDir, 'hostel.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    db.serialize(() => {
      // Create Users table for Login (Admin & Student roles)
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'student' -- 'admin', 'student', or 'warden'
        )
      `);

      // Create Hostels table
      db.run(`
        CREATE TABLE IF NOT EXISTS hostels (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT NOT NULL -- 'Boys' or 'Girls'
        )
      `);

      // Create Rooms table (expanded)
      db.run(`
          CREATE TABLE IF NOT EXISTS rooms (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          hostel_id INTEGER,
          room_number TEXT NOT NULL,
          floor INTEGER DEFAULT 1,
          capacity INTEGER DEFAULT 2,
          status TEXT DEFAULT 'Vacant', -- 'Vacant', 'Occupied', 'Maintenance'
          FOREIGN KEY (hostel_id) REFERENCES hostels(id),
          UNIQUE(hostel_id, room_number)
        )
      `);

      // Create Students table (expanded)
      db.run(`
        CREATE TABLE IF NOT EXISTS students (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER UNIQUE,
          name TEXT NOT NULL,
          register_no TEXT UNIQUE NOT NULL,
          contact TEXT,
          parent_contact TEXT NOT NULL,
          profile_pic_url TEXT,
          room_id INTEGER,
          hostel_id INTEGER,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (room_id) REFERENCES rooms(id),
          FOREIGN KEY (hostel_id) REFERENCES hostels(id)
        )
      `);

      // Create Wardens table
      db.run(`
        CREATE TABLE IF NOT EXISTS wardens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER UNIQUE,
          name TEXT NOT NULL,
          contact TEXT,
          hostel_id INTEGER,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (hostel_id) REFERENCES hostels(id)
        )
      `);

      // Attendance Table
      db.run(`
        CREATE TABLE IF NOT EXISTS attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date DATE NOT NULL,
          student_id INTEGER NOT NULL,
          status TEXT NOT NULL, -- 'Present' or 'Absent'
          FOREIGN KEY (student_id) REFERENCES students(id),
          UNIQUE(date, student_id)
        )
      `);

      // Leave & OD Applications
      db.run(`
        CREATE TABLE IF NOT EXISTS leaves (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          type TEXT NOT NULL, -- 'Leave' or 'OD'
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          reason TEXT NOT NULL,
          status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
          FOREIGN KEY (student_id) REFERENCES students(id)
        )
      `);

      // Food Menus (Weekly)
      db.run(`
        CREATE TABLE IF NOT EXISTS weekly_menus (
          day_of_week TEXT PRIMARY KEY,
          breakfast TEXT,
          snack TEXT,
          lunch TEXT,
          tea TEXT,
          dinner TEXT
        )
      `);

      // Announcements
      db.run(`
        CREATE TABLE IF NOT EXISTS announcements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Complaints
      db.run(`
        CREATE TABLE IF NOT EXISTS complaints (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER,
          room_id INTEGER NOT NULL,
          description TEXT NOT NULL,
          current_status TEXT DEFAULT 'outstanding',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES students(id),
          FOREIGN KEY (room_id) REFERENCES rooms(id)
        )
      `);

      // Complaint History
      db.run(`
        CREATE TABLE IF NOT EXISTS complaint_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          complaint_id INTEGER,
          status TEXT NOT NULL,
          changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (complaint_id) REFERENCES complaints(id)
        )
      `);

      // Initialize default data if empty
      db.get('SELECT COUNT(*) AS count FROM users', (err, row) => {
        if (!err && row.count === 0) {
          // Add Admin
          db.run('INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)', ['shivani', 'shivu', 'shivanistalin2006@gmail.com', 'admin']);
          
          // Add default Warden
          db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['warden1', 'warden123', 'warden'], function(err) {
            if (!err) {
              const wardenUserId = this.lastID;
              // Add a default student for testing
              db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['student1', 'student123', 'student'], function(err) {
                if (!err) {
                  const studentUserId = this.lastID;
                  db.run('INSERT INTO hostels (name, type) VALUES (?, ?)', ['Boys Hostel A', 'Boys'], function(err) {
                    if (!err) {
                      const hostelId = this.lastID;
                      
                      // Assign Warden to Hostel
                      db.run('INSERT INTO wardens (user_id, name, contact, hostel_id) VALUES (?, ?, ?, ?)', [wardenUserId, 'Mr. Warden', '9998887776', hostelId]);
                      
                      db.run('INSERT INTO rooms (hostel_id, room_number, floor, capacity, status) VALUES (?, ?, ?, ?, ?)', [hostelId, '101', 1, 2, 'Occupied'], function(err) {
                        if (!err) {
                          db.run(`INSERT INTO students (user_id, name, register_no, contact, parent_contact, hostel_id, room_id) 
                                  VALUES (?, ?, ?, ?, ?, ?, ?)`, 
                                  [studentUserId, 'Test Student', 'REG001', '1231231234', '1234567890', hostelId, this.lastID]);
                        }
                      });
                      db.run('INSERT INTO rooms (hostel_id, room_number, floor, capacity, status) VALUES (?, ?, ?, ?, ?)', [hostelId, '102', 1, 2, 'Vacant']);
                      db.run('INSERT INTO rooms (hostel_id, room_number, floor, capacity, status) VALUES (?, ?, ?, ?, ?)', [hostelId, '103', 1, 2, 'Maintenance']);
                    }
                  });
                  db.run('INSERT INTO hostels (name, type) VALUES (?, ?)', ['Girls Hostel A', 'Girls']);
                }
              });
            }
          });
        }
      });
      
      db.get('SELECT COUNT(*) AS count FROM weekly_menus', (err, row) => {
        if (!err && row.count === 0) {
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          db.serialize(() => {
            const stmt = db.prepare('INSERT INTO weekly_menus (day_of_week, breakfast, snack, lunch, tea, dinner) VALUES (?, ?, ?, ?, ?, ?)');
            days.forEach(day => {
              stmt.run([day, 'Idli Sambar', 'Biscuits', 'Meals', 'Tea & Samosa', 'Chapathi']);
            });
            stmt.finalize();
          });
        }
      });
      // Schema Migrations (Run every time)
      db.run("ALTER TABLE users ADD COLUMN email TEXT", (err) => {
        if (!err) {
          console.log("Added email column to users table.");
        }
        // Force update admin credentials AFTER ensuring column exists (or fails if it already exists, which is fine)
        db.run("UPDATE users SET username = 'shivani', password = 'shivu', email = 'shivanistalin2006@gmail.com' WHERE role = 'admin'");
      });

      // Migrate rooms table to remove global UNIQUE on room_number and add composite UNIQUE(hostel_id, room_number)
      db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='rooms'", (err, row) => {
        if (row && row.sql.includes("room_number TEXT UNIQUE")) {
          console.log("Migrating rooms table to fix UNIQUE constraint...");
          db.serialize(() => {
            db.run("CREATE TABLE rooms_new (id INTEGER PRIMARY KEY AUTOINCREMENT, hostel_id INTEGER, room_number TEXT NOT NULL, floor INTEGER DEFAULT 1, capacity INTEGER DEFAULT 2, status TEXT DEFAULT 'Vacant', FOREIGN KEY (hostel_id) REFERENCES hostels(id), UNIQUE(hostel_id, room_number))");
            db.run("INSERT INTO rooms_new SELECT * FROM rooms");
            db.run("DROP TABLE rooms");
            db.run("ALTER TABLE rooms_new RENAME TO rooms");
          });
        }
      });

    });
  }
});

module.exports = db;
