const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");

const ROOT = __dirname;
const ALLOWED_ORIGINS = new Set([
  "http://localhost:5500",
  "http://127.0.0.1:5500"
]);
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml"
};
const AVAILABILITY = new Set(["AVAILABLE", "ON_CALL", "BUSY", "OFF_DUTY", "BREAK"]);

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function isAllowedOrigin(origin, env) {
  if (ALLOWED_ORIGINS.has(origin)) return true;
  if (!origin || env.NODE_ENV === "production") return false;
  try {
    const parsed = new URL(origin);
    return parsed.protocol === "http:"
      && !parsed.username
      && !parsed.password
      && parsed.origin === origin
      && ["localhost", "127.0.0.1"].includes(parsed.hostname);
  } catch {
    return false;
  }
}

function fail(status, message) {
  throw new ApiError(status, message);
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

function passwordMatches(password, storedHash) {
  if (!storedHash) return false;
  const [saltHex, hashHex] = storedHash.split(":");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), expected.length);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function tokenHash(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function cleanText(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function requiredText(value, label, maxLength) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
    fail(400, `${label} is required and must be at most ${maxLength} characters.`);
  }
  return value.trim();
}

function normalizePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  const national = digits.startsWith("63") ? digits.slice(2) : digits;
  const phone = national.startsWith("0") ? national.slice(1) : national;
  if (!/^9\d{9}$/.test(phone)) fail(400, "Enter a valid Philippine mobile number.");
  return `+63${phone}`;
}

function phoneSuffix(phone) {
  return phone.slice(-4);
}

function maskedPhone(phone) {
  return `+63 ••• ••• ${phoneSuffix(phone)}`;
}

function responderView(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    unitType: row.unit_type,
    unitName: row.unit_name,
    baseStation: row.base_station,
    approvalStatus: row.approval_status,
    availability: row.availability
  };
}

function incidentView(row) {
  return {
    id: row.id,
    clientId: row.client_id,
    category: row.category,
    description: row.description,
    priority: row.priority,
    status: row.status,
    assignedResponderId: row.assigned_responder_id,
    assignedResponderName: row.assigned_responder_name || null,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at
  };
}

function createBackend(options = {}) {
  const databasePath = options.databasePath || process.env.DB_FILE
    || path.join(ROOT, "data", "emergency-finder.sqlite");
  const env = options.env || process.env;
  const log = options.log || console.log;
  const adminDevOtp = env.ADMIN_DEV_OTP || null;
  if (adminDevOtp && env.NODE_ENV === "production") {
    throw new Error("ADMIN_DEV_OTP cannot be configured in production.");
  }
  if (adminDevOtp && !/^\d{6}$/.test(adminDevOtp)) {
    throw new Error("ADMIN_DEV_OTP must be exactly six digits.");
  }
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  const db = new DatabaseSync(databasePath);
  db.exec(fs.readFileSync(path.join(ROOT, "database", "schema.sql"), "utf8"));
  db.exec("PRAGMA foreign_keys = ON");

  if (env.BOOTSTRAP_ADMIN_EMAIL && env.BOOTSTRAP_ADMIN_PASSWORD) {
    const email = env.BOOTSTRAP_ADMIN_EMAIL.trim().toLowerCase();
    const name = requiredText(env.BOOTSTRAP_ADMIN_NAME || "Dispatch Administrator", "Admin name", 160);
    const phone = normalizePhone(env.BOOTSTRAP_ADMIN_PHONE || "");
    if (env.BOOTSTRAP_ADMIN_PASSWORD.length < 12) {
      throw new Error("BOOTSTRAP_ADMIN_PASSWORD must contain at least 12 characters.");
    }
    db.prepare(`
      INSERT OR IGNORE INTO admins (email, password_hash, full_name, phone, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(email, hashPassword(env.BOOTSTRAP_ADMIN_PASSWORD), name, phone, new Date().toISOString());
  }

  function sendJson(req, res, status, value) {
    const origin = req.headers.origin;
    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Vary": "Origin"
    };
    if (isAllowedOrigin(origin, env)) headers["Access-Control-Allow-Origin"] = origin;
    res.writeHead(status, headers);
    res.end(status === 204 ? undefined : JSON.stringify(value));
  }

  async function readJson(req) {
    let text = "";
    for await (const chunk of req) {
      text += chunk;
      if (text.length > 20000) fail(413, "Request body is too large.");
    }
    if (!text) return {};
    try {
      const body = JSON.parse(text);
      if (!body || Array.isArray(body) || typeof body !== "object") fail(400, "A JSON object is required.");
      return body;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      fail(400, "Invalid JSON request body.");
    }
  }

  function bearerToken(req) {
    const match = /^Bearer ([^\s]+)$/.exec(req.headers.authorization || "");
    return match ? match[1] : null;
  }

  function authenticatedSubject(req, role) {
    const token = bearerToken(req);
    if (!token) fail(401, "Authentication is required.");
    const session = db.prepare(`
      SELECT subject_id FROM auth_sessions
      WHERE token_hash = ? AND role = ? AND revoked_at IS NULL AND expires_at > ?
    `).get(tokenHash(token), role, new Date().toISOString());
    if (!session) fail(401, "Sign in required. Your session may have expired.");
    const table = role === "ADMIN" ? "admins" : "responders";
    const subject = db.prepare(`SELECT * FROM ${table} WHERE id = ? AND active = 1`).get(session.subject_id);
    if (!subject) fail(401, "This account is unavailable.");
    return { token, subject };
  }

  function requireResponder(req, approved = false) {
    const auth = authenticatedSubject(req, "RESPONDER");
    if (approved && auth.subject.approval_status !== "APPROVED") {
      fail(403, "Your responder account has not been approved.");
    }
    return auth;
  }

  function requireAdmin(req) {
    return authenticatedSubject(req, "ADMIN").subject;
  }

  function createSession(role, subjectId, hours = 12) {
    const token = crypto.randomBytes(32).toString("base64url");
    db.prepare(`
      INSERT INTO auth_sessions (token_hash, role, subject_id, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(tokenHash(token), role, subjectId,
      new Date(Date.now() + hours * 60 * 60 * 1000).toISOString());
    return token;
  }

  function createChallenge(purpose, subjectId, phone) {
    const id = crypto.randomUUID();
    const digits = purpose === "ADMIN_LOGIN" ? 6 : 4;
    const code = purpose === "ADMIN_LOGIN" && adminDevOtp
      ? adminDevOtp
      : String(crypto.randomInt(0, 10 ** digits)).padStart(digits, "0");
    db.prepare(`
      INSERT INTO otp_challenges (id, purpose, subject_id, phone, code_hash, expires_at, attempts, last_sent_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?)
    `).run(id, purpose, subjectId, phone, hashPassword(code),
      new Date(Date.now() + 5 * 60 * 1000).toISOString(), new Date().toISOString());
    if (phone && purpose === "ADMIN_LOGIN" && adminDevOtp) {
      log(`Using configured local admin verification code for ${phone}; code not printed.`);
    } else if (phone) {
      log(`Development verification code for ${phone}: ${code}`);
    }
    return { challengeId: id, maskedPhone: phone ? maskedPhone(phone) : undefined, expiresInSeconds: 300 };
  }

  function verifyChallenge(id, code, purpose) {
    const challenge = db.prepare("SELECT * FROM otp_challenges WHERE id = ?").get(id);
    if (!challenge || challenge.purpose !== purpose) {
      fail(400, "This verification session is unavailable. Sign in again to request a new code.");
    }
    if (Date.parse(challenge.expires_at) <= Date.now()) {
      fail(400, "This verification code has expired. Sign in again to request a new one.");
    }
    if (challenge.attempts >= 5) {
      fail(400, "Too many incorrect attempts. Sign in again to request a new code.");
    }
    db.prepare("UPDATE otp_challenges SET attempts = attempts + 1 WHERE id = ?").run(id);
    if (!passwordMatches(code, challenge.code_hash)) fail(400, "The code is incorrect.");
    db.prepare("UPDATE otp_challenges SET expires_at = ? WHERE id = ?")
      .run(new Date().toISOString(), id);
    return challenge;
  }

  function responderIncidentRows(responderId) {
    return db.prepare(`
      SELECT i.*, r.unit_name AS assigned_responder_name
      FROM incidents i LEFT JOIN responders r ON r.id = i.assigned_responder_id
      WHERE i.assigned_responder_id = ?
      ORDER BY i.created_at DESC, i.id DESC
    `).all(responderId);
  }

  function allIncidentRows() {
    return db.prepare(`
      SELECT i.*, r.unit_name AS assigned_responder_name
      FROM incidents i LEFT JOIN responders r ON r.id = i.assigned_responder_id
      ORDER BY i.created_at DESC, i.id DESC
    `).all();
  }

  async function handleApi(req, res, url) {
    if (req.method === "OPTIONS") {
      sendJson(req, res, 204);
      return;
    }
    const body = ["GET", "HEAD"].includes(req.method) ? {} : await readJson(req);
    const route = url.pathname;
    let match;

    if (req.method === "POST" && route === "/api/auth/responders/register") {
      const fullName = requiredText(body.fullName, "Full name", 160);
      const phone = normalizePhone(body.phone);
      const password = requiredText(body.password, "Password", 100);
      if (password.length < 8) fail(400, "Password must contain at least 8 characters.");
      const unitType = requiredText(body.unitType, "Unit type", 80);
      if (db.prepare("SELECT id FROM responders WHERE phone = ?").get(phone)) {
        fail(409, "That mobile number is already registered.");
      }
      const result = db.prepare(`
        INSERT INTO responders
          (full_name, phone, password_hash, unit_type, unit_name, base_station, approval_status, availability, phone_verified, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'PENDING', 'OFF_DUTY', 0, ?)
      `).run(fullName, phone, hashPassword(password), unitType,
        cleanText(body.unitName), cleanText(body.baseStation), new Date().toISOString());
      const challenge = createChallenge("RESPONDER_VERIFY", Number(result.lastInsertRowid), phone);
      sendJson(req, res, 201, challenge);
      return;
    }

    if (req.method === "POST" && route === "/api/auth/responders/verify") {
      const id = requiredText(body.challengeId, "Challenge ID", 64);
      const code = requiredText(body.code, "Code", 4);
      if (!/^\d{4}$/.test(code)) fail(400, "Enter the 4-digit verification code.");
      const challenge = verifyChallenge(id, code, "RESPONDER_VERIFY");
      const responder = db.prepare("SELECT * FROM responders WHERE id = ?").get(challenge.subject_id);
      if (!responder) fail(404, "Responder account not found.");
      db.prepare("UPDATE responders SET phone_verified = 1 WHERE id = ?").run(responder.id);
      sendJson(req, res, 200, {
        token: createSession("RESPONDER", responder.id),
        responder: responderView({ ...responder, phone_verified: 1 })
      });
      return;
    }

    if (req.method === "POST" && route === "/api/auth/responders/login") {
      const phone = normalizePhone(body.phone);
      const responder = db.prepare("SELECT * FROM responders WHERE phone = ? AND active = 1").get(phone);
      if (!responder || !passwordMatches(String(body.password || ""), responder.password_hash)) {
        fail(401, "Invalid mobile number or password.");
      }
      if (!responder.phone_verified) fail(403, "Verify your mobile number before signing in.");
      if (responder.approval_status !== "APPROVED") fail(403, "Your responder account has not been approved.");
      sendJson(req, res, 200, {
        token: createSession("RESPONDER", responder.id),
        responder: responderView(responder)
      });
      return;
    }

    if (req.method === "POST" && route === "/api/auth/responders/password-reset/request") {
      const phone = normalizePhone(body.phone);
      const responder = db.prepare("SELECT * FROM responders WHERE phone = ? AND active = 1").get(phone);
      const challenge = createChallenge("PASSWORD_RESET",
        responder && responder.phone_verified ? responder.id : null,
        responder && responder.phone_verified ? phone : null);
      sendJson(req, res, 200, challenge);
      return;
    }

    if (req.method === "POST" && route === "/api/auth/responders/password-reset/verify") {
      const code = requiredText(body.code, "Code", 4);
      if (!/^\d{4}$/.test(code)) fail(400, "Enter the 4-digit verification code.");
      const challenge = verifyChallenge(
        requiredText(body.challengeId, "Challenge ID", 64), code, "PASSWORD_RESET");
      if (!challenge.subject_id) fail(400, "The code is invalid or expired.");
      sendJson(req, res, 200, {
        resetToken: createSession("PASSWORD_RESET", challenge.subject_id, 0.25)
      });
      return;
    }

    if (req.method === "POST" && route === "/api/auth/responders/password-reset/complete") {
      const resetToken = requiredText(body.resetToken, "Reset token", 256);
      const password = requiredText(body.newPassword, "New password", 100);
      if (password.length < 8) fail(400, "Password must contain at least 8 characters.");
      const session = db.prepare(`
        SELECT subject_id FROM auth_sessions
        WHERE token_hash = ? AND role = 'PASSWORD_RESET' AND revoked_at IS NULL AND expires_at > ?
      `).get(tokenHash(resetToken), new Date().toISOString());
      if (!session) fail(401, "Password reset session is invalid or expired.");
      db.prepare("UPDATE responders SET password_hash = ? WHERE id = ?")
        .run(hashPassword(password), session.subject_id);
      db.prepare("UPDATE auth_sessions SET revoked_at = ? WHERE role = 'PASSWORD_RESET' AND subject_id = ?")
        .run(new Date().toISOString(), session.subject_id);
      sendJson(req, res, 204);
      return;
    }

    if (req.method === "POST" && route === "/api/admin/auth/login") {
      const email = requiredText(body.email, "Email", 255).toLowerCase();
      const admin = db.prepare("SELECT * FROM admins WHERE email = ? AND active = 1").get(email);
      if (!admin || !passwordMatches(String(body.password || ""), admin.password_hash)) {
        fail(401, "Invalid email or password.");
      }
      sendJson(req, res, 200, createChallenge("ADMIN_LOGIN", admin.id, admin.phone));
      return;
    }

    if (req.method === "POST" && route === "/api/admin/auth/verify") {
      const code = requiredText(body.code, "Code", 6);
      if (!/^\d{6}$/.test(code)) fail(400, "Enter the 6-digit verification code.");
      const challenge = verifyChallenge(
        requiredText(body.challengeId, "Challenge ID", 64), code, "ADMIN_LOGIN");
      const admin = db.prepare("SELECT * FROM admins WHERE id = ? AND active = 1").get(challenge.subject_id);
      if (!admin) fail(401, "Admin account is unavailable.");
      sendJson(req, res, 200, {
        token: createSession("ADMIN", admin.id),
        admin: {
          id: admin.id,
          email: admin.email,
          fullName: admin.full_name,
          phoneSuffix: phoneSuffix(admin.phone)
        }
      });
      return;
    }

    if (req.method === "POST" && route === "/api/admin/auth/resend") {
      const id = requiredText(body.challengeId, "Challenge ID", 64);
      const previous = db.prepare("SELECT * FROM otp_challenges WHERE id = ? AND purpose = 'ADMIN_LOGIN'").get(id);
      if (!previous || Date.parse(previous.expires_at) <= Date.now()) {
        fail(400, "Verification challenge is invalid or expired.");
      }
      if (Date.now() - Date.parse(previous.last_sent_at) < 30000) {
        fail(429, "Please wait before requesting another code.");
      }
      db.prepare("UPDATE otp_challenges SET expires_at = ? WHERE id = ?")
        .run(new Date().toISOString(), id);
      const admin = db.prepare("SELECT * FROM admins WHERE id = ?").get(previous.subject_id);
      sendJson(req, res, 200, createChallenge("ADMIN_LOGIN", admin.id, admin.phone));
      return;
    }

    if (req.method === "GET" && route === "/api/responders") {
      const rows = db.prepare(`
        SELECT * FROM responders
        WHERE active = 1 AND approval_status = 'APPROVED' AND availability != 'OFF_DUTY'
        ORDER BY id
      `).all().filter(row => !url.searchParams.get("type")
        || row.unit_type.toLowerCase() === url.searchParams.get("type").toLowerCase())
        .filter(row => !url.searchParams.get("availability")
          || row.availability === url.searchParams.get("availability").toUpperCase());
      sendJson(req, res, 200, rows.map(row => {
        const view = responderView(row);
        delete view.phone;
        return view;
      }));
      return;
    }

    if (req.method === "POST" && route === "/api/incidents") {
      const clientId = requiredText(body.clientId, "Client ID", 100);
      const category = requiredText(body.category, "Category", 100);
      const description = cleanText(body.description);
      if (description && description.length > 2000) fail(400, "Description must be at most 2000 characters.");
      const priority = String(body.priority || "NORMAL").toUpperCase();
      if (!["NORMAL", "HIGH"].includes(priority)) fail(400, "Priority must be NORMAL or HIGH.");
      const now = new Date().toISOString();
      const result = db.prepare(`
        INSERT INTO incidents (client_id, category, description, priority, status, created_at)
        VALUES (?, ?, ?, ?, 'UNASSIGNED', ?)
      `).run(clientId, category, description, priority, now);
      const incident = db.prepare("SELECT * FROM incidents WHERE id = ?").get(Number(result.lastInsertRowid));
      sendJson(req, res, 201, incidentView(incident));
      return;
    }

    if (req.method === "GET" && (match = /^\/api\/incidents\/by-client\/([^/]+)$/.exec(route))) {
      const rows = db.prepare(`
        SELECT i.*, r.unit_name AS assigned_responder_name FROM incidents i
        LEFT JOIN responders r ON r.id = i.assigned_responder_id
        WHERE i.client_id = ? ORDER BY i.created_at DESC, i.id DESC
      `).all(decodeURIComponent(match[1]));
      sendJson(req, res, 200, rows.map(incidentView));
      return;
    }

    if (req.method === "GET" && (route === "/api/responder/me" || route === "/api/responder/status")) {
      const { subject } = requireResponder(req);
      const view = responderView(subject);
      sendJson(req, res, 200, route.endsWith("/status") ? { responder: view } : view);
      return;
    }

    if (req.method === "GET" && route === "/api/responder/incidents") {
      const { subject } = requireResponder(req, true);
      sendJson(req, res, 200, responderIncidentRows(subject.id).map(incidentView));
      return;
    }

    if (req.method === "PATCH" && route === "/api/responder/availability") {
      const { subject } = requireResponder(req, true);
      const availability = String(body.availability || "").toUpperCase();
      if (!AVAILABILITY.has(availability)) fail(400, "Availability must be AVAILABLE, ON_CALL, BUSY, BREAK, or OFF_DUTY.");
      db.prepare("UPDATE responders SET availability = ? WHERE id = ?").run(availability, subject.id);
      sendJson(req, res, 200, responderView(db.prepare("SELECT * FROM responders WHERE id = ?").get(subject.id)));
      return;
    }

    if (req.method === "PATCH" && (match = /^\/api\/responder\/incidents\/(\d+)\/resolve$/.exec(route))) {
      const { subject } = requireResponder(req, true);
      const incident = db.prepare("SELECT * FROM incidents WHERE id = ?").get(Number(match[1]));
      if (!incident) fail(404, "Incident not found.");
      if (incident.assigned_responder_id !== subject.id) fail(403, "This incident is not assigned to your unit.");
      if (incident.status !== "ASSIGNED") fail(409, "Only assigned incidents can be resolved.");
      const now = new Date().toISOString();
      db.prepare("UPDATE incidents SET status = 'RESOLVED', resolved_at = ? WHERE id = ? AND status = 'ASSIGNED'")
        .run(now, incident.id);
      db.prepare("UPDATE responders SET availability = 'AVAILABLE' WHERE id = ?").run(subject.id);
      sendJson(req, res, 200, incidentView(db.prepare("SELECT * FROM incidents WHERE id = ?").get(incident.id)));
      return;
    }

    if (req.method === "POST" && (route === "/api/responder/logout" || route === "/api/admin/auth/logout")) {
      const role = route.startsWith("/api/admin/") ? "ADMIN" : "RESPONDER";
      const { token } = authenticatedSubject(req, role);
      db.prepare("UPDATE auth_sessions SET revoked_at = ? WHERE token_hash = ?")
        .run(new Date().toISOString(), tokenHash(token));
      sendJson(req, res, 204);
      return;
    }

    if (req.method === "GET" && route === "/api/admin/dashboard") {
      requireAdmin(req);
      const count = (sql) => db.prepare(sql).get().count;
      sendJson(req, res, 200, {
        openIncidents: count("SELECT count(*) AS count FROM incidents WHERE status IN ('UNASSIGNED', 'ASSIGNED')"),
        unassignedIncidents: count("SELECT count(*) AS count FROM incidents WHERE status = 'UNASSIGNED'"),
        availableResponders: count("SELECT count(*) AS count FROM responders WHERE active = 1 AND approval_status = 'APPROVED' AND availability = 'AVAILABLE'"),
        pendingApprovals: count("SELECT count(*) AS count FROM responders WHERE active = 1 AND approval_status = 'PENDING'"),
        totalResponders: count("SELECT count(*) AS count FROM responders WHERE active = 1")
      });
      return;
    }

    if (req.method === "GET" && route === "/api/admin/incidents") {
      requireAdmin(req);
      sendJson(req, res, 200, allIncidentRows().map(incidentView));
      return;
    }

    if (req.method === "GET" && route === "/api/admin/responders") {
      requireAdmin(req);
      sendJson(req, res, 200, db.prepare("SELECT * FROM responders WHERE active = 1 ORDER BY id").all().map(responderView));
      return;
    }

    if (req.method === "GET" && route === "/api/admin/approvals") {
      requireAdmin(req);
      sendJson(req, res, 200, db.prepare(`
        SELECT * FROM responders WHERE active = 1 AND approval_status = 'PENDING' ORDER BY id
      `).all().map(responderView));
      return;
    }

    if (req.method === "PATCH" && (match = /^\/api\/admin\/approvals\/(\d+)$/.exec(route))) {
      const admin = requireAdmin(req);
      const status = String(body.status || "").toUpperCase();
      if (!["APPROVED", "REJECTED"].includes(status)) fail(400, "Approval status must be APPROVED or REJECTED.");
      const responder = db.prepare("SELECT * FROM responders WHERE id = ? AND active = 1").get(Number(match[1]));
      if (!responder) fail(404, "Responder not found.");
      if (responder.approval_status !== "PENDING") fail(409, "This application has already been reviewed.");
      db.prepare("UPDATE responders SET approval_status = ? WHERE id = ?").run(status, responder.id);
      db.prepare("INSERT INTO audit_events (admin_id, action, entity_type, entity_id, created_at) VALUES (?, ?, 'RESPONDER', ?, ?)")
        .run(admin.id, `${status}_RESPONDER_APPLICATION`, responder.id, new Date().toISOString());
      sendJson(req, res, 200, responderView(db.prepare("SELECT * FROM responders WHERE id = ?").get(responder.id)));
      return;
    }

    if (req.method === "POST" && route === "/api/admin/responders") {
      const admin = requireAdmin(req);
      const phone = body.phone ? normalizePhone(body.phone) : null;
      if (phone && db.prepare("SELECT id FROM responders WHERE phone = ?").get(phone)) fail(409, "That mobile number is already registered.");
      const result = db.prepare(`
        INSERT INTO responders
          (full_name, phone, unit_type, unit_name, base_station, approval_status, availability, phone_verified, created_at)
        VALUES (?, ?, ?, ?, ?, 'APPROVED', ?, ?, ?)
      `).run(requiredText(body.fullName, "Full name", 160), phone,
        requiredText(body.unitType, "Unit type", 80), cleanText(body.unitName),
        cleanText(body.baseStation), body.availability ? validateAvailability(body.availability) : "OFF_DUTY",
        phone ? 1 : 0, new Date().toISOString());
      const responderId = Number(result.lastInsertRowid);
      db.prepare("INSERT INTO audit_events (admin_id, action, entity_type, entity_id, created_at) VALUES (?, 'CREATE_RESPONDER', 'RESPONDER', ?, ?)")
        .run(admin.id, responderId, new Date().toISOString());
      sendJson(req, res, 201, responderView(db.prepare("SELECT * FROM responders WHERE id = ?").get(responderId)));
      return;
    }

    if (req.method === "POST" && (match = /^\/api\/admin\/incidents\/(\d+)\/assign$/.exec(route))) {
      const admin = requireAdmin(req);
      const incidentId = Number(match[1]);
      const incident = db.prepare("SELECT * FROM incidents WHERE id = ?").get(incidentId);
      if (!incident) fail(404, "Incident not found.");
      if (incident.status !== "UNASSIGNED") fail(409, "Only unassigned incidents can be assigned.");
      let responder;
      if (body.responderId != null) {
        responder = db.prepare(`
          SELECT * FROM responders WHERE id = ? AND active = 1 AND approval_status = 'APPROVED'
        `).get(Number(body.responderId));
        if (!responder) fail(404, "Approved responder not found.");
        if (responder.availability !== "AVAILABLE") fail(409, "That responder is not available.");
      } else {
        responder = db.prepare(`
          SELECT * FROM responders WHERE active = 1 AND approval_status = 'APPROVED' AND availability = 'AVAILABLE'
          ORDER BY id LIMIT 1
        `).get();
        if (!responder) fail(409, "No responders are currently available.");
      }
      const now = new Date().toISOString();
      db.prepare("UPDATE incidents SET status = 'ASSIGNED', assigned_responder_id = ? WHERE id = ?")
        .run(responder.id, incidentId);
      db.prepare("UPDATE responders SET availability = 'BUSY' WHERE id = ?").run(responder.id);
      db.prepare("INSERT INTO audit_events (admin_id, action, entity_type, entity_id, created_at) VALUES (?, 'ASSIGN_INCIDENT', 'INCIDENT', ?, ?)")
        .run(admin.id, incidentId, now);
      const assigned = db.prepare(`
        SELECT i.*, r.unit_name AS assigned_responder_name
        FROM incidents i LEFT JOIN responders r ON r.id = i.assigned_responder_id WHERE i.id = ?
      `).get(incidentId);
      sendJson(req, res, 200, incidentView(assigned));
      return;
    }

    if (req.method === "PATCH" && (match = /^\/api\/admin\/responders\/(\d+)\/availability$/.exec(route))) {
      const admin = requireAdmin(req);
      const availability = validateAvailability(body.availability);
      const responder = db.prepare("SELECT * FROM responders WHERE id = ? AND active = 1").get(Number(match[1]));
      if (!responder) fail(404, "Responder not found.");
      db.prepare("UPDATE responders SET availability = ? WHERE id = ?").run(availability, responder.id);
      db.prepare("INSERT INTO audit_events (admin_id, action, entity_type, entity_id, created_at) VALUES (?, 'UPDATE_RESPONDER_AVAILABILITY', 'RESPONDER', ?, ?)")
        .run(admin.id, responder.id, new Date().toISOString());
      sendJson(req, res, 200, responderView(db.prepare("SELECT * FROM responders WHERE id = ?").get(responder.id)));
      return;
    }

    if (req.method === "DELETE" && (match = /^\/api\/admin\/responders\/(\d+)$/.exec(route))) {
      const admin = requireAdmin(req);
      const responderId = Number(match[1]);
      const responder = db.prepare("SELECT id FROM responders WHERE id = ? AND active = 1").get(responderId);
      if (!responder) fail(404, "Responder not found.");
      db.prepare("UPDATE responders SET active = 0, availability = 'OFF_DUTY' WHERE id = ?").run(responderId);
      db.prepare("UPDATE auth_sessions SET revoked_at = ? WHERE role = 'RESPONDER' AND subject_id = ? AND revoked_at IS NULL")
        .run(new Date().toISOString(), responderId);
      db.prepare("INSERT INTO audit_events (admin_id, action, entity_type, entity_id, created_at) VALUES (?, 'DEACTIVATE_RESPONDER', 'RESPONDER', ?, ?)")
        .run(admin.id, responderId, new Date().toISOString());
      sendJson(req, res, 204);
      return;
    }

    fail(404, "API route not found.");
  }

  function validateAvailability(value) {
    const availability = String(value || "").toUpperCase();
    if (!AVAILABILITY.has(availability)) {
      fail(400, "Availability must be AVAILABLE, ON_CALL, BUSY, BREAK, or OFF_DUTY.");
    }
    return availability;
  }

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || "127.0.0.1:8080"}`);
    if (url.pathname.startsWith("/api/")) {
      try {
        await handleApi(req, res, url);
      } catch (error) {
        if (error instanceof ApiError) {
          sendJson(req, res, error.status, { message: error.message });
          return;
        }
        log(`API error: ${error.stack || error.message}`);
        if (!res.headersSent) sendJson(req, res, 500, { message: "An unexpected server error occurred." });
      }
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      res.writeHead(400);
      res.end("Invalid URL");
      return;
    }
    if (pathname === "/") pathname = "/index.html";
    const filePath = path.resolve(ROOT, `.${pathname}`);
    if (!filePath.startsWith(`${ROOT}${path.sep}`)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(error.code === "ENOENT" ? 404 : 500);
        res.end(error.code === "ENOENT" ? "Not found" : "Server error");
        return;
      }
      res.writeHead(200, {
        "Content-Type": MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream"
      });
      res.end(content);
    });
  });

  return { server, db };
}

if (require.main === module) {
  const { server } = createBackend();
  const host = process.env.HOST || "127.0.0.1";
  const port = Number(process.env.PORT || 8080);
  server.listen(port, host, () => {
    console.log(`Cebu Emergency Finder running at http://${host}:${port}`);
    if (!process.env.BOOTSTRAP_ADMIN_EMAIL || !process.env.BOOTSTRAP_ADMIN_PASSWORD) {
      console.warn("No admin bootstrap credentials configured; set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD to enable admin sign-in.");
    }
  });
}

module.exports = { createBackend };
