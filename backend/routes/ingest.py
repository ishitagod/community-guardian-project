"""Data ingestion endpoints - fetch and classify incidents from various sources"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from database import get_db
from models import Alert
from schemas import AlertResponse
from services.news_ingestion import get_incidents
from services.ai_service import classify_alert_with_ai, generate_checklist
from datetime import datetime

router = APIRouter(prefix="/ingest", tags=["ingestion"])


@router.post("/news", response_model=dict)
async def ingest_news(
    db: Session = Depends(get_db)
):
    """
    Ingest synthetic incidents from local JSON file, classify them, and store in database.

    Returns: Count of ingested incidents
    """

    try:
        # Fetch incidents from synthetic JSON data only
        incidents = await get_incidents()

        if not incidents:
            return {
                "success": True,
                "message": "No incidents found",
                "count": 0
            }

        # Process each incident
        created_count = 0
        for incident in incidents:
            raw_text = incident.get("raw_text", "")
            if not raw_text or len(raw_text) < 10:
                continue

            # Skip if already exists (check by raw_text hash)
            existing = db.query(Alert).filter(
                Alert.description == raw_text
            ).first()

            if existing:
                continue

            # Extract title (first sentence or first 80 chars)
            title = raw_text.split('.')[0].strip()
            if len(title) > 100:
                title = title[:97] + "..."
            if len(title) < 5:
                title = raw_text[:100]

            # Determine alert type from incident category if available, else use general
            alert_type = incident.get("category", "general")

            # Parse location: "Andheri West, Mumbai" -> neighborhood="Andheri West", city="Mumbai"
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

            # Classify using AI (with fallback) - await directly
            classification_result = await classify_alert_with_ai(
                title=title,
                description=raw_text,
                alert_type=alert_type
            )

            # Create alert
            alert = Alert(
                title=title,  # First sentence as title
                description=raw_text,  # Full text as description
                alert_type=alert_type,
                severity="medium",  # Default to medium
                classification=classification_result['classification'],
                ai_confidence=classification_result['confidence'],
                ai_reasoning=classification_result['reasoning'],
                action_summary=classification_result.get('action_summary', ''),
                ai_method=classification_result.get('ai_method', 'fallback'),
                neighborhood=neighborhood,
                city=city
            )

            db.add(alert)
            created_count += 1

        db.commit()

        return {
            "success": True,
            "message": f"Ingested {created_count} incidents from JSON",
            "count": created_count,
            "sources": ["json"]
        }

    except Exception as e:
        db.rollback()
        return {
            "success": False,
            "error": str(e),
            "count": 0
        }


@router.get("/status")
async def ingestion_status():
    """Check ingestion service status"""
    return {
        "status": "ok",
        "services": {
            "json": {
                "enabled": True,
                "status": "ready"
            }
        },
        "incident_count": "Check by ingesting"
    }


