# TransitOps — Frontend ↔ Backend Quick Start

Two parts run together: the FastAPI **Backend** (port 8000) and this static
**Frontend** (port 5500).

## 1. Start the backend

```bash
cd Backend/fastapi_blog
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Tables and demo data are created automatically on first run.
Verify: open http://localhost:8000/docs

## 2. Start the frontend

```bash
cd Frontend
python -m http.server 5500
```

Open http://localhost:5500/login.html and sign in with:

- **fleet@transitops.com / password123**

## Already configured for you

- Frontend `assets/js/config.js` → `DEMO_MODE: false`,
  `API_BASE_URL: http://localhost:8000/api/v1`
- Backend CORS allows `http://localhost:5500` / `http://127.0.0.1:5500`
- Backend login is OAuth2 form and returns `{ access_token, token_type, user }`
- All list endpoints return `{ items, total }`; statuses and field names match
  `API_CONTRACT.md`

## Switch back to offline demo

Set `DEMO_MODE: true` in `assets/js/config.js` (no backend required).
