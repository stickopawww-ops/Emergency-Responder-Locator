# Cebu Emergency Finder backend

Spring Boot 3.5 / Java 25 backend for the static HTML/CSS/JavaScript frontend in the adjacent `Emergency-Responder-Locator` directory.

## Local setup

Requirements: Java 25+ and Maven 3.9+.

From PowerShell:

```powershell
cd C:\Users\catherine.emia\Desktop\Backend
$env:BOOTSTRAP_ADMIN_ENABLED = "true"
$env:BOOTSTRAP_ADMIN_EMAIL = "admin@example.gov"
$env:BOOTSTRAP_ADMIN_PASSWORD = "replace-with-a-unique-12-character-password"
$env:BOOTSTRAP_ADMIN_NAME = "Dispatch Administrator"
$env:BOOTSTRAP_ADMIN_PHONE = "+639171234567"
$env:CORS_ALLOWED_ORIGINS = "http://127.0.0.1:5500,http://localhost:5500"
mvn spring-boot:run
```

The development profile uses a file-backed H2 database (`emergency-db`) and runs schema migrations automatically. Development responder sample records are seeded once into that database. There are no default admin credentials or fixed OTPs. In `dev`, one-time codes are printed to the backend terminal; use a Philippine number format for accounts.

Serve `Emergency-Responder-Locator` with VS Code Live Server on port 5500 and open `index.html`. The frontend calls `http://localhost:8080`; change `baseUrl` in its `api-client.js` when using a different backend address. Do not open the frontend through `file://`.

## Production configuration

Use the `prod` profile with PostgreSQL, a unique bootstrap admin password, HTTPS, and a real SMS provider. Set the required variables from `.env.example` in the hosting environment; Spring does not automatically load `.env` files. Production does not seed sample responders and refuses to use console OTP delivery.

## API reference

See [API.md](API.md) for request/response shapes, authorization, and error responses.

## Tests

```powershell
mvn test
```

Flyway migrations are in `src/main/resources/db/migration`. Application source and the companion frontend are maintained in separate Git repositories.
