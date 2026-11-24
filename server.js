const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT || 8080);
const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, "data", "responders.json");

const ADMIN = {
  email: "rosa@cebucity.gov.ph",
  password: "Admin@123456",
  phone: "09171234567",
  name: "Rosa Santos"
};

const JWT_SECRET = process.env.JWT_SECRET || "demo-only-change-this-secret";
const otpChallenges = new Map();
const adminChallenges = new Map();
const responderSessions = new Map();
const adminSessions = new Map();

fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "[]");
}

function readResponders() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeResponders(responders) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(responders, null, 2));
}

function signToken(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

function verifyToken(token) {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = crypto.createHmac("sha256", JWT_SECRET).update(encoded).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function sendJson(res, status, value) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(value));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 10000) {
        reject(new Error("Request body is too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

function responderFromRequest(req) {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const payload = verifyToken(token);
  if (!payload || !responderSessions.has(token)) return null;
  return readResponders().find(responder => responder.phone === payload.phone) || null;
}

function adminFromRequest(req) {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const payload = verifyToken(token);
  if (!payload || !adminSessions.has(token)) return null;
  return payload;
}

async function handleApi(req, res, url) {
  const method = req.method;
  let body = {};
  if (method !== "GET" && method !== "HEAD") body = await readJson(req);

  if (method === "POST" && url.pathname === "/api/responder/send-otp") {
    const phone = String(body.phone || "").replace(/\D/g, "");
    if (!/^[0-9]{10}$/.test(phone)) return sendJson(res, 400, { message: "Please enter a valid 10-digit mobile number." });

    const responders = readResponders();
    let responder = responders.find(item => item.phone === phone);
    if (!responder) {
      responder = {
        phone,
        name: "Responder",
        unit: "Unassigned unit",
        station: "Unassigned station",
        status: "pending",
        verified: false,
        availability: "off-duty",
        createdAt: new Date().toISOString()
      };
      responders.push(responder);
      writeResponders(responders);
    }

    const challengeId = crypto.randomBytes(16).toString("hex");
    otpChallenges.set(challengeId, { phone, code: "1234", expiresAt: Date.now() + 10 * 60 * 1000 });
    return sendJson(res, 200, { challengeId, demoOtp: "1234" });
  }

  if (method === "POST" && url.pathname === "/api/responder/verify-otp") {
    const challenge = otpChallenges.get(String(body.challengeId || ""));
    if (!challenge || challenge.expiresAt < Date.now()) {
      return sendJson(res, 400, { message: "The verification code expired. Request a new code." });
    }
    if (String(body.code || "") !== challenge.code) {
      return sendJson(res, 400, { message: "That code is incorrect." });
    }

    const responders = readResponders();
    const responder = responders.find(item => item.phone === challenge.phone);
    if (!responder) return sendJson(res, 404, { message: "Responder account not found." });
    responder.verified = true;
    writeResponders(responders);
    otpChallenges.delete(String(body.challengeId));

    const token = signToken({ role: "responder", phone: responder.phone });
    responderSessions.set(token, Date.now());
    return sendJson(res, 200, { token, responder });
  }

  if (method === "GET" && url.pathname === "/api/responder/status") {
    const responder = responderFromRequest(req);
    if (!responder) return sendJson(res, 401, { message: "Please sign in first." });
    return sendJson(res, 200, { responder });
  }

  if (method === "POST" && url.pathname === "/api/responder/availability") {
    const responder = responderFromRequest(req);
    if (!responder) return sendJson(res, 401, { message: "Please sign in first." });
    if (responder.status !== "approved") return sendJson(res, 403, { message: "Your account is not approved." });

    const allowed = ["available", "busy", "break", "off-duty"];
    if (!allowed.includes(body.availability)) return sendJson(res, 400, { message: "Invalid availability." });
    const responders = readResponders();
    const stored = responders.find(item => item.phone === responder.phone);
    stored.availability = body.availability;
    writeResponders(responders);
    return sendJson(res, 200, { responder: stored });
  }

  if (method === "POST" && url.pathname === "/api/admin/auth/login") {
    if (String(body.email || "").toLowerCase() !== ADMIN.email || String(body.password || "") !== ADMIN.password) {
      return sendJson(res, 401, { message: "Incorrect email or password." });
    }
    const challengeId = crypto.randomBytes(16).toString("hex");
    adminChallenges.set(challengeId, { code: "123456", expiresAt: Date.now() + 10 * 60 * 1000 });
    return sendJson(res, 200, {
      challengeId,
      demoOtp: "123456",
      maskedPhone: "+63 ••• ••• 4567"
    });
  }

  if (method === "POST" && url.pathname === "/api/admin/auth/verify") {
    const challenge = adminChallenges.get(String(body.challengeId || ""));
    if (!challenge || challenge.expiresAt < Date.now()) {
      return sendJson(res, 400, { message: "The verification code expired." });
    }
    if (String(body.code || "") !== challenge.code) {
      return sendJson(res, 400, { message: "That code is incorrect." });
    }
    adminChallenges.delete(String(body.challengeId));
    const token = signToken({ role: "admin", email: ADMIN.email });
    adminSessions.set(token, Date.now());
    return sendJson(res, 200, { token, admin: { name: ADMIN.name, email: ADMIN.email } });
  }

  if (method === "POST" && url.pathname === "/api/admin/auth/resend") {
    const challengeId = String(body.challengeId || "");
    if (!adminChallenges.has(challengeId)) return sendJson(res, 400, { message: "Your sign-in session expired." });
    adminChallenges.delete(challengeId);
    const nextId = crypto.randomBytes(16).toString("hex");
    adminChallenges.set(nextId, { code: "123456", expiresAt: Date.now() + 10 * 60 * 1000 });
    return sendJson(res, 200, { challengeId: nextId, demoOtp: "123456", maskedPhone: "+63 ••• ••• 4567" });
  }

  if (method === "GET" && url.pathname === "/api/admin/responders") {
    if (!adminFromRequest(req)) return sendJson(res, 401, { message: "Admin authorization required." });
    return sendJson(res, 200, { responders: readResponders() });
  }

  const approvalMatch = url.pathname.match(/^\/api\/admin\/responders\/([0-9]+)\/(approve|reject)$/);
  if (method === "POST" && approvalMatch) {
    if (!adminFromRequest(req)) return sendJson(res, 401, { message: "Admin authorization required." });
    const responders = readResponders();
    const responder = responders.find(item => item.phone === approvalMatch[1]);
    if (!responder) return sendJson(res, 404, { message: "Responder not found." });
    responder.status = approvalMatch[2] === "approve" ? "approved" : "rejected";
    writeResponders(responders);
    return sendJson(res, 200, { responder });
  }

  return sendJson(res, 404, { message: "API route not found." });
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml"
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);
  if (url.pathname.startsWith("/api/")) {
    try {
      await handleApi(req, res, url);
    } catch (error) {
      sendJson(res, 400, { message: error.message || "Bad request." });
    }
    return;
  }

  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";
  const filePath = path.resolve(ROOT, "." + pathname);
  if (!filePath.startsWith(ROOT + path.sep)) {
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
    res.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream" });
    res.end(content);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Cebu Emergency Finder running at http://${HOST}:${PORT}`);
});
