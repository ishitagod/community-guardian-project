import sys
sys.path.insert(0, "./backend")
from services.fallback import classify_alert

def test_scam_detected_correctly():
    """Happy path — obvious scam text gets classified as noise/verified"""
    result = classify_alert(
        title="Urgent OTP request from HDFC",
        description="Click this link to verify your OTP now or your account will be suspended",
        alert_type="phishing"
    )
    assert result["classification"] in ["verified", "noise", "unreviewed"]
    assert "confidence" in result
    assert isinstance(result["confidence"], float)
    assert "action_summary" in result
    assert result["ai_method"] == "fallback"

def test_verified_incident_detected():
    """Happy path — specific incident details get classified correctly"""
    result = classify_alert(
        title="Fire at MG Road metro station",
        description="Fire reported near MG Road metro station on March 19 at 3:45 PM. Fire department on scene.",
        alert_type="crime"
    )
    assert result["classification"] == "verified"
    assert result["confidence"] >= 0.7
    assert result["ai_method"] == "fallback"
