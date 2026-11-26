Cebu Emergency Finder

Static HTML, CSS, and JavaScript frontend connected to the companion Spring Boot backend.

Run locally

From the repository root in PowerShell, configure an admin account and start the Maven backend:

```powershell
$env:BOOTSTRAP_ADMIN_ENABLED = "true"
$env:BOOTSTRAP_ADMIN_EMAIL = "admin@example.gov"
$env:BOOTSTRAP_ADMIN_PASSWORD = "Choose-a-unique-password-123!"
$env:BOOTSTRAP_ADMIN_NAME = "Dispatch Administrator"
$env:BOOTSTRAP_ADMIN_PHONE = "+639171234567"
npm run start:maven
```

Choose your own unique bootstrap password and do not commit credentials. In VS Code, serve this repository using Live Server on port 5500 and open `index.html`. The Live Incidents and History pages use the same Maven API on port 8080. Do not run `npm start` at the same time; that starts the Node backend on the same port.

Development OTP codes appear in the backend terminal. Responder accounts remain pending until approved by an administrator through the Admin Approval page.

Backend connection

The frontend communicates with the Spring Boot backend at http://localhost:8080, configured in api-client.js.

The backend handles responder registration, authentication, OTP verification, password reset, admin approvals, responder management, incident records, and dashboard operations using persisted database records.

Integration boundary

The API does not automatically place phone calls or notify emergency services. External dispatch integration, production SMS credentials, and a verified GPS feed are not yet configured.

Direct tel:911 remains the immediate emergency-call path.
