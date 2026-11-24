# Cebu Emergency Finder demo

This project is a static HTML, CSS, and vanilla JavaScript prototype. No build step or package installation is required; serve the repository root with any static file server and open `index.html`. ES modules require HTTP serving in browsers that do not allow modules from `file://`.

## Screen organization

- `index.html` is the role-selection screen.
- The citizen, responder, and admin screen documents are under `pages/`, grouped by experience.
- Each document has a matching entry stylesheet under `styles/screens/` and an entry module under `js/screens/`.
- Shared appearance is reused from `style.css` and the experience stylesheets; shared screen rendering, state, and actions live under `js/pages/`, `js/store.js`, and `js/services/`.
- Navigation uses ordinary page URLs, so browser Back/Forward works between screens. Demo state and temporary filter/timer state are retained in browser storage as appropriate.

## Demo access

- Responder verification code: `1234`
- Admin verification code: `123456`
- Admin demo email: `rosa@cebucity.gov.ph`
- Admin demo password: `Admin@123456`
- Responder approval can be demonstrated with the explicit **Simulate admin approval (demo)** action, or from the admin Approvals page.

All dispatch, availability, approvals, and call records are local demo data. There is no live SMS, GPS, dispatch, or verified responder contact number.

## Run locally

To use responder OTP verification, admin approval, and dashboard authorization:

1. From the repository root, run `npm start`.
2. Open `http://127.0.0.1:8080`.
3. Responder demo OTP: `1234`.
4. Admin email: `rosa@cebucity.gov.ph`
5. Admin password: `Admin@123456`
6. Admin demo OTP: `123456`.

For the static-only demo:

Open the repository folder in VS Code, install/use the Live Server extension if needed, then choose **Open with Live Server** on `index.html`. The app uses native JavaScript modules, so it must be served over HTTP rather than opened directly as a `file://` page.

For the MySQL-backed admin authentication backend:

1. Import `server/database.sql` into MySQL.
2. Copy `server/.env.example` to `server/.env` and set the database credentials and a random `JWT_SECRET`.
3. From the repository root, run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:8080/Admin/admin-signin.html`.

## Integration boundary

The UI currently uses the mock adapter in `js/services/mock-service.js`. Replace that adapter with server-backed services for production SMS, secure authentication, dispatch, verified contact numbers, notifications, and GPS. Local role navigation is not authorization, and no demo action sends a real dispatch.

## Reset demo data

In the browser developer console, run `window.resetEmergencyFinderDemo()` to restore the initial demo state. The app stores non-sensitive state under `cebu-emergency-finder-demo-v1` in local storage.
