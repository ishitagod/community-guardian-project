"""Profile-based relevance scoring using TF-IDF cosine similarity."""

import logging
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)


def score_alerts(alerts: list, profile_city: str | None, profile_concerns: str | None) -> list:
    """
    Score and sort alerts by relevance to a user profile.
    Returns alerts list with `relevance_score` (0.0–1.0) added to each.
    Falls back to returning alerts unmodified if profile has no usable text.
    """
    profile_text = " ".join(filter(None, [profile_city, profile_concerns])).strip()
    if not profile_text or not alerts:
        for a in alerts:
            a["relevance_score"] = None
        return alerts

    alert_texts = [f"{a.get('title', '')} {a.get('description', '')}" for a in alerts]
    corpus = [profile_text] + alert_texts

    try:
        vec = TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True).fit_transform(corpus)
        # profile vector is index 0; alert vectors are 1..N
        scores = cosine_similarity(vec[0:1], vec[1:]).flatten()
    except Exception as e:
        logger.warning("Relevance scoring failed: %s", e)
        for a in alerts:
            a["relevance_score"] = None
        return alerts

    for alert, score in zip(alerts, scores):
        alert["relevance_score"] = round(float(score), 3)

    return sorted(alerts, key=lambda a: a["relevance_score"], reverse=True)
