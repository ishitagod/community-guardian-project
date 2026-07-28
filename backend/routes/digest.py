"""Daily digest endpoint — Groq summarises top verified alerts for a user's location."""

import os
import logging
from datetime import datetime, timedelta

import httpx
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db
from models import Alert, UserProfile

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/digest", tags=["digest"])

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"


@router.get("")
async def daily_digest(
    profile_id: int = Query(None, description="Personalise digest to this profile"),
    db: Session = Depends(get_db),
):
    """
    Return a 2–3 sentence plain-English digest of today's top verified alerts.
    Personalised to the profile's city and concerns when profile_id is provided.
    """
    since = datetime.utcnow() - timedelta(hours=24)
    query = (
        db.query(Alert)
        .filter(Alert.dismissed == False, Alert.classification == "verified", Alert.created_at >= since)
        .order_by(desc(Alert.ai_confidence))
        .limit(8)
    )
    alerts = query.all()

    # Fall back to most recent verified alerts regardless of date if today has none
    if not alerts:
        alerts = (
            db.query(Alert)
            .filter(Alert.dismissed == False, Alert.classification == "verified")
            .order_by(desc(Alert.created_at))
            .limit(8)
            .all()
        )

    location_context = ""
    concerns_context = ""
    if profile_id:
        profile = db.query(UserProfile).filter(UserProfile.id == profile_id).first()
        if profile:
            if profile.city:
                location_context = f"The user is based in {profile.city}, India."
            if profile.concerns:
                concerns_context = f"They are particularly concerned about: {profile.concerns}."

    if not alerts:
        return {"digest": "No verified alerts found yet. Check back later.", "alert_count": 0}

    bullets = "\n".join(
        f"- {a.title}: {a.action_summary or a.description[:120]}"
        for a in alerts
    )

    prompt = f"""You are a community safety assistant. Write a concise 2-3 sentence digest of the safety alerts below for a community member in India.
{location_context} {concerns_context}
Be direct and helpful. Mention specific threats and what people should do. No fluff.

Alerts:
{bullets}

Digest:"""

    if not GROQ_API_KEY:
        # Fallback: simple join without LLM
        digest = f"Today's top safety alerts: " + " | ".join(a.title for a in alerts[:3]) + "."
        return {"digest": digest, "alert_count": len(alerts), "method": "fallback"}

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": GROQ_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 150,
                    "temperature": 0.4,
                },
            )
            resp.raise_for_status()
            digest = resp.json()["choices"][0]["message"]["content"].strip()
    except Exception as e:
        logger.warning("Digest Groq call failed: %s", e)
        digest = "Top alerts today: " + " | ".join(a.title for a in alerts[:3]) + "."
        return {"digest": digest, "alert_count": len(alerts), "method": "fallback"}

    return {"digest": digest, "alert_count": len(alerts), "method": "groq_ai"}
