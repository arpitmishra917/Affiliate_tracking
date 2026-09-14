from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.user import StatusEnum

class OfferBase(BaseModel):
    name: str
    advertiser_name: str
    description: Optional[str] = None
    destination_url: str
    click_id_parameter: Optional[str] = None
    sub_id_parameter: Optional[str] = None
    status: StatusEnum = StatusEnum.ACTIVE

class OfferCreate(OfferBase):
    pass

class OfferUpdate(BaseModel):
    name: Optional[str] = None
    advertiser_name: Optional[str] = None
    description: Optional[str] = None
    destination_url: Optional[str] = None
    click_id_parameter: Optional[str] = None
    sub_id_parameter: Optional[str] = None
    status: Optional[StatusEnum] = None

class OfferResponse(OfferBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
