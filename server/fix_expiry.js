const sqlite3 = require('sqlite3');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'));

db.run("UPDATE Medicines SET expiryDate = '2027-12-31'", function(err) {
  if (err) { console.error('Error:', err.message); db.close(); return; }
  console.log('Updated', this.changes, 'medicines - new expiry: 2027-12-31');

  db.all('SELECT id, name, expiryDate, quantity FROM Medicines', (err2, rows) => {
    if (err2) { console.error(err2.message); } else { console.log(rows); }
    db.close();
  });
});
