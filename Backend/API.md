# API reference

Base URL: `http://localhost:8080`. JSON is used unless noted. Authenticated requests send `Authorization: Bearer <token>`. Protected resources require the matching admin or responder role. Timestamps are ISO-8601 UTC.

## Authentication

### Admin

- `POST /api/admin/auth/login` — body `{ "email": "admin@example.gov", "password": "..." }`; returns `{ "challengeId", "maskedPhone", "expiresInSeconds" }`.
- `POST /api/admin/auth/verify` — body `{ "challengeId": "...", "code": "123456" }`; returns `{ "token", "admin": { "id", "email", "phoneSuffix", "fullName" } }`.
- `POST /api/admin/auth/resend` — body `{ "challengeId": "..." }`; returns a new challenge. Resends are throttled.
- `GET /api/admin/auth/me` — authenticated admin profile.
- `POST /api/admin/auth/logout` — revokes the current admin session; returns `204`.

### Responder

- `POST /api/auth/responders/register` — body `{ "fullName", "phone", "password", "unitType", "unitName", "baseStation" }`; `phone` is required and accepts Philippine mobile format such as `+639916542601` or `09916542601`; creates a pending account and sends a 6-digit verification code; returns `201` and a challenge.
- `POST /api/auth/responders/verify` — body `{ "challengeId", "code" }`; verifies the phone and returns `{ "token", "responder" }`. A pending responder can use this token to check approval status.
- `POST /api/auth/responders/login` — body `{ "phone", "password" }`; `phone` is required and uses the same Philippine mobile-number normalization; only verified and approved responder accounts can sign in.
- `POST /api/auth/responders/password-reset/request` — body `{ "phone" }`; requests a reset code without disclosing whether the account exists.
- `POST /api/auth/responders/password-reset/verify` — body `{ "challengeId", "code" }`; returns a short-lived reset token.
- `POST /api/auth/responders/password-reset/complete` — body `{ "resetToken", "newPassword" }`; updates the password; returns `204`.
- `GET /api/responder/me` — authenticated responder profile and approval/availability status.
- `PATCH /api/responder/availability` — body `{ "availability": "AVAILABLE|BUSY|BREAK|OFF_DUTY" }`.
- `GET /api/responder/incidents` — incident history assigned to the responder.
- `PATCH /api/responder/incidents/{id}/resolve` — resolves an incident assigned to the responder.
- `POST /api/responder/logout` — revokes the current session; returns `204`.

## Responder directory and incidents

- `GET /api/responders?type=Fire&availability=AVAILABLE&latitude=10.3&longitude=123.9` — public directory; all query values are optional. Distance is omitted if coordinates are not available.
- `POST /api/incidents` — records a citizen request. Body: `{ "clientId": "<UUID>", "category": "Police", "description": "...", "requesterPhone": "+639...", "priority": "NORMAL|HIGH", "latitude": 10.3, "longitude": 123.9 }`. `requesterPhone`, `priority`, and coordinates are optional because the current citizen UI does not collect them. Returns `201` with the persisted incident. This records a request only; it does not place calls or notify dispatch.
- `GET /api/incidents/by-client/{clientId}` — history for the browser's unguessable client UUID.

## Admin operations

- `GET /api/admin/dashboard` — counts of active/unassigned incidents, available responders, pending approvals, and total responders.
- `GET /api/admin/incidents` — incident history.
- `POST /api/admin/incidents/{id}/assign` — body `{ "responderId": 123 }`; if omitted/null, assigns the first available unit. Returns `409` if none is available.
- `PATCH /api/admin/incidents/{id}/status` — body `{ "status": "OPEN|ASSIGNED|RESOLVED|CANCELLED" }`.
- `GET /api/admin/responders` — responder accounts/units.
- `POST /api/admin/responders` — adds a responder unit; body `{ "fullName", "phone", "unitType", "unitName", "baseStation", "availability" }`. `phone` is optional for manually managed units (the current admin screen does not collect it).
- `GET /api/admin/approvals` — pending registrations.
- `PATCH /api/admin/approvals/{id}` — body `{ "status": "APPROVED|REJECTED" }`.
- `PATCH /api/admin/responders/{id}/availability` — body `{ "availability": "AVAILABLE|BUSY|BREAK|OFF_DUTY" }`.
- `DELETE /api/admin/responders/{id}` — deactivates the unit; data is retained.

## Errors and security

Errors use `{ "message": "..." }` with an appropriate HTTP status. Requests are validated; OTPs expire after five minutes and allow at most five guesses. Passwords and OTPs are BCrypt-hashed, bearer tokens are random and only their SHA-256 hashes are persisted, and successful logout revokes the session. Important admin actions are recorded in the audit table.

SMS delivery uses the console in `dev` only. Configure Twilio through environment variables to send real SMS. The backend does not include a dispatch notification provider, citizen accounts, live GPS feed, or utility/police/fire third-party integration; incident creation is a durable record, not a guarantee of responder contact.
