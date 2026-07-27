"""Endpoint and AI-fallback tests."""

import sys
import os
import pytest
from unittest.mock import patch, AsyncMock

sys.path.insert(0, "./backend")

os.environ.setdefault("DATABASE_URL", "sqlite:///./test_safety_alerts.db")


@pytest.fixture(scope="module")
def client():
    from fastapi.testclient import TestClient
    with patch("main.background_ingest", new_callable=AsyncMock):
        from main import app
        with TestClient(app) as c:
            yield c


def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_alerts_list_returns_list(client):
    response = client.get("/alerts")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_ai_failure_falls_back():
    """Groq timeout/error → fallback classifier, source == 'fallback'."""
    from services.ai_service import classify_alert_with_ai

    with patch("services.ai_service.httpx.AsyncClient") as mock_client:
        mock_client.return_value.__aenter__.return_value.post = AsyncMock(
            side_effect=Exception("timeout")
        )
        result = await classify_alert_with_ai(
            title="Bank OTP fraud text",
            description="Send OTP immediately or account locked",
            alert_type="phishing",
        )

    assert result["ai_method"] == "fallback"
    assert result["classification"] in ("verified", "noise", "unreviewed")
    assert "confidence" in result
