from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from uuid import uuid4
import urllib.parse

from app.core.database import get_db
from app.models.tracking_link import TrackingLink
from app.models.offer import Offer
from app.models.affiliate import Affiliate
from app.models.user import StatusEnum
from app.models.click import Click

router = APIRouter()

@router.get("/c/{tracking_code}")
def track_click(tracking_code: str, request: Request, sub_id: str = None, db: Session = Depends(get_db)):
    link = db.query(TrackingLink).filter(TrackingLink.tracking_code == tracking_code).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
        
    if link.status != StatusEnum.ACTIVE:
        raise HTTPException(status_code=400, detail="Link inactive")
        
    aff = db.query(Affiliate).filter(Affiliate.id == link.affiliate_id).first()
    if not aff or aff.status != StatusEnum.ACTIVE:
        raise HTTPException(status_code=400, detail="Affiliate inactive")
        
    off = db.query(Offer).filter(Offer.id == link.offer_id).first()
    if not off or off.status != StatusEnum.ACTIVE:
        raise HTTPException(status_code=400, detail="Offer inactive")
        
    click_id = uuid4().hex
    
    click = Click(
        click_id=click_id,
        tracking_link_id=link.id,
        affiliate_id=aff.id,
        offer_id=off.id,
        sub_id=sub_id,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        referrer=request.headers.get("referer")
    )
    
    db.add(click)
    db.commit()
    
    # build redirect
    dest_url = off.destination_url
    
    params = {}
    if off.click_id_parameter:
        params[off.click_id_parameter] = click_id
    if off.sub_id_parameter and sub_id:
        params[off.sub_id_parameter] = sub_id
        
    if params:
        url_parts = list(urllib.parse.urlparse(dest_url))
        query = dict(urllib.parse.parse_qsl(url_parts[4]))
        query.update(params)
        url_parts[4] = urllib.parse.urlencode(query)
        dest_url = urllib.parse.urlunparse(url_parts)
        
    return RedirectResponse(url=dest_url, status_code=307)
