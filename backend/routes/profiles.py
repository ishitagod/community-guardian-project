"""User profile endpoints - CRUD with Privacy-First Design

Privacy measures:
- Locations are neighborhood-level only (no street addresses)
- Users control location visibility with share_location flag
- Public list only shows location if user opted in
- No exact addresses stored anywhere
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from database import get_db
from models import UserProfile
from schemas import UserProfileCreate, UserProfileResponse, UserProfileUpdate, UserProfilePublic
from datetime import datetime

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("", response_model=list[UserProfilePublic])
def list_profiles(
    keyword: str = Query(None, description="Search by name or neighborhood"),
    db: Session = Depends(get_db)
):
    """
    List all PUBLIC user profiles with optional search.

    Privacy: Only shows location if user has opted in (share_location=True)
    """
    query = db.query(UserProfile).filter(UserProfile.share_location == True)  # Only public profiles

    if keyword:
        query = query.filter(
            (UserProfile.name.ilike(f"%{keyword}%")) |
            (UserProfile.neighborhood.ilike(f"%{keyword}%")) |
            (UserProfile.city.ilike(f"%{keyword}%"))
        )

    return query.order_by(desc(UserProfile.created_at)).all()


@router.get("/{profile_id}", response_model=UserProfilePublic)
def get_profile(profile_id: int, db: Session = Depends(get_db)):
    """
    Get a single user profile.

    Privacy: Returns location only if user has shared it (share_location=True)
    """
    profile = db.query(UserProfile).filter(UserProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Privacy check: If profile is private (share_location=False), only show basic info
    if not profile.share_location:
        # Return with location fields removed (they'll be None in response)
        return UserProfilePublic(
            id=profile.id,
            name=profile.name,
            neighborhood=None,  # Hidden for privacy
            city=None,  # Hidden for privacy
            concerns=profile.concerns
        )

    return profile


@router.post("", response_model=UserProfileResponse, status_code=201)
def create_profile(data: UserProfileCreate, db: Session = Depends(get_db)):
    """
    Create a new user profile with Privacy-First design.

    Privacy:
    - Neighborhood level only (no street addresses)
    - Users control if location is visible (share_location flag)
    - Default: private (share_location=False)
    """
    # Validate: neighborhood should not contain street addresses
    if data.neighborhood and any(street_indicator in data.neighborhood.lower() for street_indicator in
                                  ['street', 'st.', 'avenue', 'ave.', 'road', 'rd.', 'lane', 'ln.', 'building', 'apt', '#', 'plot']):
        raise HTTPException(status_code=422, detail="Neighborhood should not contain street addresses for privacy. Use neighborhood name only (e.g., 'Andheri West')")

    profile = UserProfile(
        name=data.name,
        neighborhood=data.neighborhood,
        city=data.city,
        concerns=data.concerns,
        share_location=data.share_location  # Privacy: User controls visibility
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


@router.put("/{profile_id}", response_model=UserProfileResponse)
def update_profile(
    profile_id: int,
    data: UserProfileUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a user profile with privacy controls.

    Privacy:
    - Can update share_location flag (opt-in/out of community visibility)
    - Neighborhood must remain neighborhood-level (no street addresses)
    """
    profile = db.query(UserProfile).filter(UserProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Update only provided fields
    if data.name is not None:
        profile.name = data.name

    if data.neighborhood is not None:
        # Validate: no street addresses
        if any(street_indicator in data.neighborhood.lower() for street_indicator in
               ['street', 'st.', 'avenue', 'ave.', 'road', 'rd.', 'lane', 'ln.', 'building', 'apt', '#', 'plot']):
            raise HTTPException(status_code=422, detail="Neighborhood should not contain street addresses for privacy")
        profile.neighborhood = data.neighborhood

    if data.city is not None:
        profile.city = data.city

    if data.concerns is not None:
        profile.concerns = data.concerns

    if data.share_location is not None:
        profile.share_location = data.share_location  # Privacy control: user can toggle visibility

    profile.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(profile)

    return profile


@router.delete("/{profile_id}", status_code=200)
def delete_profile(profile_id: int, db: Session = Depends(get_db)):
    """Delete a user profile"""
    profile = db.query(UserProfile).filter(UserProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    db.delete(profile)
    db.commit()

    return {"success": True, "message": "Profile deleted successfully"}
