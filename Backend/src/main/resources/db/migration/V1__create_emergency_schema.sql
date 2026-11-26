CREATE TABLE responders (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(160) NOT NULL,
    phone VARCHAR(32) UNIQUE,
    password_hash VARCHAR(100),
    unit_type VARCHAR(80) NOT NULL,
    unit_name VARCHAR(160),
    base_station VARCHAR(240),
    approval_status VARCHAR(20) NOT NULL,
    availability VARCHAR(20) NOT NULL,
    phone_verified BOOLEAN NOT NULL,
    active BOOLEAN NOT NULL,
    created_at TIMESTAMP(6) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE admin_users (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    full_name VARCHAR(160) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    active BOOLEAN NOT NULL
) ENGINE=InnoDB;

CREATE TABLE incidents (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    client_id VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description VARCHAR(2000),
    requester_phone VARCHAR(32),
    priority VARCHAR(20) NOT NULL,
    latitude DOUBLE,
    longitude DOUBLE,
    status VARCHAR(20) NOT NULL,
    assigned_responder_id BIGINT,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT fk_incidents_assigned_responder
        FOREIGN KEY (assigned_responder_id) REFERENCES responders(id)
) ENGINE=InnoDB;

CREATE INDEX idx_incidents_client_created ON incidents(client_id, created_at);
CREATE INDEX idx_incidents_assigned_created ON incidents(assigned_responder_id, created_at);
CREATE INDEX idx_incidents_status ON incidents(status);

CREATE TABLE auth_sessions (
    token_hash VARCHAR(64) NOT NULL PRIMARY KEY,
    role VARCHAR(30) NOT NULL,
    subject_id BIGINT NOT NULL,
    expires_at TIMESTAMP(6) NOT NULL,
    revoked_at TIMESTAMP(6) NULL
) ENGINE=InnoDB;

CREATE INDEX idx_auth_sessions_subject ON auth_sessions(role, subject_id, revoked_at);

CREATE TABLE otp_challenges (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    purpose VARCHAR(30) NOT NULL,
    subject_id BIGINT NULL,
    code_hash VARCHAR(100) NOT NULL,
    expires_at TIMESTAMP(6) NOT NULL,
    attempts INT NOT NULL,
    last_sent_at TIMESTAMP(6) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE audit_events (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    admin_id BIGINT NOT NULL,
    action VARCHAR(80) NOT NULL,
    entity_type VARCHAR(40) NOT NULL,
    entity_id BIGINT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT fk_audit_events_admin
        FOREIGN KEY (admin_id) REFERENCES admin_users(id)
) ENGINE=InnoDB;

CREATE INDEX idx_audit_events_admin_created ON audit_events(admin_id, created_at);

-- A responder can send location updates by SMS. Keep every report so the
-- admin can see the latest received position and the location history.
CREATE TABLE responder_location_reports (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    responder_id BIGINT NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    accuracy_meters DOUBLE NULL,
    source VARCHAR(20) NOT NULL DEFAULT 'SMS',
    source_message_id VARCHAR(100) NULL UNIQUE,
    received_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT fk_location_reports_responder
        FOREIGN KEY (responder_id) REFERENCES responders(id)
) ENGINE=InnoDB;

CREATE INDEX idx_location_reports_responder_received
    ON responder_location_reports(responder_id, received_at);
