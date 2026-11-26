const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { after, test } = require("node:test");
const { DatabaseSync } = require("node:sqlite");
const { createBackend } = require("../server");

const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "cebu-emergency-finder-"));
const logs = [];
const { server, db } = createBackend({
  databasePath: path.join(tempDirectory, "test.sqlite"),
  env: {
    BOOTSTRAP_ADMIN_EMAIL: "admin@example.gov",
    BOOTSTRAP_ADMIN_PASSWORD: "LocalTestPassword123!",
    BOOTSTRAP_ADMIN_NAME: "Test Administrator",
    BOOTSTRAP_ADMIN_PHONE: "+639171234567",
    ADMIN_DEV_OTP: "483920"
  },
  log: message => logs.push(message)
});

let baseUrl;
const listening = new Promise(resolve => {
  server.listen(0, "127.0.0.1", () => {
    baseUrl = `http://127.0.0.1:${server.address().port}`;
    resolve();
  });
});

async function request(route, options = {}) {
  await listening;
  const response = await fetch(`${baseUrl}${route}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const payload = response.status === 204 ? null : await response.json();
  return { response, payload };
}

function latestOtp() {
  const entry = logs.at(-1);
  assert.ok(entry, "expected a development OTP to be logged");
  return entry.match(/(\d{4,6})$/)[1];
}

after(async () => {
  await new Promise(resolve => server.close(resolve));
  db.close();
  fs.rmSync(tempDirectory, { recursive: true, force: true });
});

test("responder verification, admin approval, incident assignment and resolution persist", async () => {
  const registration = await request("/api/auth/responders/register", {
    method: "POST",
    body: {
      fullName: "Test Responder",
      phone: "09916542601",
      password: "ResponderPass123",
      unitType: "Medical",
      unitName: "Ambulance 1",
      baseStation: "Cebu City"
    }
  });
  assert.equal(registration.response.status, 201);
  const challengeId = registration.payload.challengeId;
  const verification = await request("/api/auth/responders/verify", {
    method: "POST",
    body: { challengeId, code: latestOtp() }
  });
  assert.equal(verification.response.status, 200);
  assert.equal(verification.payload.responder.approvalStatus, "PENDING");
  const pendingProfile = await request("/api/responder/me", { token: verification.payload.token });
  assert.equal(pendingProfile.payload.phone, "+639916542601");

  const incidentResult = await request("/api/incidents", {
    method: "POST",
    body: {
      clientId: "test-client-1",
      category: "Medical",
      description: "Test incident",
      priority: "HIGH"
    }
  });
  assert.equal(incidentResult.response.status, 201);
  assert.ok(incidentResult.payload.id);
  assert.equal(incidentResult.payload.status, "UNASSIGNED");
  assert.equal(incidentResult.payload.resolvedAt, null);

  const login = await request("/api/admin/auth/login", {
    method: "POST",
    body: { email: "admin@example.gov", password: "LocalTestPassword123!" }
  });
  assert.match(logs.at(-1), /code not printed/);
  assert.ok(!logs.at(-1).includes("483920"));
  const adminVerification = await request("/api/admin/auth/verify", {
    method: "POST",
    body: { challengeId: login.payload.challengeId, code: "483920" }
  });
  assert.equal(adminVerification.response.status, 200);
  const adminToken = adminVerification.payload.token;
  const reusedAdminCode = await request("/api/admin/auth/verify", {
    method: "POST",
    body: { challengeId: login.payload.challengeId, code: "483920" }
  });
  assert.equal(reusedAdminCode.response.status, 400);
  assert.match(reusedAdminCode.payload.message, /expired/);

  const approval = await request(`/api/admin/approvals/${verification.payload.responder.id}`, {
    method: "PATCH",
    token: adminToken,
    body: { status: "APPROVED" }
  });
  assert.equal(approval.payload.approvalStatus, "APPROVED");

  const responderLogin = await request("/api/auth/responders/login", {
    method: "POST",
    body: { phone: "+639916542601", password: "ResponderPass123" }
  });
  assert.equal(responderLogin.response.status, 200);
  const responderToken = responderLogin.payload.token;

  const availability = await request("/api/responder/availability", {
    method: "PATCH",
    token: responderToken,
    body: { availability: "AVAILABLE" }
  });
  assert.equal(availability.payload.availability, "AVAILABLE");

  const assignment = await request(`/api/admin/incidents/${incidentResult.payload.id}/assign`, {
    method: "POST",
    token: adminToken,
    body: {}
  });
  assert.equal(assignment.response.status, 200, JSON.stringify(assignment.payload));
  assert.equal(assignment.payload.status, "ASSIGNED");
  assert.equal(assignment.payload.assignedResponderId, verification.payload.responder.id);

  const history = await request("/api/responder/incidents", { token: responderToken });
  assert.equal(history.payload.length, 1);
  assert.equal(history.payload[0].category, "Medical");
  assert.equal(history.payload[0].status, "ASSIGNED");

  const onCall = await request("/api/responder/availability", {
    method: "PATCH",
    token: responderToken,
    body: { availability: "ON_CALL" }
  });
  assert.equal(onCall.payload.availability, "ON_CALL");

  const resolution = await request(`/api/responder/incidents/${incidentResult.payload.id}/resolve`, {
    method: "PATCH",
    token: responderToken
  });
  assert.equal(resolution.payload.status, "RESOLVED");
  assert.ok(resolution.payload.resolvedAt);
  assert.equal(db.prepare("SELECT status, resolved_at FROM incidents WHERE id = ?")
    .get(incidentResult.payload.id).status, "RESOLVED");

  const cors = await request("/api/incidents", {
    method: "OPTIONS",
    headers: { Origin: "http://localhost:5500" }
  });
  assert.equal(cors.response.status, 204);
  assert.equal(cors.response.headers.get("access-control-allow-origin"), "http://localhost:5500");

  const liveServerCors = await request("/api/admin/auth/login", {
    method: "OPTIONS",
    headers: { Origin: "http://127.0.0.1:60890" }
  });
  assert.equal(liveServerCors.response.status, 204);
  assert.equal(liveServerCors.response.headers.get("access-control-allow-origin"), "http://127.0.0.1:60890");

  const deniedCors = await request("/api/admin/auth/login", {
    method: "OPTIONS",
    headers: { Origin: "http://example.com:60890" }
  });
  assert.equal(deniedCors.response.headers.get("access-control-allow-origin"), null);
});

test("custom admin OTP is local-only and must be six digits", () => {
  assert.throws(() => createBackend({
    databasePath: path.join(tempDirectory, "production.sqlite"),
    env: { NODE_ENV: "production", ADMIN_DEV_OTP: "483920" },
    log: () => {}
  }), /cannot be configured in production/);
  assert.throws(() => createBackend({
    databasePath: path.join(tempDirectory, "invalid-otp.sqlite"),
    env: { ADMIN_DEV_OTP: "1234" },
    log: () => {}
  }), /exactly six digits/);
});

test("admin phone update changes only the admin contact and revokes existing auth", () => {
  const phoneDatabasePath = path.join(tempDirectory, "phone-update.sqlite");
  const phoneDb = new DatabaseSync(phoneDatabasePath);
  phoneDb.exec(fs.readFileSync(path.join(__dirname, "..", "database", "schema.sql"), "utf8"));
  phoneDb.prepare(`
    INSERT INTO admins (email, password_hash, full_name, phone, created_at)
    VALUES ('admin@example.gov', 'test-hash', 'Test Administrator', '+639171234567', ?)
  `).run(new Date().toISOString());
  phoneDb.prepare(`
    INSERT INTO auth_sessions (token_hash, role, subject_id, expires_at)
    VALUES ('test-admin-session', 'ADMIN', 1, ?)
  `).run(new Date(Date.now() + 60_000).toISOString());
  phoneDb.prepare(`
    INSERT INTO otp_challenges (id, purpose, subject_id, phone, code_hash, expires_at, last_sent_at)
    VALUES ('test-admin-challenge', 'ADMIN_LOGIN', 1, '+639171234567', 'test-hash', ?, ?)
  `).run(new Date(Date.now() + 60_000).toISOString(), new Date().toISOString());
  phoneDb.close();

  const result = spawnSync(process.execPath, [
    path.join(__dirname, "..", "scripts", "update-admin-phone.js"),
    "admin@example.gov"
  ], {
    cwd: path.join(__dirname, ".."),
    env: {
      ...process.env,
      DB_FILE: phoneDatabasePath,
      ADMIN_NEW_PHONE: "+639991112222",
      ADMIN_NEW_PHONE_CONFIRM: "+639991112222"
    },
    encoding: "utf8"
  });
  assert.equal(result.status, 0, result.stderr);

  const updatedDb = new DatabaseSync(phoneDatabasePath, { readOnly: true });
  try {
    assert.equal(updatedDb.prepare("SELECT phone FROM admins WHERE id = 1").get().phone, "+639991112222");
    assert.ok(updatedDb.prepare("SELECT revoked_at FROM auth_sessions WHERE token_hash = 'test-admin-session'").get().revoked_at);
    assert.ok(updatedDb.prepare("SELECT expires_at FROM otp_challenges WHERE id = 'test-admin-challenge'").get().expires_at
      <= new Date().toISOString());
  } finally {
    updatedDb.close();
  }
});
