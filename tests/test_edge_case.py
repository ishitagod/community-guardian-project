import sys
sys.path.insert(0, "./backend")
from services.fallback import classify_alert

def test_empty_text_does_not_crash():
    """Edge case — empty strings should not throw an exception"""
    result = classify_alert(
        title="",
        description="",
        alert_type="general"
    )
    assert isinstance(result["classification"], str)
    assert isinstance(result["action_summary"], str)
    assert result["ai_method"] == "fallback"

def test_vague_text_classified_as_noise():
    """Edge case — vague text without details should be noise"""
    result = classify_alert(
        title="Something happened maybe",
        description="I think maybe something happened but I'm not really sure probably",
        alert_type="general"
    )
    assert result["classification"] == "noise"
    assert result["ai_method"] == "fallback"

def test_very_long_text_does_not_crash():
    """Edge case — extremely long input shouldn't break anything"""
    long_text = "suspicious activity " * 500
    result = classify_alert(
        title="Test",
        description=long_text,
        alert_type="general"
    )
    assert isinstance(result["classification"], str)
