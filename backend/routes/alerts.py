"""Alert endpoints"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from database import get_db
from models import Alert
from schemas import AlertCreate, AlertResponse, AlertWithChecklist, ClassificationUpdate
from services.ai_service import classify_alert_with_ai, generate_checklist
from datetime import datetime

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("", response_model=list[AlertResponse])
def list_alerts(
    keyword: str = Query(None, description="Search keyword"),
    alert_type: str = Query(None, description="Filter by alert type"),
    classification: str = Query(None, description="Filter by classification"),
    severity: str = Query(None, description="Filter by severity"),
    db: Session = Depends(get_db)
):
    """List all alerts with optional filtering"""
    query = db.query(Alert).filter(Alert.dismissed == False)

    if keyword:
        query = query.filter(
            (Alert.title.ilike(f"%{keyword}%")) |
            (Alert.description.ilike(f"%{keyword}%"))
        )

    if alert_type:
        query = query.filter(Alert.alert_type == alert_type)

    if classification:
        query = query.filter(Alert.classification == classification)

    if severity:
        query = query.filter(Alert.severity == severity)

    return query.order_by(desc(Alert.created_at)).all()


@router.get("/{alert_id}", response_model=AlertWithChecklist)
def get_alert(alert_id: int, db: Session = Depends(get_db)):
    """Get a single alert with its checklist"""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert_data = AlertResponse.from_orm(alert)
    checklist = generate_checklist(alert.alert_type)

    return {**alert_data.dict(), "checklist": checklist}


@router.post("", response_model=AlertResponse, status_code=201)
async def create_alert(data: AlertCreate, db: Session = Depends(get_db)):
    """Create a new alert with AI classification"""
    # Classify using AI (with fallback)
    classification_result = await classify_alert_with_ai(
        data.title,
        data.description,
        data.alert_type
    )

    # Create alert
    alert = Alert(
        title=data.title,
        description=data.description,
        alert_type=data.alert_type,
        severity=data.severity,
        classification=classification_result['classification'],
        ai_confidence=classification_result['confidence'],
        ai_reasoning=classification_result['reasoning'],
        action_summary=classification_result.get('action_summary', ''),
        ai_method=classification_result.get('ai_method', 'fallback')
    )

    db.add(alert)
    db.commit()
    db.refresh(alert)

    return alert


@router.delete("/{alert_id}", status_code=200)
def delete_alert(alert_id: int, db: Session = Depends(get_db)):
    """Delete an alert"""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    db.delete(alert)
    db.commit()

    return {"success": True, "message": "Alert deleted successfully"}


@router.patch("/{alert_id}/dismiss", response_model=AlertResponse)
def dismiss_alert(alert_id: int, db: Session = Depends(get_db)):
    """Dismiss an alert"""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    alert.dismissed = True
    alert.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(alert)

    return alert
