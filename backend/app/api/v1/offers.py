from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.models.offer import Offer, AffiliateOffer
from app.models.user import User, RoleEnum, StatusEnum
from app.schemas.offer import OfferResponse, OfferCreate, OfferUpdate
from app.api.deps import get_current_user, get_current_active_user, get_current_active_admin

router = APIRouter()

@router.get("", response_model=List[OfferResponse])
def get_offers(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    if current_user.role == RoleEnum.ADMIN:
        return db.query(Offer).all()
    if current_user.role == RoleEnum.MANAGER:
        from app.models.offer import ManagerOffer
        return db.query(Offer).join(ManagerOffer).filter(ManagerOffer.manager_id == current_user.id).all()
    if current_user.role == RoleEnum.AFFILIATE:
        from app.models.affiliate import Affiliate
        aff = db.query(Affiliate).filter(Affiliate.user_id == current_user.id).first()
        if not aff:
            return []
        offers = db.query(Offer).join(AffiliateOffer).filter(
            AffiliateOffer.affiliate_id == aff.id,
            Offer.status == StatusEnum.ACTIVE
        ).all()
        return offers
    return []

@router.post("", response_model=OfferResponse, status_code=status.HTTP_201_CREATED)
def create_offer(offer_in: OfferCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    db_offer = Offer(**offer_in.model_dump())
    db.add(db_offer)
    db.commit()
    db.refresh(db_offer)
    return db_offer

@router.get("/{offer_id}", response_model=OfferResponse)
def get_offer(offer_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    return offer

@router.patch("/{offer_id}", response_model=OfferResponse)
def update_offer(offer_id: UUID, offer_in: OfferUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    db_offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not db_offer:
        raise HTTPException(status_code=404, detail="Offer not found")
        
    update_data = offer_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_offer, field, value)
        
    db.commit()
    db.refresh(db_offer)
    return db_offer

@router.post("/{offer_id}/activate", response_model=OfferResponse)
def activate_offer(offer_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    db_offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not db_offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    db_offer.status = StatusEnum.ACTIVE
    db.commit()
    db.refresh(db_offer)
    return db_offer

@router.post("/{offer_id}/deactivate", response_model=OfferResponse)
def deactivate_offer(offer_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_admin)):
    db_offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not db_offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    db_offer.status = StatusEnum.INACTIVE
    db.commit()
    db.refresh(db_offer)
    return db_offer
