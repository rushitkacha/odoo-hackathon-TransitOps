# TransitOps — Fleet & Transport Operations Management

TransitOps is a full-stack fleet management system for managing vehicles,
drivers, trips, maintenance, fuel logs, expenses, and operational reporting.
It has a **FastAPI** backend (JWT auth, SQLAlchemy, auto-seeded demo data) and
a dependency-free **static HTML/CSS/JS** frontend that talks to the backend over
a documented REST contract.

Built for the Odoo Hackathon.

---

## Tech stack

**Backend:** Python, FastAPI, SQLAlchemy 2, Pydantic v2, JWT (python-jose),
passlib/bcrypt. SQLite by default (no DB server required); PostgreSQL optional.

**Frontend:** Vanilla HTML, CSS, and JavaScript (no build step). A small router,
an API client, and per-page modules under `assets/`.

---

## Repository structure

> Note: the `Backend` and `Frontend` folders are each nested one level deep
> (a `Backend/Backend` and `Frontend/Frontend` layout). This is harmless — it
> only means the runnable code sits one folder deeper. The paths below account
> for it.

```
odoo-hackathon-TransitOps/
├── README.md                      ← this file
├── Backend/
│   └── Backend/
│       └── fastapi_blog/          ← run the API from HERE
│           ├── main.py            ← FastAPI entry point (uvicorn main:app)
│           ├── requirements.txt
│           ├── .env               ← DB URL, secret key, CORS origins
│           ├── README.md          ← backend-specific docs
│           ├── transitops.db      ← SQLite DB (auto-created on first run)
│           └── app/
│               ├── api/v1/        ← auth, vehicles, drivers, trips,
│               │                    maintenance, fuel, expenses,
│               │                    dashboard, reports, users
│               ├── models/        ← SQLAlchemy models
│               ├── schemas/       ← Pydantic request schemas
│               ├── services/      ← auth service
│               ├── core/          ← config, security, dependencies
│               ├── utils/         ← serializers, query, helpers
│               └── seed/          ← demo data seeding
└── Frontend/
    └── Frontend/                  ← serve the site from HERE
        ├── login.html
        ├── app.html
        ├── API_CONTRACT.md        ← the frontend ↔ backend contract
        ├── CONNECTION_GUIDE.md
        ├── README_FRONTEND.md
        └── assets/
            ├── css/
            ├── js/                ← config.js, api.js, auth.js, router.js …
            ├── components/
            └── pages/
```

---

## Prerequisites

- Python 3.10+
- A modern web browser

---

## Getting started

The app runs in two parts: start the **backend** first, then serve the
**frontend**. Keep both running at the same time (two terminals).

### 1. Backend (FastAPI) — port 8000

From the repository root:

```powershell
cd Backend\Backend\fastapi_blog
pip install -r requirements.txt
uvicorn main:app --reload
```

On first run the app automatically creates all tables and seeds the demo data,
then prints:

```
🚀 Starting TransitOps...
Database seeded successfully.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

Verify it's up:

- API root: <http://127.0.0.1:8000/>
- Interactive docs (Swagger): <http://127.0.0.1:8000/docs>

> Run `uvicorn main:app --reload` from inside `fastapi_blog` (the folder that
> contains `main.py`). Running it from a parent folder gives
> `Could not import module "main"`.

### 2. Frontend (static site) — port 5500

Open a **second terminal** (leave the backend running). From the repository
root:

```powershell
cd Frontend\Frontend
python -m http.server 5500
```

Then open:

```
http://localhost:5500/login.html
```

> Serve over HTTP as shown — do not open the HTML via `file:///…`, or the
> browser will block the API calls.

### 3. Log in

| Role              | Email                    | Password    |
| ----------------- | ------------------------ | ----------- |
| Fleet Manager     | fleet@transitops.com     | password123 |
| Dispatcher        | dispatch@transitops.com  | password123 |
| Safety Officer    | safety@transitops.com    | password123 |
| Financial Analyst | finance@transitops.com   | password123 |
| Admin             | admin@transitops.com     | Admin@123   |

The frontend logs in as **fleet@transitops.com / password123**.

---

## How the two parts connect

The frontend is preconfigured for live mode in `assets/js/config.js`:

```js
DEMO_MODE: false,                               // use the real backend
API_BASE_URL: 'http://localhost:8000/api/v1',   // FastAPI base URL
```

- Login uses the OAuth2 form contract (`username` = email, `password`) and the
  backend returns `{ access_token, token_type, user }`.
- Every subsequent request sends the JWT as a `Bearer` token.
- List endpoints return `{ items, total }`; statuses and field names follow
  `API_CONTRACT.md`.
- The backend enables CORS for the static server (`http://localhost:5500` /
  `http://127.0.0.1:5500`), configured via `CORS_ORIGINS` in `.env`.

Set `DEMO_MODE: true` to run the frontend fully offline (data stored in the
browser via `localStorage`, no backend needed).

---

## API overview

Base URL: `http://localhost:8000/api/v1`

- `POST /auth/login`, `POST /auth/register`, `GET /auth/me`
- `GET/POST /vehicles`, `GET/PATCH/DELETE /vehicles/{id}`, `GET /vehicles/available`
- `GET/POST /drivers`, `GET/PATCH/DELETE /drivers/{id}`, `GET /drivers/available`
- `GET/POST /trips`, `POST /trips/{id}/dispatch|complete|cancel`
- `GET/POST /maintenance`, `POST /maintenance/{id}/close`
- `GET/POST /fuel-logs`, `PATCH/DELETE /fuel-logs/{id}`
- `GET/POST /expenses`, `PATCH/DELETE /expenses/{id}`
- `GET /dashboard`
- `GET /reports/vehicles`
- `GET /users`, `PATCH /users/{id}`

The full field-level contract is in `Frontend/Frontend/API_CONTRACT.md`, and
the complete, browsable spec is at `/docs` while the server runs.

---

## Database

By default the backend uses **SQLite** (`transitops.db`, created automatically).
To use **PostgreSQL**, edit `Backend/Backend/fastapi_blog/.env`:

```
# DATABASE_URL=sqlite:///./transitops.db
DATABASE_URL=postgresql+psycopg2://postgres:your_password@localhost:5432/transitops_db
```

Create the `transitops_db` database, then start the server — tables and seed
data are created on startup.

**Reset the demo data (SQLite):** stop the server, delete `transitops.db`, and
start again.

---

## Troubleshooting

- **`Could not import module "main"`** — you're in the wrong folder. `cd` into
  `Backend\Backend\fastapi_blog` (the one containing `main.py`) before running
  uvicorn.
- **`ModuleNotFoundError` (e.g. openpyxl / jose / passlib)** — dependencies
  aren't installed. Run `pip install -r requirements.txt` in the backend folder.
- **Login fails / "Unable to reach FastAPI"** — the backend isn't running, or
  it's on a different port. Confirm <http://127.0.0.1:8000/docs> loads.
- **CORS error in the browser console** — add your frontend's origin to
  `CORS_ORIGINS` in `.env` and restart the backend.
- **`GET /favicon.ico 404`** — harmless; the browser just requests an icon that
  doesn't exist.
- **Stale session after switching demo/live mode** — log out (top-right) once
  to clear the old token, then log in again.

---

## Optional: flatten the nested folders

The `Backend/Backend` and `Frontend/Frontend` nesting works fine as-is. If you
prefer a cleaner layout, move the inner folders up one level so the structure
becomes `Backend/fastapi_blog/…` and `Frontend/…`, then drop the extra `Backend`
inside the outer `Frontend` accordingly, and update the `cd` paths above by
removing one `Backend` / `Frontend` segment.
