const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;

// Keep emergency_system.db in the same folder as this file
const db = new Database(path.join(__dirname, 'emergency_system.db'));

app.use(express.json());

// Serves your existing HTML/CSS/JS screens (index.html, screens/...)
app.use(express.static(__dirname));

// POST /api/login  { email, password }  ->  { id, name, role }
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const user = db
      .prepare('SELECT id, name, email, password, role FROM users WHERE email = ?')
      .get(String(email).trim().toLowerCase());

    // Same message for "no user" and "wrong password" on purpose
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.json({ id: user.id, name: user.name, role: user.role });
  } catch (error) {
    console.error('Login request failed:', error);
    res.status(500).json({ message: 'An unexpected server error occurred.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
