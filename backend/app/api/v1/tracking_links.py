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
    if current_user.role not in [RoleEnum.AFFILIATE, RoleEnum.MANAGER]:
        raise HTTPException(status_code=403, detail="Only affiliates and managers can create tracking links")
        
    aff = db.query(Affiliate).filter(Affiliate.user_id == current_user.id).first()
    
    if current_user.role == RoleEnum.MANAGER:
        if not aff:
            # Auto-create Affiliate profile for Manager
            aff_code = "MGR-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
            aff = Affiliate(
                user_id=current_user.id,
                manager_id=current_user.id, # Manager is their own manager
                affiliate_code=aff_code,
                status=StatusEnum.ACTIVE
            )
            db.add(aff)
            db.commit()
            db.refresh(aff)
            
        # For manager, check if they are assigned this offer in ManagerOffer
        from app.models.offer import ManagerOffer
        assigned_mgr = db.query(ManagerOffer).filter(
            ManagerOffer.manager_id == current_user.id,
            ManagerOffer.offer_id == req.offer_id
        ).first()
        if not assigned_mgr:
            raise HTTPException(status_code=403, detail="Offer not assigned to you as a manager")
            
        # We must also ensure AffiliateOffer exists so tracking works correctly downstream
        assigned_aff = db.query(AffiliateOffer).filter(
            AffiliateOffer.affiliate_id == aff.id,
            AffiliateOffer.offer_id == req.offer_id
        ).first()
        if not assigned_aff:
            aff_off = AffiliateOffer(affiliate_id=aff.id, offer_id=req.offer_id)
            db.add(aff_off)
            db.commit()
    else:
        # Affiliate logic
        if not aff or aff.status != StatusEnum.ACTIVE:
            raise HTTPException(status_code=400, detail="Affiliate not active")
            
        assigned = db.query(AffiliateOffer).filter(
            AffiliateOffer.affiliate_id == aff.id,
            AffiliateOffer.offer_id == req.offer_id
        ).first()
        if not assigned:
            raise HTTPException(status_code=403, detail="Offer not assigned to you")
            
    off = db.query(Offer).filter(Offer.id == req.offer_id).first()
    if not off or off.status != StatusEnum.ACTIVE:
        raise HTTPException(status_code=400, detail="Offer not found or inactive")
        
    existing_link = db.query(TrackingLink).filter(
        TrackingLink.affiliate_id == aff.id,
        TrackingLink.offer_id == off.id
    ).first()
    
    if existing_link:
        return existing_link
        
    code = generate_tracking_code()
    link = TrackingLink(
        tracking_code=code,
        affiliate_id=aff.id,
        offer_id=off.id
    )
    db.add(link)
    db.commit()
    db.refresh(link)
    
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
    return link
