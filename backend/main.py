import os
import sys
import random
from pathlib import Path

# Add backend directory to path for imports
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import Base, engine, get_db
import models
from routes.alerts import router as alerts_router
from routes.ingest import router as ingest_router
from routes.profiles import router as profiles_router
from services.news_ingestion import get_incidents
from services.ai_service import classify_alert_with_ai
import asyncio

# Load environment variables from project root (.env file is one level up from backend)
project_root = backend_dir.parent
env_file = project_root / ".env"
load_dotenv(dotenv_path=env_file)

# Create tables (now that models are imported)
Base.metadata.create_all(bind=engine)

# Create FastAPI app with documentation
app = FastAPI(
    title="Community Safety & Digital Wellness API",
    description="AI-powered alert aggregation with noise filtering and security checklists",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(alerts_router)
app.include_router(ingest_router)
app.include_router(profiles_router)


async def background_ingest():
    """Process incidents in background without blocking startup"""
    await asyncio.sleep(1)  # Small delay to let app fully start
    db = next(get_db())

    try:
        from models import Alert
        alert_count = db.query(Alert).count()

        if alert_count > 0:
            print("Alerts already exist, skipping background ingest")
            db.close()
            return

        incidents = await get_incidents()
        if not incidents:
            print("No incidents found")
            db.close()
            return

        # Select 10 random incidents
        incidents = random.sample(incidents, min(10, len(incidents)))
        print(f"Starting background ingest of {len(incidents)} random incidents...")
        for index, incident in enumerate(incidents):
            # Add delay between processing each alert (5 seconds)
            if index > 0:
                await asyncio.sleep(3)
            raw_text = incident.get("raw_text", "")
            if not raw_text or len(raw_text) < 10:
                continue

            title = raw_text.split('.')[0].strip()
            if len(title) > 100:
                title = title[:97] + "..."
            if len(title) < 5:
                title = raw_text[:100]

            alert_type = incident.get("category", "general")

            location = incident.get("location", "")
            neighborhood = None
            city = None
            if location:
                parts = [p.strip() for p in location.split(",")]
                if len(parts) >= 2:
                    neighborhood = parts[0]
                    city = parts[1]
                elif len(parts) == 1:
                    city = parts[0]

            classification_result = await classify_alert_with_ai(
                title=title,
                description=raw_text,
                alert_type=alert_type
            )

            alert = Alert(
                title=title,
                description=raw_text,
                alert_type=alert_type,
                severity="medium",
                classification=classification_result['classification'],
                ai_confidence=classification_result['confidence'],
                ai_reasoning=classification_result['reasoning'],
                action_summary=classification_result.get('action_summary', ''),
                ai_method=classification_result.get('ai_method', 'Unknown'),
                neighborhood=neighborhood,
                city=city
            )

            db.add(alert)
            db.commit()
            print(f"✓ Added alert: {title}")

    except Exception as e:
        print(f"Background ingest error: {e}")
        db.rollback()
    finally:
        db.close()

@app.on_event("startup")
async def startup_ingest():
    """Start background ingestion without blocking startup"""
    asyncio.create_task(background_ingest())

@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "Community Safety API",
        "version": "1.0.0"
    }

@app.get("/", tags=["Info"])
def root():
    """API information"""
    return {
        "service": "Community Safety & Digital Wellness Platform",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "endpoints": {
            "alerts": "/alerts",
            "health": "/health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
