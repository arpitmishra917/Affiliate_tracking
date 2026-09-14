from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from app.core.database import get_db
from app.models.click import Click
from app.models.affiliate import Affiliate
from app.models.user import User, RoleEnum
from app.schemas.click import ClickResponse, ClickPaginatedResponse
from app.api.deps import get_current_active_user

router = APIRouter()

@router.get("/stats")
def get_click_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    query = db.query(func.count(Click.id))
    
    if current_user.role == RoleEnum.ADMIN:
        total_clicks = query.scalar()
    elif current_user.role == RoleEnum.MANAGER:
        total_clicks = query.join(Affiliate).filter(Affiliate.manager_id == current_user.id).scalar()
    else:
        total_clicks = query.join(Affiliate).filter(Affiliate.user_id == current_user.id).scalar()
        
    return {"total_clicks": total_clicks}

@router.get("", response_model=ClickPaginatedResponse)
def get_clicks(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(Click)
    
    if current_user.role == RoleEnum.MANAGER:
        query = query.join(Affiliate).filter(Affiliate.manager_id == current_user.id)
    elif current_user.role == RoleEnum.AFFILIATE:
        query = query.join(Affiliate).filter(Affiliate.user_id == current_user.id)

    total = query.count()
    clicks = query.order_by(Click.clicked_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    
    return {
        "data": clicks,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total
        }
    }
