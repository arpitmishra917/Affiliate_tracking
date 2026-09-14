from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.models.user import User, RoleEnum, StatusEnum
from app.schemas.user import UserResponse, UserCreate, UserUpdate
from app.api.deps import get_current_user, get_current_active_user, get_current_active_admin
from app.core.security import get_password_hash

router = APIRouter()

@router.get("", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    return db.query(User).all()

@router.post("/managers", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_manager(user_in: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    if user_in.role != RoleEnum.MANAGER:
        raise HTTPException(status_code=400, detail="Only managers can be created here")
    
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    db_user = User(
        name=user_in.name,
        email=user_in.email,
        phone=user_in.phone,
        role=user_in.role,
        password_hash=get_password_hash(user_in.password),
        status=user_in.status
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.patch("/{user_id}", response_model=UserResponse)
def update_user(user_id: UUID, user_in: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    update_data = user_in.model_dump(exclude_unset=True)
    if "password" in update_data:
        db_user.password_hash = get_password_hash(update_data.pop("password"))
        
    for field, value in update_data.items():
        setattr(db_user, field, value)
        
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/{user_id}/activate", response_model=UserResponse)
def activate_user(user_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_user.status = StatusEnum.ACTIVE
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/{user_id}/deactivate", response_model=UserResponse)
def deactivate_user(user_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if db_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
        
    db_user.status = StatusEnum.INACTIVE
    db.commit()
    db.refresh(db_user)
    return db_user

from app.models.offer import ManagerOffer, Offer
@router.post("/{user_id}/offers/{offer_id}")
def assign_offer_to_manager(user_id: UUID, offer_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    manager = db.query(User).filter(User.id == user_id, User.role == RoleEnum.MANAGER).first()
    if not manager:
        raise HTTPException(status_code=404, detail="Manager not found")
        
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
        
    existing = db.query(ManagerOffer).filter(
        ManagerOffer.manager_id == user_id,
        ManagerOffer.offer_id == offer_id
    ).first()
    if existing:
        return {"status": "already assigned"}
        
    assignment = ManagerOffer(manager_id=user_id, offer_id=offer_id)
    db.add(assignment)
    db.commit()
    return {"status": "assigned"}

@router.delete("/{user_id}/offers/{offer_id}")
def remove_offer_from_manager(user_id: UUID, offer_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    existing = db.query(ManagerOffer).filter(
        ManagerOffer.manager_id == user_id,
        ManagerOffer.offer_id == offer_id
    ).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Assignment not found")
        
    db.delete(existing)
    db.commit()
    return {"status": "unassigned"}
