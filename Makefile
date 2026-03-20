.PHONY: setup run test clean help

# Detect python command — some systems use python3, some python
PYTHON := $(shell command -v python3 2>/dev/null || command -v python 2>/dev/null)

help:
	@echo ""
	@echo "  Community Guardian"
	@echo "  ------------------"
	@echo "  make setup   — install all dependencies"
	@echo "  make run     — start backend + frontend"
	@echo "  make test    — run tests"
	@echo "  make clean   — delete database and node_modules"
	@echo ""

setup:
	@echo ""
	@echo "[1/5] Checking Python..."
	@if [ -z "$(PYTHON)" ]; then \
		echo "  ERROR: Python not found. Install from https://python.org"; \
		exit 1; \
	fi
	@$(PYTHON) --version
	@echo ""

	@echo "[2/5] Checking Node.js..."
	@if ! command -v node > /dev/null 2>&1; then \
		echo "  ERROR: Node.js not found. Install from https://nodejs.org"; \
		exit 1; \
	fi
	@node --version
	@echo ""

	@echo "[3/5] Setting up Python virtual environment..."
	@if [ ! -d "backend/venv" ]; then \
		$(PYTHON) -m venv backend/venv && echo "  Created venv"; \
	else \
		echo "  venv already exists, skipping"; \
	fi
	@echo ""

	@echo "[4/5] Installing Python dependencies..."
	@backend/venv/bin/pip install -q --upgrade pip
	@backend/venv/bin/pip install -q -r backend/requirements.txt
	@echo "  Done"
	@echo ""

	@echo "[5/5] Installing Node dependencies..."
	@cd frontend && npm install --silent
	@echo "  Done"
	@echo ""

	@if [ ! -f ".env" ]; then \
		cp .env.example .env 2>/dev/null || echo "GROQ_API_KEY=your_groq_key_here" > .env; \
		echo "  Created .env file"; \
		echo "  --> Add your GROQ_API_KEY to .env (free at console.groq.com)"; \
		echo "  --> App works without it using fallback rules"; \
	else \
		echo "  .env already exists"; \
	fi
	@echo ""
	@echo "  Setup complete!"
	@echo ""
	@echo "  Next: run 'make run' to start the app"
	@echo ""

run:
	@echo ""
	@if [ ! -d "backend/venv" ]; then \
		echo "  ERROR: Run 'make setup' first"; \
		exit 1; \
	fi
	@echo "  Starting Community Guardian..."
	@echo "  Backend  -> http://localhost:8000"
	@echo "  API docs -> http://localhost:8000/docs"
	@echo "  Frontend -> http://localhost:5173"
	@echo ""
	@echo "  Press Ctrl+C to stop"
	@echo ""
	@trap 'kill 0' INT; \
	cd backend && ../backend/venv/bin/uvicorn main:app --reload --port 8000 & \
	cd frontend && npm run dev & \
	wait

test:
	@echo ""
	@if [ ! -d "backend/venv" ]; then \
		echo "  ERROR: Run 'make setup' first"; \
		exit 1; \
	fi
	@echo "  Running tests..."
	@echo ""
	@backend/venv/bin/python -m pytest tests/ -v
	@echo ""

clean:
	@echo ""
	@echo "  Cleaning up..."
	@rm -f backend/safety_alerts.db && echo "  Deleted database" || true
	@rm -rf frontend/node_modules && echo "  Deleted node_modules" || true
	@rm -rf frontend/dist && echo "  Deleted build output" || true
	@echo "  Done (venv kept — run 'make setup' to reinstall deps)"
	@echo ""
