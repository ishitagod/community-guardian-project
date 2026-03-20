"""Pydantic schemas for request/response validation"""

from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List

# ============ USER PROFILE SCHEMAS ============

class UserProfileCreate(BaseModel):
    """Schema for creating a user profile - Privacy-First Design"""
    name: str = Field(..., min_length=2, max_length=255, description="User name")
    neighborhood: Optional[str] = Field(None, max_length=255, description="Neighborhood only (e.g., 'Andheri West') - NO STREET ADDRESS")
    city: Optional[str] = Field(None, max_length=255, description="City (e.g., 'Mumbai')")
    concerns: Optional[str] = Field(None, description="Comma-separated concerns: phishing,theft,scam")
    share_location: bool = Field(default=False, description="Allow neighborhood to be visible to community (privacy control)")

class UserProfileUpdate(BaseModel):
    """Schema for updating a user profile"""
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    neighborhood: Optional[str] = Field(None, max_length=255, description="Neighborhood only - NO STREET ADDRESS")
    city: Optional[str] = Field(None, max_length=255)
    concerns: Optional[str] = Field(None)
    share_location: Optional[bool] = Field(None, description="Privacy control: share location with community")

class UserProfileResponse(BaseModel):
    """Schema for user profile response"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    neighborhood: Optional[str]
    city: Optional[str]
    concerns: Optional[str]
    share_location: bool
    created_at: datetime
    updated_at: datetime

class UserProfilePublic(BaseModel):
    """Schema for public profile view - Privacy-respecting (location hidden if not shared)"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    neighborhood: Optional[str]
    city: Optional[str]
    concerns: Optional[str]
    share_location: bool
    is_public: bool = True

# ============ ALERT SCHEMAS ============

class AlertCreate(BaseModel):
    """Schema for creating an alert"""
    title: str = Field(..., min_length=3, max_length=255, description="Alert title")
    description: str = Field(..., min_length=10, description="Alert description")
    alert_type: str = Field(default="general", description="Type: phishing, breach, scam, crime, accident, disaster, outage, general")
    severity: str = Field(default="medium", description="Severity: low, medium, high")

class AlertResponse(BaseModel):
    """Schema for alert response"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    alert_type: str
    severity: str
    classification: str
    ai_confidence: float
    ai_reasoning: Optional[str]
    action_summary: Optional[str]
    ai_method: str
    neighborhood: Optional[str]
    city: Optional[str]
    dismissed: bool
    created_at: datetime
    updated_at: datetime

class AlertWithChecklist(AlertResponse):
    """Alert with security checklist"""
    checklist: Optional[dict] = None

class ChecklistResponse(BaseModel):
    """Security checklist response"""
    checklist_items: List[str]
    category: str
    method: str

class ClassificationUpdate(BaseModel):
    """Schema for updating classification"""
    classification: str = Field(..., description="New classification: unreviewed, verified, noise")
