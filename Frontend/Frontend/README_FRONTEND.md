# TransitOps Frontend

This package is now configured to run **against the FastAPI backend**
(`DEMO_MODE: false`).

## Run

1. Start the backend first (see the Backend package README):

   ```bash
   # from Backend/fastapi_blog
   pip install -r requirements.txt
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

2. Serve this frontend folder over HTTP:

   ```powershell
   python -m http.server 5500
   ```

   Open `http://localhost:5500/login.html`.
   Do not open the HTML via `file:///...`; use the local HTTP server so the
   browser can call the API.

## Login

- Email: `fleet@transitops.com`
- Password: `password123`

(Other seeded accounts are listed in the Backend README.)

## Configuration

`assets/js/config.js`:

```js
DEMO_MODE: false,                               // use the real backend
API_BASE_URL: 'http://localhost:8000/api/v1',   // FastAPI base URL
```

- Set `DEMO_MODE: true` to go back to the offline `localStorage` demo (no
  backend needed).
- If you serve the frontend from a different port, add that origin to
  `CORS_ORIGINS` in the backend `.env`.

## How it connects

`assets/js/api.js` sends every request to `API_BASE_URL` with the JWT from
login as a `Bearer` token. The backend implements the endpoints, statuses and
field names described in `API_CONTRACT.md`, so no page code changes are needed
to switch between demo and live modes.

## Notes

- Login uses the OAuth2 form contract (`username` = email, `password`); the
  backend returns `{ access_token, token_type, user }`.
- List screens expect `{ items, total }`; the backend returns exactly that.
- If a previous demo session is cached, log out (top-right) once to clear the
  old token, then log in again against the backend.
