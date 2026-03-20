"""AI service using Groq API for noise filtering"""

import os
import json
import httpx
from pathlib import Path
from dotenv import load_dotenv
from services.fallback import classify_alert as fallback_classify

# Load .env from project root (one level up from backend)
project_root = Path(__file__).parent.parent.parent
env_file = project_root / ".env"
load_dotenv(dotenv_path=env_file, override=True)


GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

print(f"Looking for .env at: {env_file}")
print(f"File exists: {env_file.exists()}")
print(f"Key loaded: {'YES' if GROQ_API_KEY else 'NO — key is None'}")


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
  "action_summary": "1-2 calm, practical sentences for the user (e.g., 'Check your accounts regularly. Enable 2FA if you haven't already.')"
}}

Report: {text}
Alert type: {alert_type}"""

async def classify_alert_with_ai(title: str, description: str, alert_type: str) -> dict:

    """
    Use Groq API to classify alert as verified or noise
    Falls back to rule-based if API fails
    Returns: {classification, confidence, reasoning, ai_method}
    """
    # If alert_type is empty, use "general" as default for classification
    if not alert_type or alert_type.strip() == "":
        alert_type = "general"

    if not GROQ_API_KEY:
        print("No key — using fallback")
        return fallback_classify(title, description, alert_type)

    try:
        text = f"{title}\n{description}"

        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                GROQ_URL,
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": GROQ_MODEL,
                    "messages": [{"role": "user", "content": PROMPT_TEMPLATE.format(text=text, alert_type=alert_type)}],
                    "temperature": 0.3,
                    "max_tokens": 300
                }
            )

        # ADD THESE — shows exactly what Groq returned
        print(f"Groq status: {response.status_code}")
        print(f"Groq raw response: {response.text}")

        if response.status_code != 200:
            print(f"Groq returned {response.status_code} — using fallback")
            return fallback_classify(title, description, alert_type)

        raw = response.json()
        content = raw["choices"][0]["message"]["content"].strip()
        print(f"Groq content: {content}")

        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
            content = content.strip()

        parsed = json.loads(content)

        valid_classifications = ["verified", "noise", "unreviewed"]
        if parsed.get("classification") not in valid_classifications:
            parsed["classification"] = "unreviewed"
        if not isinstance(parsed.get("confidence"), (int, float)):
            parsed["confidence"] = 0.5
        if not parsed.get("action_summary"):
            parsed["action_summary"] = "Stay informed and take practical security precautions."

        parsed["ai_method"] = "groq_ai"
        print(f"Final parsed result: {parsed}")
        return parsed

    except json.JSONDecodeError as e:
        print(f"JSON PARSE ERROR: {e}")
        print(f"Content that failed to parse: {content}")
        return fallback_classify(title, description, alert_type)

    except Exception as e:
        import traceback
        traceback.print_exc()   # prints the FULL error with line numbers
        return fallback_classify(title, description, alert_type)


def generate_checklist(alert_type: str) -> dict:
    """
    Generate security checklist based on alert type
    Returns: {checklist_items: [], category, method}
    """

    templates = {
        'phishing': [
            "Check Have I Been Pwned (haveibeenpwned.com) to see if your email was compromised",
            "Enable two-factor authentication (2FA) on critical accounts",
            "Monitor your bank and credit card accounts for suspicious activity"
        ],
        'breach': [
            "Change your password immediately for the affected service",
            "Check your credit report at annualcreditreport.com",
            "Set a fraud alert with the three credit bureaus (Equifax, Experian, TransUnion)"
        ],
        'scam': [
            "Do not send money or share personal information",
            "Report the scam to the FTC at reportfraud.ftc.gov",
            "Block the sender and mark as spam/report to platform"
        ],
        'crime': [
            "Contact local law enforcement if you witness or experience a crime",
            "Document details (date, time, location, description)",
            "Increase home security measures and alert neighbors"
        ],
        'general': [
            "Assess if this alert impacts you directly",
            "Share relevant information with affected contacts",
            "Monitor official channels for updates"
        ]
    }

    alert_type_key = alert_type.lower() if alert_type.lower() in templates else 'general'
    checklist = templates.get(alert_type_key, templates['general'])

    return {
        'checklist_items': checklist,
        'category': alert_type_key,
        'method': 'template_based'
    }
