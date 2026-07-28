# Community Guardian

AI-powered community safety digest. FastAPI backend + React/TypeScript frontend.

## Stack

- **Backend**: FastAPI, SQLite (SQLAlchemy), Python 3.12
- **AI**: Groq (Llama 3.3 70b) with rule-based fallback in `backend/services/fallback.py`
- **Frontend**: React + TypeScript, Vite, Tailwind CSS, Zustand
- **Design system**: DM Sans font, indigo accent (`#4F46E5`), slate-900 sidebar, semantic colors (verified=emerald, noise=red, unreviewed=amber)

## Running locally

```bash
# Backend (from project root)
source backend/venv/bin/activate
cd backend && uvicorn main:app --reload --port 8000

# Frontend
cd frontend && npm run dev
```

Or `make run` to start both.

## Key files

- `backend/services/ai_service.py` — Groq API call + fallback logic
- `backend/services/fallback.py` — rule-based classifier (no deps)
- `backend/main.py` — FastAPI app, lifespan startup ingest
- `frontend/src/components/PageShell.tsx` — sidebar + layout
- `frontend/src/features/alerts/AlertCard.tsx` — main card component
- `frontend/tailwind.config.js` — design tokens

## Design conventions

- Classification stripe on card left edge (not just badges)
- Sidebar: dark (`bg-sidebar` = `#0F172A`), sticky, collapsible, SVG icons only — no emoji anywhere
- Semantic colors separate from accent — don't use indigo for verified/noise/unreviewed states
- All form inputs use `rounded-xl bg-slate-50` style

## Git workflow

Never run `git commit` directly. Stage changes and show a diff, then wait for explicit user approval before committing.

## Tests

Run from project root: `backend/venv/bin/python -m pytest tests/ -v`
New tests go in `tests/`. Backend venv must be Python 3.12 (3.14 breaks pinned httpx/httpcore).
