from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
import random
import string

from app.core.database import get_db
from app.models.tracking_link import TrackingLink
from app.models.offer import AffiliateOffer, Offer
from app.models.affiliate import Affiliate
from app.models.user import User, RoleEnum, StatusEnum
from app.schemas.tracking_link import TrackingLinkResponse, TrackingLinkCreateRequest
from app.api.deps import get_current_active_user, get_current_active_admin
from app.core.config import settings

router = APIRouter()

def generate_tracking_code():
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=8))

@router.get("", response_model=List[TrackingLinkResponse])
def get_tracking_links(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    if current_user.role == RoleEnum.ADMIN:
        return db.query(TrackingLink).all()
    if current_user.role == RoleEnum.MANAGER:
        return db.query(TrackingLink).join(Affiliate).filter(Affiliate.manager_id == current_user.id).all()
    if current_user.role == RoleEnum.AFFILIATE:
        return db.query(TrackingLink).join(Affiliate).filter(Affiliate.user_id == current_user.id).all()
    return []

@router.post("", response_model=TrackingLinkResponse, status_code=status.HTTP_201_CREATED)
def create_tracking_link(req: TrackingLinkCreateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    if current_user.role != RoleEnum.AFFILIATE:
        raise HTTPException(status_code=403, detail="Only affiliates can create tracking links")
        
    aff = db.query(Affiliate).filter(Affiliate.user_id == current_user.id).first()
    if not aff or aff.status != StatusEnum.ACTIVE:
        raise HTTPException(status_code=400, detail="Affiliate not active")
        
    off = db.query(Offer).filter(Offer.id == req.offer_id).first()
    if not off or off.status != StatusEnum.ACTIVE:
        raise HTTPException(status_code=400, detail="Offer not found or inactive")
        
    assigned = db.query(AffiliateOffer).filter(
        AffiliateOffer.affiliate_id == aff.id,
        AffiliateOffer.offer_id == off.id
    ).first()
    if not assigned:
        raise HTTPException(status_code=403, detail="Offer not assigned to you")
        
    code = generate_tracking_code()
    link = TrackingLink(
        tracking_code=code,
        affiliate_id=aff.id,
        offer_id=off.id
    )
    db.add(link)
    db.commit()
    db.refresh(link)
    
    url = f"{settings.TRACKING_BASE_URL}/c/{code}"
    if req.sub_id:
        url += f"?sub_id={req.sub_id}"
        
    # We add url to the response via a dynamic property
    link.url = url
    return link

@router.get("/{tracking_link_id}", response_model=TrackingLinkResponse)
def get_tracking_link(tracking_link_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    link = db.query(TrackingLink).filter(TrackingLink.id == tracking_link_id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Tracking link not found")
        
    if current_user.role == RoleEnum.MANAGER:
        aff = db.query(Affiliate).filter(Affiliate.id == link.affiliate_id).first()
        if not aff or aff.manager_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not your affiliate's link")
            
    if current_user.role == RoleEnum.AFFILIATE:
        aff = db.query(Affiliate).filter(Affiliate.id == link.affiliate_id).first()
        if not aff or aff.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not your link")
            
    url = f"{settings.TRACKING_BASE_URL}/c/{link.tracking_code}"
    # Can't easily get sub_id back as it's not strictly stored in TrackingLink, it's generated dynamically
    link.url = url
    return link

@router.post("/{tracking_link_id}/deactivate", response_model=TrackingLinkResponse)
def deactivate_tracking_link(tracking_link_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    link = db.query(TrackingLink).filter(TrackingLink.id == tracking_link_id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Tracking link not found")
        
    if current_user.role == RoleEnum.MANAGER:
        aff = db.query(Affiliate).filter(Affiliate.id == link.affiliate_id).first()
        if not aff or aff.manager_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not your affiliate's link")
            
    if current_user.role == RoleEnum.AFFILIATE:
        aff = db.query(Affiliate).filter(Affiliate.id == link.affiliate_id).first()
        if not aff or aff.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not your link")
            
    link.status = StatusEnum.INACTIVE
    db.commit()
    db.refresh(link)
    url = f"{settings.TRACKING_BASE_URL}/c/{link.tracking_code}"
    link.url = url
    return link
