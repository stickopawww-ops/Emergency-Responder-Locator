// Run once: node hash-passwords.js
// Converts any plain-text passwords in `users` to bcrypt hashes.
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database(path.join(__dirname, 'emergency_system.db'));

const users = db.prepare('SELECT id, password FROM users').all();
const update = db.prepare('UPDATE users SET password = ? WHERE id = ?');

let changed = 0;
for (const u of users) {
  if (u.password.startsWith('$2')) continue; // already hashed
  update.run(bcrypt.hashSync(u.password, 10), u.id);
  changed++;
}

console.log(`Hashed ${changed} password(s).`);
