# Community Guardian

AI-powered community safety digest. Filters noise from real local
alerts using Groq AI — with a rule-based fallback that works offline.

Built for the Palo Alto Networks IT Case challenge.

---

## Quick start

### Mac / Linux

```bash
git clone https://github.com/ishitagod/community-guardian.git
cd community-guardian-project
make setup
make run
```

### Windows

```bash
git clone https://github.com/ishitagod/community-guardian-project.git
cd community-guardian-project
.\start.bat
```

Both commands handle everything — venv, pip install, npm install,
and launching both servers. They will take some time the first time they are run.

---

## Groq API key

The setup script will prompt you for your key during installation —
paste it in cmd line when prompted. Get a free key at **console.groq.com**
in under a minute.

To add or update your key after setup, open `.env` in the project
root and set:

    GROQ_API_KEY=your_groq_api_key_here

A rule-based fallback classifier runs automatically if the API is
unavailable or you don't set one, so the app never fully breaks.

---

## Once running

| URL                          | What                      |
| ---------------------------- | ------------------------- |
| http://localhost:5173        | Main app                  |
| http://localhost:8000/docs   | API explorer (Swagger UI) |
| http://localhost:8000/health | Backend health check      |

---

## Run tests

```bash
# Mac/Linux
make test

# Windows
cd backend
venv\Scripts\activate
cd ..
python -m pytest tests/ -v
```

Expected output — all 5 passing:

```
tests/test_happy_path.py::test_scam_detected_correctly      PASSED
tests/test_happy_path.py::test_verified_incident_detected   PASSED
tests/test_edge_case.py::test_empty_text_does_not_crash     PASSED
tests/test_edge_case.py::test_vague_text_classified_as_noise PASSED
tests/test_edge_case.py::test_very_long_text_does_not_crash PASSED
```

---

## Project structure

```
community-guardian/
├── Makefile              Mac/Linux one-command setup + run
├── start.bat             Windows one-command setup + run
├── .env.example          Copy to .env and add your key
├── backend/
│   ├── main.py
│   ├── routes/
│   ├── services/
│   │   ├── ai_service.py     Groq API call
│   │   └── fallback.py       Rule-based classifier (no deps)
│   ├── models.py
│   ├── database.py
│   └── requirements.txt
├── frontend/
│   └── src/
├── data/
│   └── incidents.json    Synthetic dataset
└── tests/
    ├── test_happy_path.py
    └── test_edge_case.py
```

---

## Tech stack

| Layer       | Choice                | Why                                                |
| ----------- | --------------------- | -------------------------------------------------- |
| Backend     | FastAPI + Python      | Native async, auto Swagger UI, Pydantic validation |
| Database    | SQLite + SQLAlchemy   | File-based, zero setup, ORM abstracts dialect      |
| AI primary  | Groq — Llama 3.3 70b  | Fast inference, free tier, OpenAI-compatible       |
| AI fallback | Rule-based classifier | Pure Python, no dependencies, always works offline |
| Frontend    | React 18 + TypeScript | Type safety, component reuse, Vite for fast dev    |
| State       | Zustand               | Lightweight global state, no Redux boilerplate     |
| Styling     | Tailwind CSS          | Utility-first, no separate CSS files to maintain   |

---

## Design decisions

**Noise-first classification over alert-first**
The core problem this app solves is information overload — people
stop reading safety alerts because most are venting or rumours. Every
report passes through the classifier before it reaches the feed. The
AI decides: is this a real incident with specific details, or is it
noise? That decision drives the entire UI — verified alerts surface
first, noise is filtered out but not deleted so users can still
override the classification manually.

**Dual-path AI with transparent source**
The app never shows an error when the AI is unavailable. `ai_service.py`
tries Groq and silently falls back to `fallback.py` on any failure —
timeout, bad JSON, missing key, or rate limit. Every response includes
a `source` field (`groq_ai` or `fallback`) so the UI shows users
exactly how their alert was classified. This matters for trust: users
should know if a scam alert was caught by an LLM or a keyword rule.

**Neighbourhood-level location only**
Location data is the most sensitive part of this app. The decision
was to never store precise addresses — only neighbourhood and city.
The profile form rejects street-level input at the API boundary, so
no precise location data enters the database at all.

**Staggered alert ingestion on startup**
The backend loads 10 synthetic incidents with a 3-second delay
between each on launch. Bulk-inserting all at once makes the feed
jump from empty to full instantly, which feels jarring. The stagger
makes the app feel live and gives the frontend's polling interval
something meaningful to show during a demo.

---

## Tradeoffs

**FastAPI over Flask**
FastAPI was chosen because the AI classification endpoint is async —
it calls Groq and waits. Flask's synchronous default would block the
server during that wait, queuing concurrent requests behind it.
FastAPI handles the wait without blocking. The auto-generated
`/docs` Swagger UI was a secondary benefit — reviewers can test
every endpoint without touching the frontend.

**SQLite over PostgreSQL**
No database server to install or configure — the file is created
automatically on first run. The tradeoff is poor concurrent write
performance at scale, which is acceptable for a prototype. Switching
to PostgreSQL is one connection string change in `database.py` since
SQLAlchemy abstracts the rest.

**Groq (Llama 3.3 70b) over OpenAI**
Groq's free tier is sufficient for a demo and inference is fast
(under 2 seconds per alert). A fallback rule-based classifier runs when Groq is unavailable —
this is a resilience mechanism, not the primary path. The AI
classification is the core feature of the app.

**Zustand over Redux**
The frontend has one piece of shared global state — the user profile.
Redux is significant overhead for a single store. Zustand provides
the same pattern with a fraction of the boilerplate.

---

## What I'd build next

- WebSocket real-time updates instead of polling every 3 seconds
- Map view of incidents plotted by neighbourhood
- User authentication and private safe circles
- Mobile PWA with push notifications for local alerts
- Rate limiting on the report endpoint to prevent spam

---

## If Makefile / start.bat doesn't work — manual setup

Follow these steps exactly, one by one.

### Step 1 — Clone the repo

```bash
git clone https://github.com/you/community-guardian.git
cd community-guardian
```

### Step 2 — Backend setup

**Mac/Linux:**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Windows:**

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Step 3 — Add your API key

**Mac/Linux:**

```bash
cd ..
cp .env.example .env
```

**Windows:**

```bash
cd ..
copy .env.example .env
```

Then open `.env` in any text editor and set:

```
GROQ_API_KEY=gsk_your_key_here
```

Skip this if you don't have a key — the app still works.

### Step 4 — Start the backend

**Mac/Linux:**

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Windows:**

```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

Leave this terminal open. You should see:

```
INFO: Uvicorn running on http://127.0.0.1:8000
```

### Step 5 — Start the frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

Leave this terminal open too. You should see:

```
Local: http://localhost:5173/
```

### Step 6 — Open the app

Visit **http://localhost:5173** in your browser.

Wait 10–15 seconds — the backend loads 10 sample alerts
automatically on startup with a small delay between each.

### Step 7 — Run tests (optional, third terminal)

**Mac/Linux:**

```bash
cd backend
source venv/bin/activate
cd ..
python -m pytest tests/ -v
```

**Windows:**

```bash
cd backend
venv\Scripts\activate
cd ..
python -m pytest tests/ -v
```

---

## Troubleshooting

**Backend won't start**

- Make sure port 8000 is free
- Check `.env` exists in project root
- Windows: run `start.bat` as Administrator if venv creation fails

**Frontend shows blank page**

- Wait 5 seconds — backend loads 10 alerts on startup with stagger
- Hard refresh: Ctrl+Shift+R

**AI always using fallback**

- Check `.env` has `GROQ_API_KEY=gsk_...` with no spaces around `=`
- Verify key at console.groq.com

**Tests failing**

- Run from project root, not from `tests/` folder
- Make sure venv is activated first
