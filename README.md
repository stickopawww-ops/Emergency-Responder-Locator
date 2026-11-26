# Cebu Emergency Finder

The repository root contains the static frontend and the Node.js API server. The API listens on `http://localhost:8080` and stores application data in SQLite.

## Requirements

- Node.js 22.13 or newer (uses the built-in `node:sqlite` module; no npm packages are required)
- VS Code Live Server, or another static web server for the frontend

## Start locally

In PowerShell, from the repository root:

```powershell
$env:BOOTSTRAP_ADMIN_EMAIL = "admin@example.gov"
$env:BOOTSTRAP_ADMIN_PASSWORD = "replace-with-a-unique-password-of-at-least-12-characters"
$env:BOOTSTRAP_ADMIN_NAME = "Dispatch Administrator"
$env:BOOTSTRAP_ADMIN_PHONE = "+639171234567"
npm start
```

The server creates `data\emergency-finder.sqlite` and applies `database\schema.sql` automatically. Keep the bootstrap password and optional admin code private. Without `ADMIN_DEV_OTP`, admin codes are generated and printed to the terminal. Responder codes remain random and are printed to the terminal. No SMS is sent. The custom admin code must be six digits and the server refuses to start with it when `NODE_ENV=production`.

`Backend\.env.example` is only for the separate Spring Boot service and is not read by root `npm start`. To bootstrap this Node server with a Gmail address, set `BOOTSTRAP_ADMIN_EMAIL` to that address and choose a password of at least 12 characters in the PowerShell session before running `npm start`. Bootstrap adds the account if that email is not already in the SQLite database; it does not overwrite existing accounts.

To choose a reusable local admin verification code, set it before starting the server:

```powershell
$env:ADMIN_DEV_OTP = Read-Host "Choose a six-digit local admin code"
if ($env:ADMIN_DEV_OTP -notmatch '^\d{6}$') { throw "The code must be exactly six digits." }
npm start
```

Run the frontend separately with Live Server on port 5500 and open `index.html`. The API allows requests from `http://localhost:5500` and `http://127.0.0.1:5500`. The included API client uses the backend at port 8080.

To run the backend on a different port, set `$env:PORT` before `npm start`. To use another database file, set `$env:DB_FILE` to its path. The default database file is ignored by Git.

For the responder flow, create an account, enter the four-digit code shown in the server terminal, then sign in to the Admin page at `Admin/admin-signin.html` and approve the pending responder. Admin verification codes are six digits and are also printed in the terminal. The responder can then sign in and set availability.

To reset an existing admin password without deleting application data, stop the backend and run this command in an interactive PowerShell terminal:

```powershell
npm run admin:reset-password -- admin@example.gov
```

The command prompts for a new password (minimum 12 characters), masks input, and revokes existing admin sessions. If the backend uses a custom `DB_FILE`, set that same path in this PowerShell session before running the reset command.

To change the registered admin phone number, stop the backend and run:

```powershell
npm run admin:update-phone -- admin@example.gov
```

Enter and confirm the new Philippine mobile number when prompted. This updates only the admin record, expires pending admin verification challenges, and revokes admin sessions. Set the same `DB_FILE` value if the backend uses a custom database path.

## API and data

- Responder account, one-time verification challenge, hashed bearer session, and approval data are stored in SQLite.
- Incidents begin with `UNASSIGNED`, transition to `ASSIGNED`, and resolve to `RESOLVED` with `resolved_at` set.
- The schema and indexes are in [`database/schema.sql`](./database/schema.sql).
- `POST /api/incidents` is public. Responder profile, assigned incident history, incident resolution, and availability endpoints require a responder bearer token.
- Admin sign-in uses the configured bootstrap credentials and a terminal one-time code. Admin approval and incident assignment endpoints require the admin bearer token.

Run the focused API integration test with:

```powershell
npm test
```

`npm start` runs the root Node.js service. The separate `Backend\` Spring Boot project is not used by this command.

## Emergency safety

Submitting an incident records a request only; it does not place calls or notify dispatch. Call 911 directly for immediate emergencies.
