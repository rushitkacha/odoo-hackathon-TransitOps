# TransitOps Frontend

This package is intentionally configured to run **without the FastAPI backend**.

## Run now

From the `Frontend` folder:

```powershell
python -m http.server 5500
```

Open `http://localhost:5500/login.html`.

Demo credentials:

- Email: `fleet@transitops.com`
- Password: `password123`

Do not open the HTML through `file:///...`; use the local HTTP server.

## Current mode

`assets/js/config.js` contains:

```js
DEMO_MODE: true
```

In demo mode, all records are stored in browser `localStorage`. CRUD, trip status transitions, maintenance status transitions, dashboard calculations and reports work without a backend.

## Connect FastAPI later

1. Set `DEMO_MODE: false`.
2. Keep the API base URL as `http://localhost:8000/api/v1` or update it.
3. Implement the endpoint contract in `API_CONTRACT.md`.
4. Enable FastAPI CORS for `http://localhost:5500` and `http://127.0.0.1:5500`.

The frontend already sends IDs, ISO dates and the agreed status strings.
