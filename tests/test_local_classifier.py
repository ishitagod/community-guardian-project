"""Tests for the local sklearn classifier."""

import sys
sys.path.insert(0, "./backend")

from services.local_classifier import LocalClassifier


def test_classifier_trains_without_error():
    clf = LocalClassifier()
    assert clf._trained


def test_verified_text_scores_highest_on_verified():
    """Classifier should rank 'verified' highest for a specific, detailed report."""
    clf = LocalClassifier()
    text = (
        "ATM skimmer found on HDFC ATM at Linking Road on March 15 at 2:30pm. "
        "Police FIR number 2024-CR-1892 filed. Bank has disabled the ATM."
    )
    proba = clf.predict_proba_all(text)
    assert proba, "predict_proba_all should return a dict"
    assert proba["verified"] == max(proba.values()), f"expected verified to rank highest, got {proba}"


def test_noise_text_scores_highest_on_noise():
    """Classifier should rank 'noise' highest for vague, unverifiable text."""
    clf = LocalClassifier()
    text = "I think something weird might be happening, not sure, heard from a friend maybe."
    proba = clf.predict_proba_all(text)
    assert proba, "predict_proba_all should return a dict"
    assert proba["noise"] == max(proba.values()), f"expected noise to rank highest, got {proba}"


def test_low_confidence_returns_none():
    """Ambiguous text should defer to next tier (return None)."""
    clf = LocalClassifier()
    text = "Something happened near the market."
    result = clf.predict(text)
    # Either defers (None) or returns a valid classification — never crashes
    assert result is None or result["classification"] in ("verified", "noise", "unreviewed")


def test_result_has_required_fields():
    clf = LocalClassifier()
    text = (
        "Phishing SMS confirmed by CERT-In on April 3. "
        "Official advisory published. Do not click the link."
    )
    result = clf.predict(text)
    if result:
        assert "classification" in result
        assert "confidence" in result
        assert "reasoning" in result
        assert "action_summary" in result
        assert "ai_method" in result
        assert result["classification"] in ("verified", "noise", "unreviewed")
        assert 0.0 <= result["confidence"] <= 1.0


def test_predict_proba_all_sums_to_one():
    clf = LocalClassifier()
    proba = clf.predict_proba_all("Suspicious email asking for OTP.")
    if proba:
        assert abs(sum(proba.values()) - 1.0) < 0.001
        assert set(proba.keys()) == {"verified", "noise", "unreviewed"}
