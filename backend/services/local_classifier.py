"""Local sklearn classifier — tier 1 of the three-tier pipeline."""

import json
import logging
import numpy as np
from pathlib import Path
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

logger = logging.getLogger(__name__)

CONFIDENCE_THRESHOLD = 0.78
DATA_PATH = Path(__file__).parent.parent / "data" / "labeled_samples.json"

ACTION_DEFAULTS = {
    "verified":   "Stay informed and follow official guidance for this incident.",
    "noise":      "This report lacks verifiable details. Treat with caution.",
    "unreviewed": "Details are limited. Monitor official sources for updates.",
}


class LocalClassifier:
    def __init__(self):
        self._pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(
                ngram_range=(1, 2),
                max_features=8000,
                sublinear_tf=True,
                min_df=1,
            )),
            ("clf", LogisticRegression(
                max_iter=1000,
                C=2.0,
                class_weight="balanced",
                solver="lbfgs",
            )),
        ])
        self._trained = False
        self._n_samples = 0
        self._train()

    def _train(self):
        try:
            with open(DATA_PATH) as f:
                samples = json.load(f)
            texts  = [s["text"]  for s in samples]
            labels = [s["label"] for s in samples]
            self._pipeline.fit(texts, labels)
            self._trained = True
            self._n_samples = len(samples)
            logger.info("Local classifier trained on %d samples", self._n_samples)
        except Exception as e:
            logger.warning("Local classifier training failed: %s", e)

    def predict(self, text: str) -> dict | None:
        """Return classification dict if confident, else None (defer to next tier)."""
        if not self._trained:
            return None

        proba = self._pipeline.predict_proba([text])[0]
        classes = self._pipeline.classes_
        max_idx = int(np.argmax(proba))
        confidence = float(proba[max_idx])

        if confidence < CONFIDENCE_THRESHOLD:
            return None

        classification = classes[max_idx]
        return {
            "classification": classification,
            "confidence": round(confidence, 3),
            "reasoning": f"Local ML classifier ({confidence:.0%} confidence, trained on {self._n_samples} samples)",
            "action_summary": ACTION_DEFAULTS.get(classification, ACTION_DEFAULTS["unreviewed"]),
            "ai_method": "local_ml",
        }

    def predict_proba_all(self, text: str) -> dict:
        """Return full probability distribution — used for evaluation."""
        if not self._trained:
            return {}
        proba = self._pipeline.predict_proba([text])[0]
        return dict(zip(self._pipeline.classes_, [round(float(p), 3) for p in proba]))


# Module-level singleton — trained once at startup
_instance: LocalClassifier | None = None


def get_classifier() -> LocalClassifier:
    global _instance
    if _instance is None:
        _instance = LocalClassifier()
    return _instance
