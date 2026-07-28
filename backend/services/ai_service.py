"""Three-tier classification pipeline:
  Tier 1 — local sklearn (fast, no API cost, high-confidence cases)
  Tier 2 — Groq LLM (ambiguous cases needing reasoning)
  Tier 3 — rule-based fallback (no network dependency)
"""

import os
import json
import logging
import httpx
from pathlib import Path
from dotenv import load_dotenv
from services.fallback import classify_alert as fallback_classify
from services.local_classifier import get_classifier

logger = logging.getLogger(__name__)

project_root = Path(__file__).parent.parent.parent
load_dotenv(dotenv_path=project_root / ".env", override=True)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

PROMPT_TEMPLATE = """You are a calm community safety assistant. Never use alarming language.
Classify this community report and return ONLY valid JSON with no markdown, no backticks.
Determine if the report is:
- "verified": Contains specific details (dates, times, addresses, incident numbers, official sources)
- "noise": Vague language (maybe, probably, I think, seems, heard) without specifics
- "unreviewed": Unclear or insufficient information

{{
  "classification": "verified" or "noise" or "unreviewed",
  "confidence": 0.0 to 1.0,
  "reasoning": "Internal note explaining why (for moderation team)",
  "action_summary": "1-2 calm, practical sentences for the user"
}}

Report: {text}
Alert type: {alert_type}"""


async def classify_alert_with_ai(title: str, description: str, alert_type: str) -> dict:
    """Three-tier classifier. Returns {classification, confidence, reasoning, action_summary, ai_method}."""
    if not alert_type or not alert_type.strip():
        alert_type = "general"

    text = f"{title}\n{description}"

    # ── Tier 1: local sklearn ──────────────────────────────────────────
    result = get_classifier().predict(text)
    if result:
        logger.info("Classified by local ML (confidence %.2f)", result["confidence"])
        return result

    # ── Tier 2: Groq LLM ──────────────────────────────────────────────
    if GROQ_API_KEY:
        result = await _call_groq(text, alert_type)
        if result:
            return result

    # ── Tier 3: rule-based fallback ───────────────────────────────────
    return fallback_classify(title, description, alert_type)


async def _call_groq(text: str, alert_type: str) -> dict | None:
    """Call Groq API. Returns parsed dict or None on any failure."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={
                    "model": GROQ_MODEL,
                    "messages": [{"role": "user", "content": PROMPT_TEMPLATE.format(text=text, alert_type=alert_type)}],
                    "temperature": 0.3,
                    "max_tokens": 300,
                },
            )

        if response.status_code != 200:
            logger.warning("Groq returned %d — falling through to rule-based", response.status_code)
            return None

        content = response.json()["choices"][0]["message"]["content"].strip()

        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
            content = content.strip()

        parsed = json.loads(content)

        if parsed.get("classification") not in ("verified", "noise", "unreviewed"):
            parsed["classification"] = "unreviewed"
        if not isinstance(parsed.get("confidence"), (int, float)):
            parsed["confidence"] = 0.5
        if not parsed.get("action_summary"):
            parsed["action_summary"] = "Stay informed and take practical security precautions."

        parsed["ai_method"] = "groq_ai"
        return parsed

    except (json.JSONDecodeError, KeyError):
        logger.warning("Groq response unparseable — falling through to rule-based")
        return None
    except Exception as e:
        logger.warning("Groq call failed (%s) — falling through to rule-based", e)
        return None


def generate_checklist(alert_type: str) -> dict:
    templates = {
        "phishing": [
            "Check Have I Been Pwned (haveibeenpwned.com) to see if your email was compromised",
            "Enable two-factor authentication (2FA) on critical accounts",
            "Monitor your bank and credit card accounts for suspicious activity",
        ],
        "breach": [
            "Change your password immediately for the affected service",
            "Check your credit report at annualcreditreport.com",
            "Set a fraud alert with the three credit bureaus (Equifax, Experian, TransUnion)",
        ],
        "scam": [
            "Do not send money or share personal information",
            "Report the scam to the FTC at reportfraud.ftc.gov",
            "Block the sender and mark as spam/report to platform",
        ],
        "crime": [
            "Contact local law enforcement if you witness or experience a crime",
            "Document details (date, time, location, description)",
            "Increase home security measures and alert neighbors",
        ],
        "general": [
            "Assess if this alert impacts you directly",
            "Share relevant information with affected contacts",
            "Monitor official channels for updates",
        ],
    }
    key = alert_type.lower() if alert_type.lower() in templates else "general"
    return {"checklist_items": templates[key], "category": key, "method": "template_based"}
