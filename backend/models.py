"""SQLAlchemy models for database"""

from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Boolean
from database import Base
from datetime import datetime

class UserProfile(Base):
    """User profile model for community members - Privacy-First Design"""
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    neighborhood = Column(String(255), nullable=True)  # e.g., "Andheri West" - NEIGHBORHOOD ONLY, NO EXACT ADDRESS
    city = Column(String(255), nullable=True)  # e.g., "Mumbai" - CITY LEVEL, NO STREET DETAILS
    concerns = Column(Text, nullable=True)  # Comma-separated: "phishing,theft,scam"
    share_location = Column(Boolean, default=False)  # Privacy: User controls if location is visible to community
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    class Config:
        from_attributes = True


class Alert(Base):
    """Alert model for safety incidents"""
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    alert_type = Column(String(50), nullable=False, default="general", index=True)
    severity = Column(String(20), nullable=False, default="medium", index=True)
    classification = Column(String(20), nullable=False, default="unreviewed", index=True)
    ai_confidence = Column(Float, default=0.0)  # 0.0 to 1.0
    ai_reasoning = Column(Text, nullable=True)  # Internal: why AI classified this way
    action_summary = Column(Text, nullable=True)  # User-facing: calm, practical actions
    ai_method = Column(String(20), default="fallback")  # "groq_ai" or "fallback"
    neighborhood = Column(String(255), nullable=True)  # Location: neighborhood level
    city = Column(String(255), nullable=True)  # Location: city level
    dismissed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    class Config:
        from_attributes = True
