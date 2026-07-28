const db = require('./database');

// Wait for database initialization
setTimeout(() => {
  console.log("=== Change 1: Testing NOT NULL Rule on Complaints ===");
  
  // Try inserting a complaint without a room_id to show the database refusing it
  const stmt = db.prepare("INSERT INTO complaints (room_id, description) VALUES (?, ?)");
  stmt.run([null, "Leaking tap in unknown room"], function(err) {
    if (err) {
      console.log("SUCCESS! Database refused the insert as expected:");
      console.error("Error received:", err.message);
    } else {
      console.log("FAIL: Database accepted the insert.");
    }
    
    console.log("\n=== Change 2: Missing Match Query ===");
    console.log("Query: Find rooms that have NO complaints.");
    
    const query = `
      SELECT r.room_number, r.occupant_name
      FROM rooms r
      LEFT JOIN complaints c ON r.id = c.room_id
      WHERE c.id IS NULL
    `;
    
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error("Error running query:", err.message);
      } else {
        console.log("Rooms with no complaints:", rows);
      }
      
      // Close the DB
      db.close();
    });
  });
}, 1000); // 1 second delay to ensure DB tables are created
