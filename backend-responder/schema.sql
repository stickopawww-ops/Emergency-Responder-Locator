CREATE TABLE IF NOT EXISTS responders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  unit TEXT,
  station TEXT,
  status TEXT DEFAULT 'pending',
  otp_code TEXT
);

INSERT OR IGNORE INTO responders (phone, password, unit, station, status)
VALUES ('9916542601', '12345678', 'Ambulance 1', 'Health Center Samboan', 'pending');