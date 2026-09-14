from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.user import StatusEnum

class TrackingLinkBase(BaseModel):
    offer_id: UUID

class TrackingLinkCreateRequest(TrackingLinkBase):
    pass

class TrackingLinkResponse(BaseModel):
    id: UUID
    tracking_code: str
    url: str
    affiliate_id: UUID
    offer_id: UUID
    status: StatusEnum
    created_at: datetime

    class Config:
        from_attributes = True
