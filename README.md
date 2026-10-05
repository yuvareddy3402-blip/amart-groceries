# Amart — Live multi-device grocery website

This version uses a shared server database instead of browser localStorage.

## Run locally
1. Install Node.js 20+.
2. In this folder run `npm install`.
3. Run `npm start`.
4. Open `http://localhost:3000`.
5. Owner dashboard: `http://localhost:3000/owner.html`

## Deploy
Deploy the folder to a Node.js hosting provider that supports a persistent disk for `amart.db`. Set PORT automatically from the hosting provider.

## Before public launch
- Add authentication/password protection to `/owner.html` and owner API routes.
- Add HTTPS (normally provided by the host).
- Add backups for the database.
- Add your phone number and final delivery rules.
- Replace demo products/prices with your actual inventory.
- For larger scale, move from SQLite to PostgreSQL.

## Payment
Cash on Delivery only.
