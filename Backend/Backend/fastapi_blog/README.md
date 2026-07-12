# TransitOps Backend (FastAPI)

FastAPI backend that implements the exact contract the TransitOps frontend
expects (`API_CONTRACT.md` in the Frontend package). It replaces the demo
`mock-api.js` with a real database-backed API.

## What it provides

- OAuth2 form login at `POST /api/v1/auth/login` returning
  `{ access_token, token_type, user }` at the top level.
- JWT-protected CRUD for vehicles, drivers, trips, maintenance, fuel logs and
  expenses.
- Trip lifecycle (`dispatch`, `complete`, `cancel`) and maintenance
  `close`, with the same side effects and business rules as the demo
  (vehicle/driver status changes, capacity/licence checks, auto fuel log on
  completion, etc.).
- `GET /api/v1/dashboard`, `GET /api/v1/reports/vehicles`, and `GET/PATCH /api/v1/users`.
- List endpoints accept `skip`, `limit`, `search`, `sort_by`, `sort_dir` and
  field filters, and return `{ "items": [...], "total": n }`.
- CORS enabled for the static frontend server.

## Requirements

- Python 3.11+

## Run

```bash
# from this folder (Backend/fastapi_blog)
python -m venv .venv
# Windows:  .venv\Scripts\activate
# macOS/Linux:  source .venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

On first start the app automatically:

1. creates all tables, and
2. seeds roles, users and the full demo fleet dataset.

Open the interactive docs at `http://localhost:8000/docs`.

## Login credentials (seeded)

| Role              | Email                     | Password    |
| ----------------- | ------------------------- | ----------- |
| Fleet Manager     | fleet@transitops.com      | password123 |
| Dispatcher        | dispatch@transitops.com   | password123 |
| Safety Officer    | safety@transitops.com     | password123 |
| Financial Analyst | finance@transitops.com    | password123 |
| Admin             | admin@transitops.com      | Admin@123   |

The frontend logs in with **fleet@transitops.com / password123**.

## Database

By default the app uses **SQLite** (`transitops.db` is created in this folder),
so it runs with no external database server. To use PostgreSQL instead, edit
`.env`:

```
# DATABASE_URL=sqlite:///./transitops.db
DATABASE_URL=postgresql+psycopg2://postgres:your_password@localhost:5432/transitops_db
```

Then create the `transitops_db` database and start the server; tables and seed
data are created automatically.

To reset the demo data (SQLite), stop the server, delete `transitops.db`, and
start again.

## CORS

Allowed origins are configured in `.env` (`CORS_ORIGINS`), defaulting to the
usual static-server ports:

```
CORS_ORIGINS=http://localhost:5500,http://127.0.0.1:5500,http://localhost:5501,http://127.0.0.1:5501
```

Add your frontend's origin here if you serve it from a different port.

## Connecting the frontend

In the Frontend package, set `assets/js/config.js`:

```js
DEMO_MODE: false,
API_BASE_URL: 'http://localhost:8000/api/v1',
```

Serve the frontend (e.g. `python -m http.server 5500` from the `Frontend`
folder) and open `http://localhost:5500/login.html`.
