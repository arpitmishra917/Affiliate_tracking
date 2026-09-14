from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
import random
import string

from app.core.database import get_db
from app.models.affiliate import Affiliate
from app.models.offer import AffiliateOffer, Offer
from app.models.user import User, RoleEnum, StatusEnum
from app.schemas.affiliate import AffiliateResponse, AffiliateCreate, AffiliateUpdate
from app.schemas.offer import OfferResponse
from app.api.deps import get_current_user, get_current_active_user, get_current_active_admin
from app.core.security import get_password_hash

router = APIRouter()

def generate_affiliate_code():
    return "AFF-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=6))

@router.get("", response_model=List[AffiliateResponse])
def get_affiliates(manager_id: Optional[UUID] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    if current_user.role == RoleEnum.ADMIN:
        query = db.query(Affiliate)
        if manager_id:
            query = query.filter(Affiliate.manager_id == manager_id)
        return query.all()
    if current_user.role == RoleEnum.MANAGER:
        return db.query(Affiliate).filter(Affiliate.manager_id == current_user.id).all()
    raise HTTPException(status_code=403, detail="Not enough permissions")

@router.post("", response_model=AffiliateResponse, status_code=status.HTTP_201_CREATED)
def create_affiliate(aff_in: AffiliateCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    if current_user.role not in [RoleEnum.ADMIN, RoleEnum.MANAGER]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
        
    manager_id = current_user.id
    if current_user.role == RoleEnum.ADMIN:
        if aff_in.manager_id:
            manager_id = aff_in.manager_id
            manager = db.query(User).filter(User.id == manager_id, User.role.in_([RoleEnum.MANAGER, RoleEnum.ADMIN])).first()
            if not manager:
                raise HTTPException(status_code=400, detail="Invalid manager ID")
        else:
            manager_id = current_user.id

    # Create User
    existing = db.query(User).filter(User.email == aff_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    # generate a random password for now or send an email
    temp_password = aff_in.password if aff_in.password else "password123"
    db_user = User(
        name=aff_in.name,
        email=aff_in.email,
        phone=aff_in.phone,
        address=aff_in.address,
        role=RoleEnum.AFFILIATE,
        password_hash=get_password_hash(temp_password),
    )
    db.add(db_user)
    db.flush() # get user id
    
    db_aff = Affiliate(
        user_id=db_user.id,
        manager_id=manager_id,
        affiliate_code=generate_affiliate_code()
    )
    db.add(db_aff)
    db.commit()
    db.refresh(db_aff)
    return db_aff

@router.get("/{affiliate_id}", response_model=AffiliateResponse)
def get_affiliate(affiliate_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    aff = db.query(Affiliate).filter(Affiliate.id == affiliate_id).first()
    if not aff:
        raise HTTPException(status_code=404, detail="Affiliate not found")
        
    if current_user.role == RoleEnum.MANAGER and aff.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your affiliate")
    if current_user.role == RoleEnum.AFFILIATE and aff.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your affiliate")
        
    return aff

@router.patch("/{affiliate_id}", response_model=AffiliateResponse)
def update_affiliate(affiliate_id: UUID, aff_in: AffiliateUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    aff = db.query(Affiliate).filter(Affiliate.id == affiliate_id).first()
    if not aff:
        raise HTTPException(status_code=404, detail="Affiliate not found")
        
    if current_user.role == RoleEnum.MANAGER and aff.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your affiliate")
    if current_user.role == RoleEnum.AFFILIATE and aff.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your affiliate")

    user = db.query(User).filter(User.id == aff.user_id).first()
    update_data = aff_in.model_dump(exclude_unset=True)
    
    if "status" in update_data:
        if current_user.role == RoleEnum.AFFILIATE:
            raise HTTPException(status_code=403, detail="Cannot change own status")
        aff.status = update_data["status"]
        user.status = update_data["status"]
        
    for field in ["name", "email", "phone", "address"]:
        if field in update_data:
            setattr(user, field, update_data[field])

    if "password" in update_data and update_data["password"]:
        user.password_hash = get_password_hash(update_data["password"])

    db.commit()
    db.refresh(aff)
    return aff

@router.post("/{affiliate_id}/activate", response_model=AffiliateResponse)
def activate_affiliate(affiliate_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    if current_user.role not in [RoleEnum.ADMIN, RoleEnum.MANAGER]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    aff = db.query(Affiliate).filter(Affiliate.id == affiliate_id).first()
    if not aff:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    if current_user.role == RoleEnum.MANAGER and aff.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your affiliate")
        
    user = db.query(User).filter(User.id == aff.user_id).first()
    aff.status = StatusEnum.ACTIVE
    user.status = StatusEnum.ACTIVE
    db.commit()
    db.refresh(aff)
    return aff

@router.post("/{affiliate_id}/deactivate", response_model=AffiliateResponse)
def deactivate_affiliate(affiliate_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    if current_user.role not in [RoleEnum.ADMIN, RoleEnum.MANAGER]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    aff = db.query(Affiliate).filter(Affiliate.id == affiliate_id).first()
    if not aff:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    if current_user.role == RoleEnum.MANAGER and aff.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your affiliate")
        
    user = db.query(User).filter(User.id == aff.user_id).first()
    aff.status = StatusEnum.INACTIVE
    user.status = StatusEnum.INACTIVE
    db.commit()
    db.refresh(aff)
    return aff

from app.api.deps import get_current_user, get_current_active_user, get_current_active_admin, get_current_active_admin_or_manager

@router.post("/{affiliate_id}/offers/{offer_id}")
def assign_offer(affiliate_id: UUID, offer_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin_or_manager)):
    aff = db.query(Affiliate).filter(Affiliate.id == affiliate_id).first()
    if not aff:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    if current_user.role == RoleEnum.MANAGER and aff.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your affiliate")
        
    off = db.query(Offer).filter(Offer.id == offer_id).first()
    if not off:
        raise HTTPException(status_code=404, detail="Offer not found")
        
    if current_user.role == RoleEnum.MANAGER:
        from app.models.offer import ManagerOffer
        assigned_mgr = db.query(ManagerOffer).filter(
            ManagerOffer.manager_id == current_user.id,
            ManagerOffer.offer_id == offer_id
        ).first()
        if not assigned_mgr:
            raise HTTPException(status_code=403, detail="You must be assigned this offer before you can assign it to an affiliate")
            
    existing = db.query(AffiliateOffer).filter(
        AffiliateOffer.affiliate_id == affiliate_id,
        AffiliateOffer.offer_id == offer_id
    ).first()
    if existing:
        return {"status": "already assigned"}
        
    assignment = AffiliateOffer(affiliate_id=affiliate_id, offer_id=offer_id)
    db.add(assignment)
    db.commit()
    return {"status": "assigned"}

@router.delete("/{affiliate_id}/offers/{offer_id}")
def remove_offer_assignment(affiliate_id: UUID, offer_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin_or_manager)):
    aff = db.query(Affiliate).filter(Affiliate.id == affiliate_id).first()
    if not aff:
        raise HTTPException(status_code=404, detail="Affiliate not found")
    if current_user.role == RoleEnum.MANAGER and aff.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your affiliate")

    existing = db.query(AffiliateOffer).filter(
        AffiliateOffer.affiliate_id == affiliate_id,
        AffiliateOffer.offer_id == offer_id
    ).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Assignment not found")
        
    db.delete(existing)
    db.commit()
    return {"status": "unassigned"}

@router.get("/{affiliate_id}/offers", response_model=List[OfferResponse])
def get_affiliate_offers(affiliate_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    aff = db.query(Affiliate).filter(Affiliate.id == affiliate_id).first()
    if not aff:
        raise HTTPException(status_code=404, detail="Affiliate not found")
        
    if current_user.role == RoleEnum.MANAGER and aff.manager_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your affiliate")
    if current_user.role == RoleEnum.AFFILIATE and aff.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your affiliate")
        
    offers = db.query(Offer).join(AffiliateOffer).filter(
        AffiliateOffer.affiliate_id == affiliate_id
    ).all()
    return offers
