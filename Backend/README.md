# Responder Locator backend

Spring Boot backend for the existing HTML/CSS/JavaScript Responder Locator frontend.

## Technology

- Java 25 and Spring Boot 3.5
- MySQL 8.0+
- Spring Data JPA
- Flyway database migrations
- REST API for the existing frontend

## Local database setup (Windows / MySQL Workbench)

1. Install MySQL Server 8.0+ and MySQL Workbench.
2. Open MySQL Workbench and connect to your local MySQL server.
3. Open `Backend/database/create_database.sql`.
4. Run the whole script. It creates the `emergency_responder_locator` database and a local application user named `responder_app`.
5. The sample script uses `CHANGE_THIS_LOCAL_PASSWORD`. Replace it with a strong password in the SQL script before running it, then use the same password in your environment variable `DATABASE_PASSWORD`. Do not commit a real password to GitHub.
6. In IntelliJ IDEA, open the `Backend` folder as a Maven project and wait for Maven dependencies to finish downloading.
7. Set the environment variable `DATABASE_PASSWORD` to the password you created. The default local username is `responder_app`.
8. Run `EmergencyBackendApplication` or use the terminal:

```powershell
cd Backend
$env:DATABASE_PASSWORD = "your-local-database-password"
$env:BOOTSTRAP_ADMIN_ENABLED = "true"
$env:BOOTSTRAP_ADMIN_EMAIL = "admin@example.gov"
$env:BOOTSTRAP_ADMIN_PASSWORD = "use-a-strong-unique-password"
$env:BOOTSTRAP_ADMIN_NAME = "Dispatch Administrator"
$env:BOOTSTRAP_ADMIN_PHONE = "+639171234567"
$env:CORS_ALLOWED_ORIGINS = "http://127.0.0.1:5500,http://localhost:5500"
mvn spring-boot:run
```

The default `dev` profile now uses MySQL (not H2). Flyway runs the initial MySQL schema migration automatically. Hibernate uses `ddl-auto=validate`: it checks that the schema matches the entity mappings and does not silently create or change tables.

## Verify the database

After the backend starts, open MySQL Workbench and run:

```sql
USE emergency_responder_locator;
SHOW TABLES;
SELECT * FROM flyway_schema_history;
```

You should see the application tables and a successful Flyway migration record. If the backend reports an authentication or connection error, check that MySQL Server is running, the database/user exists, and `DATABASE_PASSWORD` matches the password used when creating the user.

## Frontend connection

Keep the existing frontend files. Serve the frontend with VS Code Live Server, usually at port 5500. The frontend should call the backend at `http://localhost:8080`; check its existing API client configuration if a different port is used. Do not open the frontend using `file://`.

## Production configuration

The `prod` profile also uses MySQL. Set `DATABASE_URL`, `DATABASE_USERNAME`, and `DATABASE_PASSWORD` in the hosting environment. Use HTTPS and a database account with only the permissions required by the deployment. Do not commit real credentials.

A Philippine SMS gateway has not yet been selected or integrated. SMS provider credentials and inbound SMS handling will be implemented in the SMS phase. The database now includes a location-report history table that can store GPS coordinates received from responder SMS messages.

## Tests

From the `Backend` folder:

```powershell
mvn test
```

Tests have not yet been run in this remote repository-editing session. Run them locally before merging the implementation branch.

## API reference

See [API.md](API.md).
