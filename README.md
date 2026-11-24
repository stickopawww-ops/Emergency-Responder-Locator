# Cebu Emergency Finder

Static HTML, CSS, and JavaScript frontend connected to the companion Spring Boot backend in `C:\Users\catherine.emia\Desktop\Backend`.

## Run locally

1. Start the backend as described in the Backend [README](../Backend/README.md). Configure an admin bootstrap account before starting it.
2. In VS Code, serve this repository with Live Server on port 5500 and open `index.html`.
3. Development OTP codes appear in the backend terminal. Responder accounts remain pending until an admin approves them from the Admin Approval page.

The frontend API base URL is `http://localhost:8080`, configured in [api-client.js](./api-client.js).

## Integration boundary

Responder registration, verification, sign-in, password reset, approvals, responder availability/history, the responder directory, incident creation/logs, and admin dashboard/team operations use persisted backend records. The API does not place phone calls or automatically notify emergency services; no external dispatch, SMS production credentials, or verified GPS feed were provided. Direct `tel:911` remains the immediate emergency-call path.
