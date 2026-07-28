"""Incident data from NewsAPI (live) with local JSON fallback."""

import os
import json
import logging
from typing import List, Dict

import httpx

logger = logging.getLogger(__name__)

NEWS_API_KEY = os.getenv("NEWS_API_KEY")
NEWS_API_URL = "https://newsapi.org/v2/everything"

# Safety/crime-relevant queries for Indian community context
_QUERIES = [
    "scam fraud India",
    "crime safety India",
    "cyberattack phishing India",
    "theft robbery India",
]

_CATEGORY_KEYWORDS = {
    "scam": ["scam", "fraud", "phishing", "otp", "fake", "cheated", "duped"],
    "cyber": ["cyber", "hack", "malware", "ransomware", "data breach"],
    "theft": ["theft", "robbery", "stolen", "burglary", "snatched"],
    "outage": ["outage", "power cut", "blackout", "disruption"],
    "fire": ["fire", "blaze", "arson"],
    "accident": ["accident", "crash", "collision"],
}


def _infer_category(text: str) -> str:
    lower = text.lower()
    for cat, keywords in _CATEGORY_KEYWORDS.items():
        if any(kw in lower for kw in keywords):
            return cat
    return "general"


async def _fetch_newsapi() -> List[Dict]:
    articles = []
    async with httpx.AsyncClient(timeout=10) as client:
        for q in _QUERIES:
            try:
                resp = await client.get(
                    NEWS_API_URL,
                    params={
                        "q": q,
                        "language": "en",
                        "sortBy": "publishedAt",
                        "pageSize": 10,
                        "apiKey": NEWS_API_KEY,
                    },
                )
                resp.raise_for_status()
                data = resp.json()
                articles.extend(data.get("articles", []))
            except Exception as e:
                logger.warning("NewsAPI query '%s' failed: %s", q, e)

    seen = set()
    incidents = []
    for art in articles:
        title = art.get("title") or ""
        desc = art.get("description") or ""
        if not title or title in seen:
            continue
        seen.add(title)
        raw_text = f"{title}. {desc}".strip(". ")
        incidents.append({
            "raw_text": raw_text,
            "location": "India",
            "category": _infer_category(raw_text),
        })

    logger.info("Fetched %d incidents from NewsAPI", len(incidents))
    return incidents


def _load_json_fallback() -> List[Dict]:
    for path in ["data/incidents.json", "../data/incidents.json"]:
        if os.path.exists(path):
            try:
                with open(path) as f:
                    data = json.load(f)
                logger.info("Loaded %d incidents from JSON fallback", len(data))
                return data
            except Exception as e:
                logger.error("JSON load error: %s", e)
    logger.warning("incidents.json not found")
    return []


async def get_incidents(location: str = "India", category: str = "general") -> List[Dict]:
    if NEWS_API_KEY:
        incidents = await _fetch_newsapi()
        if incidents:
            return incidents
        logger.warning("NewsAPI returned nothing, falling back to JSON")
    return _load_json_fallback()
