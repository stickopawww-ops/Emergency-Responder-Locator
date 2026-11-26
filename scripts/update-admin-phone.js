const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");
const { createInterface } = require("node:readline/promises");

const email = String(process.argv[2] || "").trim().toLowerCase();
if (!email) {
  console.error("Usage: npm run admin:update-phone -- admin@example.gov");
  process.exit(1);
}

function normalizePhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  const national = digits.startsWith("63") ? digits.slice(2) : digits;
  const mobile = national.startsWith("0") ? national.slice(1) : national;
  if (!/^9\d{9}$/.test(mobile)) {
    throw new Error("Enter a valid Philippine mobile number, such as +639171234567.");
  }
  return `+63${mobile}`;
}

async function main() {
  const databasePath = path.resolve(process.env.DB_FILE
    || path.join(__dirname, "..", "data", "emergency-finder.sqlite"));
  const database = new DatabaseSync(databasePath);
  try {
    const admin = database.prepare("SELECT id FROM admins WHERE email = ? AND active = 1").get(email);
    if (!admin) throw new Error(`No active admin account found for ${email}.`);

    let phone;
    if (process.env.ADMIN_NEW_PHONE || process.env.ADMIN_NEW_PHONE_CONFIRM) {
      if (!process.env.ADMIN_NEW_PHONE || !process.env.ADMIN_NEW_PHONE_CONFIRM) {
        throw new Error("Set both ADMIN_NEW_PHONE and ADMIN_NEW_PHONE_CONFIRM.");
      }
      phone = normalizePhone(process.env.ADMIN_NEW_PHONE);
      if (phone !== normalizePhone(process.env.ADMIN_NEW_PHONE_CONFIRM)) {
        throw new Error("Phone numbers do not match.");
      }
    } else {
      const terminal = createInterface({ input: process.stdin, output: process.stdout });
      try {
        phone = normalizePhone(await terminal.question("New admin mobile number: "));
        const confirmation = normalizePhone(await terminal.question("Confirm mobile number: "));
        if (phone !== confirmation) throw new Error("Phone numbers do not match.");
      } finally {
        terminal.close();
      }
    }

    const now = new Date().toISOString();
    database.exec("BEGIN");
    try {
      database.prepare("UPDATE admins SET phone = ? WHERE id = ?").run(phone, admin.id);
      database.prepare(`
        UPDATE auth_sessions SET revoked_at = ?
        WHERE role = 'ADMIN' AND subject_id = ? AND revoked_at IS NULL
      `).run(now, admin.id);
      database.prepare(`
        UPDATE otp_challenges SET expires_at = ?
        WHERE purpose = 'ADMIN_LOGIN' AND subject_id = ?
      `).run(now, admin.id);
      database.exec("COMMIT");
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }

    console.log(`Admin phone updated to +63 ••• ••• ${phone.slice(-4)}. Other database records were unchanged.`);
  } finally {
    database.close();
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
