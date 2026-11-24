Cebu Emergency Finder

Static HTML, CSS, and JavaScript frontend connected to the companion Spring Boot backend.

Run locally
Start the Spring Boot backend as described in the Backend README.
Configure the admin bootstrap account before starting the backend.
In VS Code, serve this repository using Live Server on port 5500.
Open index.html in your browser.

Development OTP codes appear in the backend terminal. Responder accounts remain pending until approved by an administrator through the Admin Approval page.

Backend connection

The frontend communicates with the Spring Boot backend at http://localhost:8080, configured in api-client.js.

The backend handles responder registration, authentication, OTP verification, password reset, admin approvals, responder management, incident records, and dashboard operations using persisted database records.

Integration boundary

The API does not automatically place phone calls or notify emergency services. External dispatch integration, production SMS credentials, and a verified GPS feed are not yet configured.

Direct tel:911 remains the immediate emergency-call path.