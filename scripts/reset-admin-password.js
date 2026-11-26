const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");

const email = String(process.argv[2] || "").trim().toLowerCase();
if (!email) {
  console.error("Usage: npm run admin:reset-password -- admin@example.gov");
  process.exit(1);
}

const databasePath = path.resolve(process.env.DB_FILE
  || path.join(__dirname, "..", "data", "emergency-finder.sqlite"));
if (!fs.existsSync(databasePath)) {
  console.error(`Database not found: ${databasePath}`);
  console.error("Set DB_FILE to the database used by the backend, or start the backend first.");
  process.exit(1);
}

function promptHidden(prompt) {
  return new Promise((resolve, reject) => {
    const input = process.stdin;
    const output = process.stdout;
    if (!input.isTTY || typeof input.setRawMode !== "function") {
      reject(new Error("Run this command in an interactive terminal."));
      return;
    }

    let value = "";
    output.write(prompt);
    input.setEncoding("utf8");
    input.setRawMode(true);
    input.resume();

    function finish(error) {
      input.off("data", onData);
      input.setRawMode(false);
      input.pause();
      output.write("\n");
      if (error) reject(error);
      else resolve(value);
    }

    function onData(chunk) {
      for (const character of chunk) {
        if (character === "\u0003") {
          finish(new Error("Password reset cancelled."));
          return;
        }
        if (character === "\r" || character === "\n") {
          finish();
          return;
        }
        if (character === "\u007f" || character === "\b") {
          if (value.length) {
            value = value.slice(0, -1);
            output.write("\b \b");
          }
          continue;
        }
        if (character >= " " && character !== "\u007f") {
          value += character;
          output.write("*");
        }
      }
    }

    input.on("data", onData);
  });
}

async function main() {
  let database;
  try {
    database = new DatabaseSync(databasePath);
    const admin = database.prepare("SELECT id FROM admins WHERE email = ? AND active = 1").get(email);
    if (!admin) throw new Error(`No active admin account found for ${email}.`);

    const password = await promptHidden("New password (minimum 12 characters): ");
    if (password.length < 12) throw new Error("Password must contain at least 12 characters.");
    const confirmation = await promptHidden("Confirm new password: ");
    if (password !== confirmation) throw new Error("Passwords do not match.");

    const salt = crypto.randomBytes(16);
    const hash = crypto.scryptSync(password, salt, 64);
    const passwordHash = `${salt.toString("hex")}:${hash.toString("hex")}`;
    const now = new Date().toISOString();
    database.exec("BEGIN");
    try {
      database.prepare("UPDATE admins SET password_hash = ? WHERE id = ?")
        .run(passwordHash, admin.id);
      database.prepare(`
        UPDATE auth_sessions SET revoked_at = ?
        WHERE role = 'ADMIN' AND subject_id = ? AND revoked_at IS NULL
      `).run(now, admin.id);
      database.exec("COMMIT");
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }

    console.log(`Password reset for ${email}. Other database records were unchanged.`);
  } finally {
    if (database) database.close();
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
