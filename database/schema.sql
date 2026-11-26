PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS responders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL CHECK (length(full_name) BETWEEN 1 AND 160),
    phone TEXT UNIQUE,
    password_hash TEXT,
    unit_type TEXT NOT NULL CHECK (length(unit_type) BETWEEN 1 AND 80),
    unit_name TEXT,
    base_station TEXT,
    approval_status TEXT NOT NULL DEFAULT 'PENDING'
        CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    availability TEXT NOT NULL DEFAULT 'OFF_DUTY'
        CHECK (availability IN ('AVAILABLE', 'ON_CALL', 'BUSY', 'OFF_DUTY', 'BREAK')),
    phone_verified INTEGER NOT NULL DEFAULT 0 CHECK (phone_verified IN (0, 1)),
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id TEXT NOT NULL,
    category TEXT NOT NULL CHECK (length(category) BETWEEN 1 AND 100),
    description TEXT CHECK (description IS NULL OR length(description) <= 2000),
    priority TEXT NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('NORMAL', 'HIGH')),
    status TEXT NOT NULL DEFAULT 'UNASSIGNED'
        CHECK (status IN ('UNASSIGNED', 'ASSIGNED', 'RESOLVED')),
    assigned_responder_id INTEGER REFERENCES responders(id),
    created_at TEXT NOT NULL,
    resolved_at TEXT,
    CHECK (
        (status = 'UNASSIGNED' AND assigned_responder_id IS NULL AND resolved_at IS NULL)
        OR (status = 'ASSIGNED' AND assigned_responder_id IS NOT NULL AND resolved_at IS NULL)
        OR (status = 'RESOLVED' AND assigned_responder_id IS NOT NULL AND resolved_at IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_incidents_client_created
    ON incidents(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_responder_created
    ON incidents(assigned_responder_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_status
    ON incidents(status);

CREATE TABLE IF NOT EXISTS auth_sessions (
    token_hash TEXT PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('RESPONDER', 'ADMIN', 'PASSWORD_RESET')),
    subject_id INTEGER NOT NULL,
    expires_at TEXT NOT NULL,
    revoked_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_subject
    ON auth_sessions(role, subject_id, revoked_at);

CREATE TABLE IF NOT EXISTS otp_challenges (
    id TEXT PRIMARY KEY,
    purpose TEXT NOT NULL,
    subject_id INTEGER,
    phone TEXT,
    code_hash TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 5),
    last_sent_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL REFERENCES admins(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    created_at TEXT NOT NULL
);
